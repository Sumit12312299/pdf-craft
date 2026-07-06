import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
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

// 4. Compress PDF (Remove metadata & repack objects)
export async function compressPdf(pdfBuffer, compressionLevel) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  
  // Clean up metadata for extreme compression
  if (compressionLevel === 'high') {
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setCreator('');
    pdfDoc.setProducer('');
  }
  
  // pdf-lib's useObjectStreams optimizes cross-reference stream sizes
  return await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false
  });
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

// 10. Extract Text
export async function extractTextFromPdf(pdfBuffer, onProgress) {
  // Uses global window.pdfjsLib loaded from index.html CDN
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
    const pageText = textContent.items.map(item => item.str).join(' ');
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

// 14. Convert DOCX to PDF
export async function convertDocxToPdf(docxBuffer) {
  const zip = await JSZip.loadAsync(docxBuffer);
  const docXmlText = await zip.file('word/document.xml').async('text');
  
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXmlText, 'application/xml');
  const paragraphs = xmlDoc.getElementsByTagName('w:p');
  
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const textRuns = p.getElementsByTagName('w:t');
    let paragraphText = '';
    for (let j = 0; j < textRuns.length; j++) {
      paragraphText += textRuns[j].textContent;
    }
    
    if (!paragraphText.trim()) {
      y -= 15; // empty line
      continue;
    }
    
    const words = paragraphText.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, 11);
      if (testWidth > width - margin * 2) {
        if (y < margin + 20) {
          page = pdfDoc.addPage([595, 842]);
          y = height - margin;
        }
        page.drawText(line, { x: margin, y, size: 11, font });
        y -= 15;
        line = word;
      } else {
        line = testLine;
      }
    }
    
    if (line) {
      if (y < margin + 20) {
        page = pdfDoc.addPage([595, 842]);
        y = height - margin;
      }
      page.drawText(line, { x: margin, y, size: 11, font });
      y -= 20;
    }
  }
  
  return await pdfDoc.save();
}

// 15. Convert PPTX to PDF
export async function convertPptxToPdf(pptxBuffer) {
  const zip = await JSZip.loadAsync(pptxBuffer);
  
  const slideKeys = Object.keys(zip.files).filter(key => key.startsWith('ppt/slides/slide') && key.endsWith('.xml'));
  slideKeys.sort((a, b) => {
    const numA = parseInt(a.replace('ppt/slides/slide', '').replace('.xml', ''), 10);
    const numB = parseInt(b.replace('ppt/slides/slide', '').replace('.xml', ''), 10);
    return numA - numB;
  });
  
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
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
    
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    const { width, height } = page.getSize();
    
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
      color: rgb(0.98, 0.98, 0.98)
    });
    
    let y = height - 60;
    const margin = 50;
    
    const slideNumber = slideKey.replace('ppt/slides/slide', '').replace('.xml', '');
    page.drawText(`Slide ${slideNumber}`, { x: width - 80, y: 35, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
    
    for (let line of slideTextLines) {
      if (!line.trim()) continue;
      
      const words = line.split(' ');
      let lineText = '';
      for (const word of words) {
        const testLine = lineText + (lineText ? ' ' : '') + word;
        const testWidth = font.widthOfTextAtSize(testLine, 14);
        if (testWidth > width - margin * 2) {
          if (y > 50) {
            page.drawText(lineText, { x: margin, y, size: 14, font });
            y -= 22;
          }
          lineText = word;
        } else {
          lineText = testLine;
        }
      }
      if (lineText && y > 50) {
        page.drawText(lineText, { x: margin, y, size: 14, font });
        y -= 28;
      }
    }
  }
  
  return await pdfDoc.save();
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
    
    const lineGroups = {};
    for (const item of items) {
      const y = Math.round(item.transform[5] / 10) * 10;
      if (!lineGroups[y]) lineGroups[y] = [];
      lineGroups[y].push(item);
    }
    
    const sortedYs = Object.keys(lineGroups).sort((a, b) => b - a);
    
    for (const y of sortedYs) {
      const lineItems = lineGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);
      const lineText = lineItems.map(item => item.str).join(' ');
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
    
    const lineGroups = {};
    for (const item of items) {
      const y = Math.round(item.transform[5] / 10) * 10;
      if (!lineGroups[y]) lineGroups[y] = [];
      lineGroups[y].push(item);
    }
    
    const sortedYs = Object.keys(lineGroups).sort((a, b) => b - a);
    const lines = [];
    for (const y of sortedYs) {
      const lineItems = lineGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);
      const lineText = lineItems.map(item => item.str).join(' ');
      if (lineText.trim()) {
        lines.push(lineText);
      }
    }
    
    const slide = pptx.addSlide();
    slide.addText(`Slide ${i}`, { x: 0.5, y: 0.5, w: '90%', h: 0.5, fontSize: 18, bold: true, color: '475569' });
    
    if (lines.length > 0) {
      slide.addText(lines.join('\n'), {
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
  
  const outBuffer = await pptx.write('blob');
  return outBuffer;
}




