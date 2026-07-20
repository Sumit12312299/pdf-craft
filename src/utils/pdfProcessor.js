import { PDFDocument, rgb, degrees, StandardFonts, PDFName, PDFRawStream } from 'pdf-lib';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
import JSZip from 'jszip';
import { Document, Packer, Paragraph, TextRun, PageBreak } from 'docx';
import pptxgen from 'pptxgenjs';


// Helper to convert HEX to PDF-lib RGB colors (0 to 1 range)
function hexToRgbPercent(hex) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0;
  return { r, g, b };
}

// Helper to parse page range strings (e.g., "1-3, 5, 8-10")
export function parseRanges(rangeStr, maxPages) {
  if (!rangeStr || !rangeStr.trim()) {
    // Default to all pages if range is empty
    return Array.from({ length: maxPages }, (_, i) => i);
  }
  
  const pages = [];
  const parts = rangeStr.split(',');
  
  for (const part of parts) {
    const cleanPart = part.trim();
    if (cleanPart.includes('-')) {
      const [startStr, endStr] = cleanPart.split('-');
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);
      if (!isNaN(start) && !isNaN(end)) {
        const actualStart = Math.max(1, Math.min(start, maxPages));
        const actualEnd = Math.max(1, Math.min(end, maxPages));
        const direction = actualStart <= actualEnd ? 1 : -1;
        
        for (let i = actualStart; direction === 1 ? i <= actualEnd : i >= actualEnd; i += direction) {
          pages.push(i - 1);
        }
      }
    } else {
      const val = parseInt(cleanPart, 10);
      if (!isNaN(val) && val >= 1 && val <= maxPages) {
        pages.push(val - 1);
      }
    }
  }
  
  return [...new Set(pages)];
}

// 1. Merge PDFs
export async function mergePdfs(pdfBuffers) {
  const mergedPdf = await PDFDocument.create();
  
  for (const buffer of pdfBuffers) {
    const donorPdf = await PDFDocument.load(buffer);
    const pageIndices = donorPdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(donorPdf, pageIndices);
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  
  return await mergedPdf.save();
}

// 2. Split PDF
export async function splitPdf(pdfBuffer, rangeStr) {
  const srcPdf = await PDFDocument.load(pdfBuffer);
  const totalPages = srcPdf.getPageCount();
  const targetIndices = parseRanges(rangeStr, totalPages);
  
  if (targetIndices.length === 0) {
    throw new Error('Please enter a valid page range.');
  }
  
  const destPdf = await PDFDocument.create();
  const copiedPages = await destPdf.copyPages(srcPdf, targetIndices);
  copiedPages.forEach((page) => destPdf.addPage(page));
  
  return await destPdf.save();
}

// 3. Organize PDF (Reorder / Delete Pages)
export async function organizePdf(pdfBuffer, pageActions) {
  // pageActions is an array of objects: { index: number, rotation: number }
  // index is 0-indexed original page number
  const srcPdf = await PDFDocument.load(pdfBuffer);
  const destPdf = await PDFDocument.create();
  
  for (const action of pageActions) {
    const [copiedPage] = await destPdf.copyPages(srcPdf, [action.index]);
    
    // Apply additional rotation if specified
    if (action.rotation) {
      const currentRot = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentRot + action.rotation) % 360));
    }
    
    destPdf.addPage(copiedPage);
  }
  
  return await destPdf.save();
}

// Helper function to compress a single image using canvas re-encoding
async function compressImageBytes(bytes, quality, scale, grayscale = false) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([bytes]);
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        canvas.width = w;
        canvas.height = h;

        if (grayscale) {
          ctx.filter = 'grayscale(100%)';
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob((compressedBlob) => {
          if (!compressedBlob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(new Uint8Array(reader.result));
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(compressedBlob);
        }, 'image/jpeg', quality);
      } catch (err) {
        reject(err);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

// 4. Compress PDF (Structural Image Compression - Preserves Searchable Text Layer)
export async function compressPdf(pdfBuffer, compressionLevel, onProgress) {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    let scale = 0.7;
    let quality = 0.6;
    if (compressionLevel === 'high') {
      scale = 0.45;
      quality = 0.45;
    } else if (compressionLevel === 'low') {
      scale = 0.85;
      quality = 0.75;
    }

    const indirectObjects = pdfDoc.context.enumerateIndirectObjects();
    let totalImages = 0;
    let processedImages = 0;

    for (const [, object] of indirectObjects) {
      if (object instanceof PDFRawStream) {
        const dict = object.dict;
        if (dict.get(PDFName.of('Subtype')) === PDFName.of('Image')) {
          totalImages++;
        }
      }
    }

    if (totalImages === 0) {
      return await pdfDoc.save({ useObjectStreams: true });
    }

    for (const [ref, object] of indirectObjects) {
      if (object instanceof PDFRawStream) {
        const dict = object.dict;
        if (dict.get(PDFName.of('Subtype')) === PDFName.of('Image')) {
          try {
            const bytes = object.contents;
            const compressedBytes = await compressImageBytes(bytes, quality, scale, false);
            
            const newStream = pdfDoc.context.stream(compressedBytes, {
              Type: PDFName.of('XObject'),
              Subtype: PDFName.of('Image'),
              Width: dict.get(PDFName.of('Width')),
              Height: dict.get(PDFName.of('Height')),
              BitsPerComponent: dict.get(PDFName.of('BitsPerComponent')) || 8,
              ColorSpace: dict.get(PDFName.of('ColorSpace')),
              Filter: PDFName.of('DCTDecode'),
            });
            pdfDoc.context.assign(ref, newStream);
          } catch (err) {
            console.warn('Skipping image compression due to error:', err);
          }
          processedImages++;
          if (onProgress) {
            onProgress(Math.round((processedImages / totalImages) * 100));
          }
        }
      }
    }

    pdfDoc.setCreator('pdfCraft Compress Engine');
    pdfDoc.setProducer('pdfCraft Engine');

    return await pdfDoc.save({ useObjectStreams: true });
  } catch (err) {
    console.error('Error compressing PDF:', err);
    throw new Error('Failed to compress PDF. Please check the file format.');
  }
}

// 5. Rotate PDF (Global rotation)
export async function rotatePdf(pdfBuffer, angle) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  
  for (const page of pages) {
    const currentRot = page.getRotation().angle;
    page.setRotation(degrees((currentRot + angle) % 360));
  }
  
  return await pdfDoc.save();
}

// 6. Image to PDF
export async function imageToPdf(imageFiles, options) {
  // options: { layout: 'a4' | 'letter', orientation: 'portrait' | 'landscape', margin: 'none' | 'small' | 'large' }
  const pdfDoc = await PDFDocument.create();
  
  // Standard Dimensions (in points, 1 inch = 72 points)
  const DIMENSIONS = {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612.0, height: 792.0 }
  };
  
  const MARGINS = {
    none: 0,
    small: 18, // 0.25 inch
    large: 36  // 0.5 inch
  };
  
  const selectedLayout = DIMENSIONS[options.layout || 'a4'];
  const marginSize = MARGINS[options.margin || 'none'];
  
  const isLandscape = options.orientation === 'landscape';
  const pageWidth = isLandscape ? selectedLayout.height : selectedLayout.width;
  const pageHeight = isLandscape ? selectedLayout.width : selectedLayout.height;
  
  for (const imgFile of imageFiles) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Embed the image based on type
    let embeddedImg;
    const lowerName = imgFile.name.toLowerCase();
    
    if (lowerName.endsWith('.png')) {
      embeddedImg = await pdfDoc.embedPng(imgFile.buffer);
    } else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
      embeddedImg = await pdfDoc.embedJpg(imgFile.buffer);
    } else {
      throw new Error(`Unsupported image format: ${imgFile.name}. Only PNG and JPG are supported.`);
    }
    
    // Calculate usable dimensions
    const usableWidth = pageWidth - (marginSize * 2);
    const usableHeight = pageHeight - (marginSize * 2);
    
    // Scale image proportionally to fit within the usable area
    const { width: imgW, height: imgH } = embeddedImg.scale(1);
    const scale = Math.min(usableWidth / imgW, usableHeight / imgH);
    const finalW = imgW * scale;
    const finalH = imgH * scale;
    
    // Center the image in the page
    const x = marginSize + (usableWidth - finalW) / 2;
    const y = marginSize + (usableHeight - finalH) / 2;
    
    page.drawImage(embeddedImg, {
      x,
      y,
      width: finalW,
      height: finalH
    });
  }
  
  return await pdfDoc.save();
}

// 7. Add Page Numbers
export async function addPageNumbers(pdfBuffer, options) {
  // options: { position: string, style: string, startNumber: number, fontSize: number, color: string }
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontColor = hexToRgbPercent(options.color || '#475569');
  const size = options.fontSize || 9;
  const start = options.startNumber || 1;
  
  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const pageNumText = options.style === 'simple' 
      ? `${index + start}` 
      : `Page ${index + start} of ${pages.length + start - 1}`;
      
    const textWidth = font.widthOfTextAtSize(pageNumText, size);
    
    // Margin from boundaries
    const padding = 20;
    
    let x, y;
    
    // Y-coordinate positioning
    if (options.position.startsWith('top')) {
      y = height - padding - size;
    } else {
      y = padding;
    }
    
    // X-coordinate positioning
    if (options.position.endsWith('Left')) {
      x = padding;
    } else if (options.position.endsWith('Center')) {
      x = (width - textWidth) / 2;
    } else {
      x = width - padding - textWidth;
    }
    
    page.drawText(pageNumText, {
      x,
      y,
      size,
      font,
      color: rgb(fontColor.r, fontColor.g, fontColor.b)
    });
  });
  
  return await pdfDoc.save();
}

// 8. Add Watermark
export async function addWatermark(pdfBuffer, options) {
  // options: { text: string, opacity: number, size: number, rotation: number, color: string }
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const color = hexToRgbPercent(options.color || '#ef4444');
  const size = options.size || 48;
  const opacity = options.opacity !== undefined ? options.opacity : 0.3;
  const rotation = options.rotation !== undefined ? options.rotation : 45;
  const text = options.text || 'CONFIDENTIAL';
  
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, size);
    
    // Center of the page
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Estimate text height (using font size as a baseline)
    const textHeight = size * 0.75;
    
    // Draw text with rotation around center
    page.drawText(text, {
      x: centerX - (textWidth / 2) * Math.cos(rotation * Math.PI / 180),
      y: centerY - (textHeight / 2),
      size,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(rotation)
    });
  });
  
  return await pdfDoc.save();
}

// 9. Edit Metadata
export async function editMetadata(pdfBuffer, metadata) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  
  if (metadata.title !== undefined) pdfDoc.setTitle(metadata.title);
  if (metadata.author !== undefined) pdfDoc.setAuthor(metadata.author);
  if (metadata.subject !== undefined) pdfDoc.setSubject(metadata.subject);
  if (metadata.keywords !== undefined) pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
  if (metadata.creator !== undefined) pdfDoc.setCreator(metadata.creator);
  
  return await pdfDoc.save();
}

// 10. Extract Text (Structural & Formatted Paragraph Extraction)
export async function extractTextFromPdf(pdfBuffer, onProgress) {
  if (!window.pdfjsLib) {
    throw new Error('PDF.js library is not loaded yet. Please wait a moment.');
  }
  
  const loadingTask = window.pdfjsLib.getDocument({ data: pdfBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = '';
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items;
    
    const { lines } = extractStructuredLayout(items);
    let pageText = '';
    
    for (let j = 0; j < lines.length; j++) {
      const currentLine = lines[j];
      const lineText = currentLine.map(item => item.str).join(' ').trim();
      
      if (!lineText) continue;
      
      if (j === 0) {
        pageText += lineText;
      } else {
        // Find previous non-empty line
        let prevLine = null;
        for (let k = j - 1; k >= 0; k--) {
          const checkText = lines[k].map(item => item.str).join('').trim();
          if (checkText) {
            prevLine = lines[k];
            break;
          }
        }
        
        if (!prevLine) {
          pageText += lineText;
          continue;
        }
        
        const currentAvgY = currentLine.reduce((sum, item) => sum + item.transform[5], 0) / currentLine.length;
        const currentAvgH = currentLine.reduce((sum, item) => sum + (item.height || 12), 0) / currentLine.length;
        
        const prevAvgY = prevLine.reduce((sum, item) => sum + item.transform[5], 0) / prevLine.length;
        const prevAvgH = prevLine.reduce((sum, item) => sum + (item.height || 12), 0) / prevLine.length;
        
        const gap = prevAvgY - currentAvgY;
        const maxH = Math.max(currentAvgH, prevAvgH);
        
        const isListItem = /^[•\-*\d+.)]/.test(lineText);
        
        if (!isListItem && (gap > maxH * 1.95 || gap > 22)) {
          pageText += '\n\n' + lineText;
        } else {
          pageText += '\n' + lineText;
        }
      }
    }
    
    fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
    
    if (onProgress) {
      onProgress(Math.round((i / numPages) * 100));
    }
  }
  
  return fullText;
}

// 11. Stamp Signatures
export async function stampSignatures(pdfBuffer, signatures) {
  // signatures: Array of { pageIndex, dataUrl, x, y, width, height, pageW, pageH }
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  
  for (const sig of signatures) {
    const page = pages[sig.pageIndex];
    if (!page) continue;
    
    const { width: pdfPageW, height: pdfPageH } = page.getSize();
    
    // Embed the transparent PNG signature image
    const pngImage = await pdfDoc.embedPng(sig.dataUrl);
    
    // Translation ratios (UI pixels -> PDF points)
    const scaleX = pdfPageW / sig.pageW;
    const scaleY = pdfPageH / sig.pageH;
    
    const w = sig.width * scaleX;
    const h = sig.height * scaleY;
    const x = sig.x * scaleX;
    // Invert Y coordinate since PDF's origin is bottom-left and HTML is top-left
    const y = pdfPageH - ((sig.y + sig.height) * scaleY);
    
    page.drawImage(pngImage, {
      x,
      y,
      width: w,
      height: h
    });
  }
  
  return await pdfDoc.save();
}

// 12. Encrypt PDF with Password Protection
export async function encryptPdfFile(pdfBuffer, password, options = {}) {
  const pdfBytes = new Uint8Array(pdfBuffer);
  
  const config = {
    algorithm: options.algorithm || 'AES-256',
    ownerPassword: options.ownerPassword || password,
    allowPrinting: options.allowPrinting !== undefined ? options.allowPrinting : true,
    allowCopying: options.allowCopying !== undefined ? options.allowCopying : true,
    allowModifying: options.allowModifying !== undefined ? options.allowModifying : true,
    allowAnnotating: options.allowAnnotating !== undefined ? options.allowAnnotating : true,
    allowFillingForms: options.allowFillingForms !== undefined ? options.allowFillingForms : true,
  };
  
  const encryptedBytes = await encryptPDF(pdfBytes, password, config);
  return encryptedBytes;
}

// 13. Stamp QR Codes
export async function stampQrCode(pdfBuffer, qrStamps) {
  // qrStamps: Array of { pageIndex, dataUrl, x, y, width, height, pageW, pageH }
  return await stampSignatures(pdfBuffer, qrStamps);
}

// 13b. Unlock / Remove Password from PDF
export async function unlockPdf(pdfBuffer, password) {
  const pdfBytes = new Uint8Array(pdfBuffer);
  
  try {
    // Load the encrypted PDF using the provided password
    const pdfDoc = await PDFDocument.load(pdfBytes, {
      password,
      ignoreEncryption: false,
    });
    
    // Re-save without any encryption — this strips the password
    const unlockedBytes = await pdfDoc.save();
    return unlockedBytes;
  } catch (err) {
    if (err.message && (err.message.includes('password') || err.message.includes('encrypt') || err.message.includes('decrypt'))) {
      throw new Error('Incorrect password. Please check the password and try again.');
    }
    throw new Error('Failed to unlock PDF. The file may be corrupted or use unsupported encryption.');
  }
}

// 14. Convert DOCX to PDF
export async function convertDocxToPdf(docxBuffer) {
  if (!window.mammoth) {
    throw new Error('Mammoth library is not loaded. Please refresh the page and try again.');
  }
  if (!window.html2pdf) {
    throw new Error('html2pdf library is not loaded. Please refresh the page and try again.');
  }
  
  // 1. Convert DOCX to HTML
  const result = await window.mammoth.convertToHtml({ arrayBuffer: docxBuffer });
  const htmlContent = result.value; // The generated HTML
  
  // 2. Create a temporary container styled beautifully to resemble a clean document layout
  const tempDiv = document.createElement('div');
  tempDiv.id = 'docx-temp-render';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.width = '794px'; // A4 width at 96 DPI
  tempDiv.style.padding = '50px';
  tempDiv.style.boxSizing = 'border-box';
  tempDiv.style.fontFamily = '"Plus Jakarta Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
  tempDiv.style.fontSize = '14px';
  tempDiv.style.lineHeight = '1.6';
  tempDiv.style.color = '#1e293b';
  tempDiv.style.backgroundColor = '#ffffff';
  
  // Inject basic CSS rules to format the mammoth output cleanly
  tempDiv.innerHTML = `
    <style>
      #docx-temp-render * {
        box-sizing: border-box !important;
        max-width: 100% !important;
      }
      #docx-temp-render h1, #docx-temp-render h2, #docx-temp-render h3 {
        color: #0f172a;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        font-weight: 700;
      }
      #docx-temp-render h1 { font-size: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
      #docx-temp-render h2 { font-size: 20px; }
      #docx-temp-render h3 { font-size: 16px; }
      #docx-temp-render p { margin-bottom: 1rem; }
      #docx-temp-render img { max-width: 100% !important; height: auto !important; display: block; margin: 1rem auto; border-radius: 4px; }
      #docx-temp-render table { 
        width: 100% !important; 
        table-layout: fixed !important; 
        border-collapse: collapse; 
        margin: 1rem 0; 
      }
      #docx-temp-render th, #docx-temp-render td { 
        border: 1px solid #cbd5e1; 
        padding: 8px 12px; 
        text-align: left; 
        word-break: break-word !important; 
        overflow-wrap: break-word !important; 
        white-space: normal !important; 
      }
      #docx-temp-render th { background-color: #f1f5f9; font-weight: 600; }
      #docx-temp-render ul, #docx-temp-render ol { margin-bottom: 1rem; padding-left: 20px; }
      #docx-temp-render li { margin-bottom: 0.25rem; }
    </style>
    ${htmlContent}
  `;
  
  document.body.appendChild(tempDiv);
  
  // 3. Configure html2pdf options
  const opt = {
    margin: [15, 15, 15, 15], // margins in mm
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      letterRendering: true
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  try {
    // Generate PDF ArrayBuffer
    const pdfArrayBuffer = await window.html2pdf()
      .from(tempDiv)
      .set(opt)
      .outputPdf('arraybuffer');
      
    return new Uint8Array(pdfArrayBuffer);
  } finally {
    // Clean up temporary DOM element
    document.body.removeChild(tempDiv);
  }
}

// 15. Convert PPTX to PDF
export async function convertPptxToPdf(pptxBuffer) {
  if (!window.html2pdf) {
    throw new Error('html2pdf library is not loaded. Please refresh the page and try again.');
  }
  
  const zip = await JSZip.loadAsync(pptxBuffer);
  const slideKeys = Object.keys(zip.files).filter(key => key.startsWith('ppt/slides/slide') && key.endsWith('.xml'));
  slideKeys.sort((a, b) => {
    const numA = parseInt(a.replace('ppt/slides/slide', '').replace('.xml', ''), 10);
    const numB = parseInt(b.replace('ppt/slides/slide', '').replace('.xml', ''), 10);
    return numA - numB;
  });
  
  // Create a container for slides html rendering
  const tempDiv = document.createElement('div');
  tempDiv.id = 'pptx-temp-render';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.width = '1123px'; // A4 Landscape width at 96 DPI
  tempDiv.style.boxSizing = 'border-box';
  tempDiv.style.fontFamily = '"Plus Jakarta Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
  tempDiv.style.color = '#1e293b';
  tempDiv.style.backgroundColor = '#ffffff';
  
  let slidesHtml = `
    <style>
      .pptx-slide {
        width: 1123px;
        height: 794px; /* A4 Landscape height */
        padding: 60px;
        box-sizing: border-box;
        border: 1px solid #cbd5e1;
        background-color: #f8fafc;
        position: relative;
        page-break-after: always;
        display: flex;
        flex-direction: column;
      }
      .pptx-slide-title {
        font-size: 32px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 2rem;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 0.5rem;
      }
      .pptx-slide-content {
        font-size: 20px;
        line-height: 1.6;
        color: #334155;
        white-space: pre-wrap;
        flex-grow: 1;
      }
      .pptx-slide-number {
        position: absolute;
        bottom: 30px;
        right: 40px;
        font-size: 14px;
        color: #64748b;
      }
    </style>
  `;
  
  for (const slideKey of slideKeys) {
    const slideXmlText = await zip.file(slideKey).async('text');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(slideXmlText, 'application/xml');
    
    const textElements = xmlDoc.getElementsByTagName('a:t');
    let slideTextLines = [];
    let currentLine = '';
    
    for (let i = 0; i < textElements.length; i++) {
      const text = textElements[i].textContent;
      if (text.includes('\n')) {
        slideTextLines.push(currentLine);
        currentLine = '';
      } else {
        currentLine += text;
      }
    }
    if (currentLine) {
      slideTextLines.push(currentLine);
    }
    
    const slideNumber = slideKey.replace('ppt/slides/slide', '').replace('.xml', '');
    const cleanLines = slideTextLines.filter(line => line.trim());
    
    const slideTitle = cleanLines.length > 0 ? cleanLines[0] : `Slide ${slideNumber}`;
    const slideBody = cleanLines.slice(1).join('\n');
    
    slidesHtml += `
      <div class="pptx-slide">
        <div class="pptx-slide-title">${slideTitle}</div>
        <div class="pptx-slide-content">${slideBody}</div>
        <div class="pptx-slide-number">Slide ${slideNumber}</div>
      </div>
    `;
  }
  
  tempDiv.innerHTML = slidesHtml;
  document.body.appendChild(tempDiv);
  
  const opt = {
    margin: [0, 0, 0, 0],
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      letterRendering: true
    },
    jsPDF: { unit: 'px', format: [1123, 794], orientation: 'landscape' }
  };
  
  try {
    const pdfArrayBuffer = await window.html2pdf()
      .from(tempDiv)
      .set(opt)
      .outputPdf('arraybuffer');
      
    return new Uint8Array(pdfArrayBuffer);
  } finally {
    document.body.removeChild(tempDiv);
  }
}

// 16. Convert PDF to DOCX
// Shared helper to extract structured layout from PDF page text items (Dynamic Line & Column grouping)
function extractStructuredLayout(items) {
  if (!items || items.length === 0) return { lines: [], columns: [] };

  const lines = [];
  // Sort items by Y coordinate descending (top of the page first)
  const sortedItems = [...items].sort((a, b) => b.transform[5] - a.transform[5]);

  for (const item of sortedItems) {
    const y = item.transform[5];

    // Find if there is an existing line within dynamic Y tolerance
    let placed = false;
    for (const line of lines) {
      const avgY = line.reduce((sum, it) => sum + it.transform[5], 0) / line.length;
      const avgH = line.reduce((sum, it) => sum + (it.height || 12), 0) / line.length;
      const tolerance = Math.max(avgH * 0.65, 6);
      if (Math.abs(y - avgY) <= tolerance) {
        line.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) {
      lines.push([item]);
    }
  }

  // Sort each line horizontally (left to right)
  for (const line of lines) {
    line.sort((a, b) => a.transform[4] - b.transform[4]);
  }

  // Sort all lines vertically by average Y coordinate descending
  lines.sort((a, b) => {
    const avgYa = a.reduce((sum, it) => sum + it.transform[5], 0) / a.length;
    const avgYb = b.reduce((sum, it) => sum + it.transform[5], 0) / b.length;
    return avgYb - avgYa;
  });

  // Identify column intervals
  const colIntervals = [];
  for (const line of lines) {
    for (const item of line) {
      const xStart = item.transform[4];
      const xEnd = xStart + (item.width || 0);
      colIntervals.push({ start: xStart, end: xEnd });
    }
  }
  
  colIntervals.sort((a, b) => a.start - b.start);

  const columns = [];
  for (const interval of colIntervals) {
    if (columns.length === 0) {
      columns.push({ ...interval });
    } else {
      const lastCol = columns[columns.length - 1];
      const gap = interval.start - lastCol.end;
      // Gap threshold for column merging (18 points is typical word/column spacer boundary)
      if (gap <= 18) {
        lastCol.end = Math.max(lastCol.end, interval.end);
      } else {
        columns.push({ ...interval });
      }
    }
  }

  return { lines, columns };
}

// 16. Convert PDF to DOCX
export async function convertPdfToDocx(pdfBuffer, onProgress) {
  if (!window.pdfjsLib) {
    throw new Error('PDF.js is not loaded yet.');
  }
  const loadingTask = window.pdfjsLib.getDocument({ data: pdfBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const docChildren = [];
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items;
    
    const { lines } = extractStructuredLayout(items);
    
    for (const line of lines) {
      const lineText = line.map(item => item.str).join(' ');
      if (lineText.trim()) {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: lineText, size: 24 })],
            spacing: { after: 120 }
          })
        );
      }
    }
    
    if (i < numPages) {
      docChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }
    
    if (onProgress) {
      onProgress(Math.round((i / numPages) * 100));
    }
  }
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: docChildren
    }]
  });
  
  const outBuffer = await Packer.toBlob(doc);
  return outBuffer;
}

// 17. Convert PDF to PPTX
export async function convertPdfToPptx(pdfBuffer, onProgress) {
  if (!window.pdfjsLib) {
    throw new Error('PDF.js is not loaded yet.');
  }
  const loadingTask = window.pdfjsLib.getDocument({ data: pdfBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  
  const pptx = new pptxgen();
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items;
    
    const { lines } = extractStructuredLayout(items);
    const pageLinesText = [];
    
    for (const line of lines) {
      const lineText = line.map(item => item.str).join(' ');
      if (lineText.trim()) {
        pageLinesText.push(lineText);
      }
    }
    
    const slide = pptx.addSlide();
    slide.addText(`Slide ${i}`, { x: 0.5, y: 0.5, w: '90%', h: 0.5, fontSize: 18, bold: true, color: '475569' });
    
    if (pageLinesText.length > 0) {
      slide.addText(pageLinesText.join('\n'), {
        x: 0.5,
        y: 1.2,
        w: 9.0,
        h: 4.5,
        fontSize: 12,
        color: '1E293B',
        vertical: 'top',
        breakLine: true
      });
    }
    
    if (onProgress) {
      onProgress(Math.round((i / numPages) * 100));
    }
  }
  
  const outBuffer = pptx.write('blob');
  return outBuffer;
}

// 18. Convert Excel (XLSX) to PDF
export async function convertXlsxToPdf(xlsxBuffer) {
  if (!window.XLSX) {
    throw new Error('SheetJS library is not loaded. Please refresh the page and try again.');
  }
  if (!window.html2pdf) {
    throw new Error('html2pdf library is not loaded. Please refresh the page and try again.');
  }

  // Read workbook
  const workbook = window.XLSX.read(xlsxBuffer, { type: 'array' });
  
  // Render each sheet to HTML tables inside a container
  const tempDiv = document.createElement('div');
  tempDiv.id = 'xlsx-temp-render';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.width = '1123px'; // Match A4 landscape width at 96 DPI
  tempDiv.style.padding = '40px';
  tempDiv.style.boxSizing = 'border-box';
  tempDiv.style.fontFamily = '"Plus Jakarta Sans", Arial, sans-serif';
  tempDiv.style.backgroundColor = '#ffffff';

  let sheetsHtml = `
    <style>
      .xlsx-sheet { 
        margin-bottom: 3rem; 
        page-break-after: always; 
        box-sizing: border-box !important; 
        max-width: 100% !important; 
      }
      .xlsx-sheet * {
        box-sizing: border-box !important;
        max-width: 100% !important;
      }
      .xlsx-sheet-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 1rem; border-bottom: 2px solid #dc2626; padding-bottom: 0.5rem; }
      .xlsx-table { 
        width: 100% !important; 
        table-layout: fixed !important; 
        word-wrap: break-word !important; 
        border-collapse: collapse; 
        margin-bottom: 1.5rem; 
        font-size: 12px; 
      }
      .xlsx-table th, .xlsx-table td { 
        border: 1px solid #cbd5e1; 
        padding: 6px 10px; 
        text-align: left; 
        word-break: break-word !important; 
        overflow-wrap: break-word !important; 
        white-space: normal !important; 
      }
      .xlsx-table th { background-color: #f1f5f9; font-weight: 600; color: #334155; }
      .xlsx-table tr:nth-child(even) { background-color: #f8fafc; }
    </style>
  `;

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const tableHtml = window.XLSX.utils.sheet_to_html(worksheet, { header: '', footer: '' });
    const cleanTableHtml = tableHtml.replace('<table>', '<table class="xlsx-table">');

    sheetsHtml += `
      <div class="xlsx-sheet">
        <div class="xlsx-sheet-title">Sheet: ${sheetName}</div>
        ${cleanTableHtml}
      </div>
    `;
  });

  tempDiv.innerHTML = sheetsHtml;
  document.body.appendChild(tempDiv);

  const opt = {
    margin: [15, 15, 15, 15],
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1.5, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  try {
    const pdfArrayBuffer = await window.html2pdf()
      .from(tempDiv)
      .set(opt)
      .outputPdf('arraybuffer');
      
    return new Uint8Array(pdfArrayBuffer);
  } finally {
    document.body.removeChild(tempDiv);
  }
}

// 19. Convert HTML to PDF
export async function convertHtmlToPdf(htmlBuffer) {
  if (!window.html2pdf) {
    throw new Error('html2pdf library is not loaded. Please refresh the page and try again.');
  }

  const decoder = new TextDecoder('utf-8');
  const htmlContent = decoder.decode(htmlBuffer);

  const tempDiv = document.createElement('div');
  tempDiv.id = 'html-temp-render';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.width = '800px';
  tempDiv.style.padding = '30px';
  tempDiv.style.boxSizing = 'border-box';
  tempDiv.style.backgroundColor = '#ffffff';
  tempDiv.innerHTML = htmlContent;

  document.body.appendChild(tempDiv);

  const opt = {
    margin: [15, 15, 15, 15],
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1.5, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    const pdfArrayBuffer = await window.html2pdf()
      .from(tempDiv)
      .set(opt)
      .outputPdf('arraybuffer');
      
    return new Uint8Array(pdfArrayBuffer);
  } finally {
    document.body.removeChild(tempDiv);
  }
}

// 20. Convert PDF to Excel (XLSX)
export async function convertPdfToXlsx(pdfBuffer, onProgress) {
  if (!window.pdfjsLib) {
    throw new Error('PDF.js is not loaded yet.');
  }
  if (!window.XLSX) {
    throw new Error('SheetJS library is not loaded.');
  }

  const loadingTask = window.pdfjsLib.getDocument({ data: pdfBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  
  const workbook = window.XLSX.utils.book_new();

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items;

    const { lines, columns } = extractStructuredLayout(items);
    const sheetData = [];

    for (const line of lines) {
      const rowCells = Array(columns.length).fill('');
      
      for (const item of line) {
        const xStart = item.transform[4];
        const xEnd = xStart + (item.width || 0);
        const xMid = (xStart + xEnd) / 2;

        let bestColIdx = 0;
        let minDistance = Infinity;

        for (let c = 0; c < columns.length; c++) {
          const col = columns[c];
          if (xMid >= col.start && xMid <= col.end) {
            bestColIdx = c;
            break;
          }
          const colMid = (col.start + col.end) / 2;
          const dist = Math.abs(xMid - colMid);
          if (dist < minDistance) {
            minDistance = dist;
            bestColIdx = c;
          }
        }

        rowCells[bestColIdx] += (rowCells[bestColIdx] ? ' ' : '') + item.str;
      }

      // Add row only if it has at least one cell with non-empty content
      if (rowCells.some(cell => cell.trim() !== '')) {
        sheetData.push(rowCells);
      }
    }

    const worksheet = window.XLSX.utils.aoa_to_sheet(sheetData);
    window.XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${i}`);

    if (onProgress) {
      onProgress(Math.round((i / numPages) * 100));
    }
  }

  const excelOut = window.XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelOut], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// 21. Convert PDF to PDF/A
export async function convertPdfToPdfA(pdfBuffer) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  
  pdfDoc.setCreator('pdfCraft PDF/A Archiver');
  pdfDoc.setProducer('pdfCraft Engine');
  
  const xmpMetadata = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
    xmlns:xmp="http://ns.xap/1.0/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
   <pdf:Producer>pdfCraft Engine</pdf:Producer>
   <xmp:CreatorTool>pdfCraft PDF/A Archiver</xmp:CreatorTool>
   <xmp:CreateDate>${new Date().toISOString()}</xmp:CreateDate>
   <xmp:ModifyDate>${new Date().toISOString()}</xmp:ModifyDate>
   <dc:format>application/pdf</dc:format>
   <pdfaid:part>1</pdfaid:part>
   <pdfaid:conformance>B</pdfaid:conformance>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  const metadataStream = pdfDoc.context.stream(xmpMetadata, {
    Type: 'Metadata',
    Subtype: 'XML',
  });
  const metadataStreamRef = pdfDoc.context.register(metadataStream);
  pdfDoc.catalog.set(pdfDoc.context.obj('Metadata'), metadataStreamRef);

  return await pdfDoc.save();
}

// 22. Convert PDF to Grayscale (Ink-Saver - Structural Image Grayscale)
export async function convertToGrayscalePdf(pdfBuffer, onProgress) {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const indirectObjects = pdfDoc.context.enumerateIndirectObjects();
    let totalImages = 0;
    let processedImages = 0;

    for (const [, object] of indirectObjects) {
      if (object instanceof PDFRawStream) {
        const dict = object.dict;
        if (dict.get(PDFName.of('Subtype')) === PDFName.of('Image')) {
          totalImages++;
        }
      }
    }

    if (totalImages === 0) {
      return await pdfDoc.save({ useObjectStreams: true });
    }

    for (const [ref, object] of indirectObjects) {
      if (object instanceof PDFRawStream) {
        const dict = object.dict;
        if (dict.get(PDFName.of('Subtype')) === PDFName.of('Image')) {
          try {
            const bytes = object.contents;
            const compressedBytes = await compressImageBytes(bytes, 0.85, 1.0, true);
            
            const newStream = pdfDoc.context.stream(compressedBytes, {
              Type: PDFName.of('XObject'),
              Subtype: PDFName.of('Image'),
              Width: dict.get(PDFName.of('Width')),
              Height: dict.get(PDFName.of('Height')),
              BitsPerComponent: dict.get(PDFName.of('BitsPerComponent')) || 8,
              ColorSpace: PDFName.of('DeviceGray'),
              Filter: PDFName.of('DCTDecode'),
            });
            pdfDoc.context.assign(ref, newStream);
          } catch (err) {
            console.warn('Skipping image grayscale conversion due to error:', err);
          }
          processedImages++;
          if (onProgress) {
            onProgress(Math.round((processedImages / totalImages) * 100));
          }
        }
      }
    }

    pdfDoc.setCreator('pdfCraft Grayscale Engine');
    pdfDoc.setProducer('pdfCraft Engine');

    return await pdfDoc.save({ useObjectStreams: true });
  } catch (err) {
    console.error('Error converting PDF to grayscale:', err);
    throw new Error('Failed to convert PDF to grayscale.');
  }
}

// 23. Crop PDF pages visually
export async function cropPdf(pdfBuffer, cropMargins, onProgress) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  const numPages = pages.length;

  for (let i = 0; i < numPages; i++) {
    const page = pages[i];
    const { x, y, width, height } = page.getMediaBox();

    // cropMargins has left, right, top, bottom in percentages (0 to 100)
    let margins = { top: 0, bottom: 0, left: 0, right: 0 };
    if (cropMargins) {
      if (typeof cropMargins.top === 'number') {
        margins = cropMargins;
      } else if (Array.isArray(cropMargins) && cropMargins[i]) {
        margins = cropMargins[i];
      } else if (cropMargins[i]) {
        margins = cropMargins[i];
      }
    }

    const leftPx = (margins.left / 100) * width;
    const rightPx = (margins.right / 100) * width;
    const topPx = (margins.top / 100) * height;
    const bottomPx = (margins.bottom / 100) * height;

    const newX = x + leftPx;
    const newY = y + bottomPx;
    const newWidth = Math.max(10, width - leftPx - rightPx);
    const newHeight = Math.max(10, height - topPx - bottomPx);

    page.setCropBox(newX, newY, newWidth, newHeight);
    page.setMediaBox(newX, newY, newWidth, newHeight);

    if (onProgress) {
      onProgress(Math.round(((i + 1) / numPages) * 100));
    }
  }

  return await pdfDoc.save();
}

// 24. Extract Images from PDF using PDF.js Resolved Objects
export async function extractImagesFromPdf(pdfBuffer, onProgress) {
  if (!window.pdfjsLib) {
    throw new Error('PDF.js library is not loaded.');
  }
  
  const loadingTask = window.pdfjsLib.getDocument({ data: pdfBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const extractedImages = [];
  let imageIndex = 1;
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const ops = await page.getOperatorList();
    
    for (let j = 0; j < ops.fnArray.length; j++) {
      const fn = ops.fnArray[j];
      const isPaintImage = fn === window.pdfjsLib.OPS.paintImageXObject;
      const isInlineImage = fn === window.pdfjsLib.OPS.paintInlineImage;
      
      if (isPaintImage || isInlineImage) {
        const objId = ops.argsArray[j][0];
        try {
          const img = await new Promise((resolve) => {
            let attempts = 0;
            const checkObj = () => {
              const o = page.objs.get(objId);
              if (o) {
                resolve(o);
              } else {
                attempts++;
                if (attempts > 50) {
                  // Fallback: resolve null if takes too long
                  resolve(null);
                } else {
                  setTimeout(checkObj, 30);
                }
              }
            };
            checkObj();
          });
          
          if (img && img.width && img.height) {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            let imgData;
            if (img.data instanceof Uint8ClampedArray) {
              if (img.data.length === img.width * img.height * 3) {
                const rgba = new Uint8ClampedArray(img.width * img.height * 4);
                for (let k = 0, l = 0; k < img.data.length; k += 3, l += 4) {
                  rgba[l] = img.data[k];
                  rgba[l+1] = img.data[k+1];
                  rgba[l+2] = img.data[k+2];
                  rgba[l+3] = 255;
                }
                imgData = new ImageData(rgba, img.width, img.height);
              } else {
                imgData = new ImageData(img.data, img.width, img.height);
              }
            } else if (img.data instanceof Uint8Array) {
              const clamped = new Uint8ClampedArray(img.data);
              imgData = new ImageData(clamped, img.width, img.height);
            }
            
            if (imgData) {
              ctx.putImageData(imgData, 0, 0);
              const dataUrl = canvas.toDataURL('image/png');
              const response = await fetch(dataUrl);
              const arrayBuffer = await response.arrayBuffer();
              
              extractedImages.push({
                name: `extracted_page_${i}_img_${imageIndex}.png`,
                dataUrl,
                bytes: new Uint8Array(arrayBuffer),
                width: img.width,
                height: img.height
              });
              imageIndex++;
            }
          }
        } catch (err) {
          console.warn('Failed to extract image object:', objId, err);
        }
      }
    }
    
    if (onProgress) {
      onProgress(Math.round((i / numPages) * 100));
    }
  }
  
  return extractedImages;
}

// 25. Resize PDF Pages with Aspect Ratio Options
export async function resizePdfPages(pdfBuffer, targetSize, orientation, scaleOption = 'fit') {
  const srcPdf = await PDFDocument.load(pdfBuffer);
  const destPdf = await PDFDocument.create();
  const numPages = srcPdf.getPageCount();
  
  const sizes = {
    A4: { width: 595.28, height: 841.89 },
    Letter: { width: 612, height: 792 },
    A3: { width: 841.89, height: 1190.55 },
    A5: { width: 419.53, height: 595.28 },
    Legal: { width: 612, height: 1008 }
  };
  
  const dims = sizes[targetSize] || sizes.A4;
  const pageW = orientation === 'landscape' ? dims.height : dims.width;
  const pageH = orientation === 'landscape' ? dims.width : dims.height;
  
  for (let i = 0; i < numPages; i++) {
    const [embeddedPage] = await destPdf.embedPages([srcPdf.getPage(i)]);
    const { width: origW, height: origH } = srcPdf.getPage(i).getSize();
    
    const destPage = destPdf.addPage([pageW, pageH]);
    
    let scaleX = pageW / origW;
    let scaleY = pageH / origH;
    
    if (scaleOption === 'fit') {
      const scale = Math.min(scaleX, scaleY);
      scaleX = scale;
      scaleY = scale;
    }
    
    const newW = origW * scaleX;
    const newH = origH * scaleY;
    
    const xOffset = (pageW - newW) / 2;
    const yOffset = (pageH - newH) / 2;
    
    destPage.drawPage(embeddedPage, {
      x: xOffset,
      y: yOffset,
      width: newW,
      height: newH
    });
  }
  
  destPdf.setCreator('pdfCraft Resize Engine');
  destPdf.setProducer('pdfCraft Engine');
  
  return await destPdf.save({ useObjectStreams: true });
}

// 26. Parse PDF Hyperlinks
export async function getPdfHyperlinks(pdfBuffer) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  const links = [];
  
  pages.forEach((page, pageIndex) => {
    const annots = page.node.Annots();
    if (annots) {
      for (let i = 0; i < annots.size(); i++) {
        const annotRef = annots.get(i);
        const annot = pdfDoc.context.lookup(annotRef);
        if (annot && annot.get(PDFName.of('Subtype')) === PDFName.of('Link')) {
          const rect = annot.get(PDFName.of('Rect'));
          const action = annot.get(PDFName.of('A'));
          let url = '';
          if (action) {
            const uriDict = pdfDoc.context.lookup(action);
            if (uriDict && uriDict.get(PDFName.of('S')) === PDFName.of('URI')) {
              const uri = uriDict.get(PDFName.of('URI'));
              url = uri.toString();
              if (url.startsWith('(') && url.endsWith(')')) {
                url = url.substring(1, url.length - 1);
              }
            }
          }
          
          let rectArr = [];
          if (rect) {
            rectArr = rect.asArray().map(v => v.value);
          }
          
          links.push({
            id: `${pageIndex}-${i}`,
            pageIndex,
            annotIndex: i,
            rect: rectArr,
            url
          });
        }
      }
    }
  });
  return links;
}

// 27. Update / Save PDF Hyperlinks (updates, deletes, adds)
export async function savePdfHyperlinks(pdfBuffer, actions) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  
  const pageActions = {};
  for (const action of actions) {
    if (!pageActions[action.pageIndex]) {
      pageActions[action.pageIndex] = [];
    }
    pageActions[action.pageIndex].push(action);
  }
  
  for (const pageIdxStr of Object.keys(pageActions)) {
    const pageIndex = parseInt(pageIdxStr, 10);
    const page = pages[pageIndex];
    const pageActionsList = pageActions[pageIdxStr];
    
    const updates = pageActionsList.filter(a => a.type === 'update');
    const deletes = pageActionsList.filter(a => a.type === 'delete').sort((a, b) => b.annotIndex - a.annotIndex);
    const adds = pageActionsList.filter(a => a.type === 'add');
    
    let annots = page.node.Annots();
    
    for (const update of updates) {
      if (annots) {
        const annotRef = annots.get(update.annotIndex);
        const annot = pdfDoc.context.lookup(annotRef);
        if (annot) {
          let action = annot.get(PDFName.of('A'));
          if (!action) {
            action = pdfDoc.context.obj({
              Type: PDFName.of('Action'),
              S: PDFName.of('URI'),
              URI: update.url
            });
            annot.set(PDFName.of('A'), action);
          } else {
            const uriDict = pdfDoc.context.lookup(action);
            if (uriDict) {
              uriDict.set(PDFName.of('URI'), pdfDoc.context.obj(update.url));
            }
          }
        }
      }
    }
    
    for (const del of deletes) {
      if (annots) {
        annots.remove(del.annotIndex);
      }
    }
    
    for (const add of adds) {
      if (!annots) {
        annots = pdfDoc.context.obj([]);
        page.node.set(PDFName.of('Annots'), annots);
      }
      
      const rect = pdfDoc.context.obj([
        add.rect[0],
        add.rect[1],
        add.rect[2],
        add.rect[3]
      ]);
      
      const action = pdfDoc.context.obj({
        Type: PDFName.of('Action'),
        S: PDFName.of('URI'),
        URI: add.url
      });
      
      const linkAnnot = pdfDoc.context.obj({
        Type: PDFName.of('Annot'),
        Subtype: PDFName.of('Link'),
        Rect: rect,
        A: action,
        Border: pdfDoc.context.obj([0, 0, 0])
      });
      
      const linkRef = pdfDoc.context.register(linkAnnot);
      annots.push(linkRef);
    }
  }
  
  return await pdfDoc.save();
}

// 27. Offline OCR on PDF (Scanned Image/PDF to text)
export async function performOcrOnPdf(pdfBuffer, onProgress) {
  if (!window.Tesseract) {
    throw new Error('Tesseract.js library is not loaded.');
  }
  if (!window.pdfjsLib) {
    throw new Error('PDF.js library is not loaded.');
  }

  const loadingTask = window.pdfjsLib.getDocument({ data: pdfBuffer.slice(0) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = '';

  const worker = await window.Tesseract.createWorker('eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(m.progress);
      }
    }
  });

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // high res for OCR
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    await page.render({ canvasContext: context, viewport }).promise;

    const imageData = canvas.toDataURL('image/png');
    const ret = await worker.recognize(imageData);
    fullText += `--- Page ${i} ---\n\n${ret.data.text}\n\n`;
  }

  await worker.terminate();
  return fullText;
}

// 28. Offline OCR on Image file
export async function performOcrOnImage(imageBuffer, onProgress) {
  if (!window.Tesseract) {
    throw new Error('Tesseract.js library is not loaded.');
  }

  const worker = await window.Tesseract.createWorker('eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(m.progress);
      }
    }
  });

  const blob = new Blob([imageBuffer]);
  const url = URL.createObjectURL(blob);
  const ret = await worker.recognize(url);
  URL.revokeObjectURL(url);
  await worker.terminate();
  return ret.data.text;
}

// 29. Get PDF Form Fields (AcroForms)
export async function getPdfFormFields(pdfBuffer) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  return fields.map(field => {
    const name = field.getName();
    const constructorName = field.constructor.name;
    let type = 'unknown';
    let value = '';
    let options = [];
    
    if (constructorName === 'PDFTextField') {
      type = 'text';
      value = field.getText() || '';
    } else if (constructorName === 'PDFCheckBox') {
      type = 'checkbox';
      value = field.isChecked();
    } else if (constructorName === 'PDFRadioGroup') {
      type = 'radio';
      value = field.getSelected() || '';
      options = field.getOptions();
    } else if (constructorName === 'PDFDropdown') {
      type = 'dropdown';
      value = field.getSelected() || [];
      options = field.getOptions();
    } else if (constructorName === 'PDFOptionList') {
      type = 'list';
      value = field.getSelected() || [];
      options = field.getOptions();
    } else if (constructorName === 'PDFButton') {
      type = 'button';
    }
    
    return { name, type, value, options };
  });
}

// 30. Save PDF Form Fields (AcroForms)
export async function savePdfFormFields(pdfBuffer, fieldValues) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const form = pdfDoc.getForm();
  
  for (const [name, val] of Object.entries(fieldValues)) {
    try {
      const field = form.getField(name);
      const constructorName = field.constructor.name;
      
      if (constructorName === 'PDFTextField') {
        field.setText(String(val));
      } else if (constructorName === 'PDFCheckBox') {
        if (val) {
          field.check();
        } else {
          field.uncheck();
        }
      } else if (constructorName === 'PDFRadioGroup') {
        field.select(String(val));
      } else if (constructorName === 'PDFDropdown') {
        field.select(val);
      } else if (constructorName === 'PDFOptionList') {
        field.select(val);
      }
    } catch (e) {
      console.warn(`Could not set field ${name}:`, e);
    }
  }
  
  return await pdfDoc.save();
}

// 25. Redact PDF (Visual Blackout / Permanent Censorship)
export async function redactPdf(pdfBuffer, redactions) {
  // redactions: Array of { pageIndex, x, y, width, height, pageW, pageH, color }
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();

  for (const item of redactions) {
    const page = pages[item.pageIndex];
    if (!page) continue;

    const { width: pdfPageW, height: pdfPageH } = page.getSize();

    // Scale factors from HTML UI container to PDF point dimensions
    const scaleX = pdfPageW / item.pageW;
    const scaleY = pdfPageH / item.pageH;

    const w = item.width * scaleX;
    const h = item.height * scaleY;
    const x = item.x * scaleX;
    // Invert Y coordinate because PDF origin is bottom-left
    const y = pdfPageH - ((item.y + item.height) * scaleY);

    const boxColor = hexToRgbPercent(item.color || '#000000');

    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      color: rgb(boxColor.r, boxColor.g, boxColor.b)
    });
  }

  pdfDoc.setCreator('pdfCraft Redaction Engine');
  pdfDoc.setProducer('pdfCraft Engine');

  return await pdfDoc.save();
}



