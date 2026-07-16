import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import {
  Combine,
  Scissors,
  Layers,
  RotateCw,
  Sliders,
  Image as ImageIcon,
  FileImage,
  Hash,
  Type,
  Settings,
  Download,
  UploadCloud,
  Trash2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sun,
  Moon,
  Info,
  FileText,
  PenTool,
  Lock,
  LockOpen,
  QrCode,
  Share2,
  Copy,
  ChevronDown,
  Menu,
  X,
  Eye,
  Printer,
  GripVertical,
  Crop,
  Scan
} from 'lucide-react';

import {
  mergePdfs,
  splitPdf,
  organizePdf,
  compressPdf,
  rotatePdf,
  imageToPdf,
  addPageNumbers,
  addWatermark,
  editMetadata,
  extractTextFromPdf,
  stampSignatures,
  encryptPdfFile,
  unlockPdf,
  stampQrCode,
  convertDocxToPdf,
  convertPptxToPdf,
  convertPdfToDocx,
  convertPdfToPptx,
  convertXlsxToPdf,
  convertHtmlToPdf,
  convertPdfToXlsx,
  convertPdfToPdfA,
  convertToGrayscalePdf,
  cropPdf
} from './utils/pdfProcessor';

// Beautiful Custom SVG Icons representing document conversions
const IconJpgToPdf = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="3" y="3" width="18" height="22" rx="3" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" />
    <path d="M6 18 L11 12 L18 19 H6Z" fill="#eab308" />
    <circle cx="15" cy="10" r="1.5" fill="#eab308" />
    <path d="M22 22 L28 28 M28 24 L28 28 L24 28" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconWordToPdf = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="3" y="3" width="18" height="22" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
    <text x="7" y="18" fill="#1d4ed8" fontSize="11" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">W</text>
    <path d="M22 22 L28 28 M28 24 L28 28 L24 28" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPptToPdf = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="3" y="3" width="18" height="22" rx="3" fill="#ffedd5" stroke="#f97316" strokeWidth="1.5" />
    <text x="8" y="18" fill="#c2410c" fontSize="11" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">P</text>
    <path d="M22 22 L28 28 M28 24 L28 28 L24 28" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconExcelToPdf = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="3" y="3" width="18" height="22" rx="3" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5" />
    <text x="8" y="18" fill="#047857" fontSize="11" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">X</text>
    <path d="M22 22 L28 28 M28 24 L28 28 L24 28" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconHtmlToPdf = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="3" y="3" width="18" height="22" rx="3" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" />
    <circle cx="12" cy="14" r="5" stroke="#a16207" strokeWidth="1.2" />
    <path d="M7 14 H17" stroke="#a16207" strokeWidth="0.8" />
    <path d="M12 9 A5 5 0 0 0 12 19" stroke="#a16207" strokeWidth="0.8" />
    <path d="M22 22 L28 28 M28 24 L28 28 L24 28" stroke="#854d0e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPdfToJpg = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="9" y="5" width="18" height="22" rx="3" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" />
    <path d="M12 20 L17 14 L24 21 H12Z" fill="#eab308" />
    <circle cx="21" cy="12" r="1.5" fill="#eab308" />
    <path d="M10 10 L4 4 M4 8 L4 4 L8 4" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPdfToWord = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="9" y="5" width="18" height="22" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
    <text x="13" y="20" fill="#1d4ed8" fontSize="11" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">W</text>
    <path d="M10 10 L4 4 M4 8 L4 4 L8 4" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPdfToPpt = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="9" y="5" width="18" height="22" rx="3" fill="#ffedd5" stroke="#f97316" strokeWidth="1.5" />
    <text x="14" y="20" fill="#c2410c" fontSize="11" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">P</text>
    <path d="M10 10 L4 4 M4 8 L4 4 L8 4" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPdfToExcel = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="9" y="5" width="18" height="22" rx="3" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5" />
    <text x="14" y="20" fill="#047857" fontSize="11" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">X</text>
    <path d="M10 10 L4 4 M4 8 L4 4 L8 4" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPdfToPdfA = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="9" y="5" width="18" height="22" rx="3" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
    <text x="10" y="20" fill="#0369a1" fontSize="9" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">/A</text>
    <path d="M10 10 L4 4 M4 8 L4 4 L8 4" stroke="#075985" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Parallel/Batch PDF Page Pre-renderer to Cache Base64 Images
const renderPdfPagesToImages = async (fileBuffer, onProgress) => {
  if (!window.pdfjsLib) {
    // Wait briefly if PDF.js is not loaded yet
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!window.pdfjsLib) return [];
  }

  try {
    const loadingTask = window.pdfjsLib.getDocument({ data: fileBuffer.slice(0) });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pagePreviews = [];

    // Helper to render a single page to JPEG dataURL
    const renderPage = async (pageNum) => {
      const page = await pdf.getPage(pageNum);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Scale 0.35 is perfect for file cards and very fast to render
      const viewport = page.getViewport({ scale: 0.35 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // JPEG is fast and lightweight

      return {
        originalIndex: pageNum - 1,
        dataUrl,
        width: viewport.width,
        height: viewport.height
      };
    };

    // Process in batches of 4 to prevent UI lockup and memory overhead
    const batchSize = 4;
    for (let i = 1; i <= numPages; i += batchSize) {
      const batch = [];
      for (let j = i; j < i + batchSize && j <= numPages; j++) {
        batch.push(renderPage(j));
      }
      const results = await Promise.all(batch);
      pagePreviews.push(...results);

      if (onProgress) {
        onProgress(Math.round((Math.min(i + batchSize - 1, numPages) / numPages) * 100));
      }
    }

    return pagePreviews;
  } catch (err) {
    console.error('Error pre-rendering PDF pages:', err);
    return [];
  }
};

// Download Trigger Utility
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const getPositionStyle = (pos) => {
  switch (pos) {
    case 'topLeft':
      return { top: '8px', left: '8px' };
    case 'topCenter':
      return { top: '8px', left: '50%', transform: 'translateX(-50%)' };
    case 'topRight':
      return { top: '8px', right: '8px' };
    case 'bottomLeft':
      return { bottom: '8px', left: '8px' };
    case 'bottomCenter':
      return { bottom: '8px', left: '50%', transform: 'translateX(-50%)' };
    case 'bottomRight':
    default:
      return { bottom: '8px', right: '8px' };
  }
};

// Draw QR Code with custom top and bottom spacing plus a custom text label
const drawQrWithLabelAndSpacing = async (
  qrDataUrl,
  fgColor,
  bgColor,
  qrSize,
  labelText,
  labelFontSize,
  topSpace,
  bottomSpace,
  textPosition = 'bottom'
) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(qrDataUrl);
        return;
      }

      const width = qrSize;
      const height = qrSize + topSpace + bottomSpace;

      canvas.width = width;
      canvas.height = height;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Draw QR Code
      ctx.drawImage(img, 0, topSpace, qrSize, qrSize);

      // Draw text label if provided
      if (labelText && labelText.trim() !== '') {
        ctx.fillStyle = fgColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${labelFontSize}px sans-serif`;

        // Wrap text to fit inside the QR width (minus 20px padding)
        const words = labelText.split(' ');
        let lines = [];
        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const widthTest = ctx.measureText(currentLine + ' ' + word).width;
          if (widthTest < qrSize - 20) {
            currentLine += ' ' + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);

        const lineHeight = labelFontSize * 1.25;
        const totalTextHeight = lines.length * lineHeight;

        if (textPosition === 'bottom') {
          // Center the text block inside the bottomSpace
          let startY = topSpace + qrSize + (bottomSpace - totalTextHeight) / 2 + lineHeight / 2;
          lines.forEach(line => {
            ctx.fillText(line, qrSize / 2, startY);
            startY += lineHeight;
          });
        } else if (textPosition === 'top') {
          // Center the text block inside the topSpace
          let startY = (topSpace - totalTextHeight) / 2 + lineHeight / 2;
          lines.forEach(line => {
            ctx.fillText(line, qrSize / 2, startY);
            startY += lineHeight;
          });
        }
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = qrDataUrl;
  });
};

function App() {
  // Theme state
  const [theme, setTheme] = useState('light');

  // Scroll state for shrinking/blurring navbar
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3D Hero Card Ref and Handlers
  const heroCardRef = useRef(null);

  const handleHeroMouseMove = (e) => {
    if (!heroCardRef.current) return;
    const card = heroCardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const normX = x / (rect.width / 2);
    const normY = y / (rect.height / 2);
    
    const tiltX = -normY * 15;
    const tiltY = normX * 15;
    
    card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  };

  const handleHeroMouseLeave = () => {
    if (!heroCardRef.current) return;
    heroCardRef.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
  };

  // Navigation
  const [activeTool, setActiveTool] = useState(null);
  const [gridMenuOpen, setGridMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('all');

  // File States
  const [uploadedFiles, setUploadedFiles] = useState([]); // { file, buffer, pageCount, name, size, type, previewUrl, firstPagePreview }
  const [dragActive, setDragActive] = useState(false);

  // Pre-rendered Page Cache for Organize, Split, and Sign tools
  const [pagePreviews, setPagePreviews] = useState([]); // Array of { originalIndex, dataUrl }
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);

  // Processing States
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState('');

  // Results
  const [resultBlob, setResultBlob] = useState(null);
  const [resultName, setResultName] = useState('');

  // Tool-Specific Options
  const [splitRanges, setSplitRanges] = useState('');
  const [selectedPagesForSplit, setSelectedPagesForSplit] = useState(new Set()); // Set of 0-based indices
  const [compressLevel, setCompressLevel] = useState('recommended'); // high, recommended, low
  const [globalRotation, setGlobalRotation] = useState(90); // 90, 180, 270

  const [watermarkOptions, setWatermarkOptions] = useState({
    text: 'CONFIDENTIAL',
    opacity: 0.3,
    size: 48,
    rotation: 45,
    color: '#ef4444'
  });

  const [pageNumberOptions, setPageNumberOptions] = useState({
    position: 'bottomRight',
    style: 'simple',
    startNumber: 1,
    fontSize: 10,
    color: '#475569'
  });

  const [imgToPdfOptions, setImgToPdfOptions] = useState({
    layout: 'a4',
    orientation: 'portrait',
    margin: 'none'
  });

  const [metadataOptions, setMetadataOptions] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: 'PDFCraft Online'
  });

  // Protect PDF States
  const [protectPassword, setProtectPassword] = useState('');
  const [protectOptions, setProtectOptions] = useState({
    allowPrinting: true,
    allowCopying: true,
    allowModifying: true,
    algorithm: 'AES-256'
  });

  // QR Code States (for PDF Stamp tool)
  const [qrText, setQrText] = useState('https://pdfcraft.online');
  const [qrFgColor, setQrFgColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState('');

  // QR Generator (standalone tool) States
  const [qrGenText, setQrGenText] = useState('https://');
  const [qrGenFgColor, setQrGenFgColor] = useState('#000000');
  const [qrGenBgColor, setQrGenBgColor] = useState('#ffffff');
  const [qrGenSize, setQrGenSize] = useState(300);
  const [qrGenDataUrl, setQrGenDataUrl] = useState('');
  const [qrGenError, setQrGenError] = useState('');
  const [qrGenLabelText, setQrGenLabelText] = useState('');
  const [qrGenLabelFontSize, setQrGenLabelFontSize] = useState(18);
  const [qrGenTopSpace, setQrGenTopSpace] = useState(20);
  const [qrGenBottomSpace, setQrGenBottomSpace] = useState(20);
  const [qrGenLabelPosition, setQrGenLabelPosition] = useState('bottom');
  // Crop States
  const [cropMargins, setCropMargins] = useState({ top: 10, bottom: 10, left: 10, right: 10 });
  const [activePageToCrop, setActivePageToCrop] = useState(null);
  const [highResCropPageUrl, setHighResCropPageUrl] = useState(null); // hi-res render of current crop page
  const [placedCrops, setPlacedCrops] = useState({}); // mapping of pageIndex -> { top, bottom, left, right }

  // Signature States
  const [signatureDataUrl, setSignatureDataUrl] = useState(null); // Drawn signature PNG or QR Code PNG
  const [signatureAspectRatio, setSignatureAspectRatio] = useState(2); // width / height
  const [placedSignatures, setPlacedSignatures] = useState([]); // Array of { pageIndex, dataUrl, x, y, width, height, pageW, pageH }
  const [activePageToSign, setActivePageToSign] = useState(null); // index of page being stamped
  const [highResSignPageUrl, setHighResSignPageUrl] = useState(null); // hi-res render of current stamp page
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({ blob: null, name: '', type: '' });
  const [sigPos, setSigPos] = useState({ x: 50, y: 50, w: 120, h: 60 });
  const [renderedPageDimensions, setRenderedPageDimensions] = useState({ w: 0, h: 0 });

  // Signature Zoom and Pan States
  const [canvasZoom, setCanvasZoom] = useState(2);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [previewModalImage, setPreviewModalImage] = useState(null);
  const [previewModalTitle, setPreviewModalTitle] = useState('');

  // Scanner Tool States
  const [scannerImage, setScannerImage] = useState(null);
  const [scannerImageSrc, setScannerImageSrc] = useState(null);
  const [scannerImageDimensions, setScannerImageDimensions] = useState({ w: 0, h: 0 });
  const [scannerCrop, setScannerCrop] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const [scannerFilter, setScannerFilter] = useState('magic');
  const [scannerResolution, setScannerResolution] = useState('2x');
  const [scannerRotation, setScannerRotation] = useState(0);
  const [activeDragHandle, setActiveDragHandle] = useState(null);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
  const [lightboxLoading, setLightboxLoading] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [previewModalRotation, setPreviewModalRotation] = useState(0);
  const [isHighResRendered, setIsHighResRendered] = useState(false);
  const [previewModalPageIndex, setPreviewModalPageIndex] = useState(null);

  const openLightbox = async (fileObj, pageIndex, fallbackUrl, title, rotation = 0) => {
    setPreviewModalTitle(title || fileObj?.name || 'Page Preview');
    setPreviewModalRotation(rotation);
    setPreviewModalImage(fallbackUrl); // Show fallback instantly
    setPreviewModalPageIndex(pageIndex);
    setIsHighResRendered(false);

    // Render high-res version on-demand if it's a PDF and we have the buffer
    if (fileObj && fileObj.buffer && (fileObj.name?.toLowerCase().endsWith('.pdf') || fileObj.file?.name?.toLowerCase().endsWith('.pdf'))) {
      setLightboxLoading(true);
      try {
        if (window.pdfjsLib) {
          const loadingTask = window.pdfjsLib.getDocument({ data: fileObj.buffer.slice(0) });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(pageIndex + 1);

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          // Render at scale 2.0 for ultra-crisp retina quality text
          // Combine inherent page rotation with the custom rotation (mod 360)
          const inherentRotation = page.rotation || 0;
          const totalRotation = (inherentRotation + rotation) % 360;
          const viewport = page.getViewport({ scale: 2.0, rotation: totalRotation });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;
          const highResDataUrl = canvas.toDataURL('image/jpeg', 0.95);

          setPreviewModalImage(highResDataUrl);
          setIsHighResRendered(true);
        }
      } catch (err) {
        console.error('Error rendering high-res preview:', err);
      } finally {
        setLightboxLoading(false);
      }
    }
  };

  // Crop an image dataUrl using margin percentages and return a new cropped dataUrl
  const getCroppedDataUrl = (dataUrl, cropObj) => {
    return new Promise((resolve) => {
      if (!cropObj) { resolve(dataUrl); return; }
      const img = new Image();
      img.onload = () => {
        const { top, bottom, left, right } = cropObj;
        const srcX = (left / 100) * img.width;
        const srcY = (top / 100) * img.height;
        const srcW = img.width - (left / 100) * img.width - (right / 100) * img.width;
        const srcH = img.height - (top / 100) * img.height - (bottom / 100) * img.height;
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(srcW));
        canvas.height = Math.max(1, Math.round(srcH));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, Math.round(srcW), Math.round(srcH));
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const signatureCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const pageImageRef = useRef(null);

  // Text Extraction Results
  const [extractedText, setExtractedText] = useState('');

  // Page level organize actions (for organize tool)
  const [organizePages, setOrganizePages] = useState([]); // Array of { id, originalIndex, rotation }
  const [draggedPageIndex, setDraggedPageIndex] = useState(null);

  // Reset Zoom and Pan when active page to sign changes
  useEffect(() => {
    setCanvasZoom(2);
    setPanPos({ x: 0, y: 0 });
  }, [activePageToSign]);

  // Reset Zoom and Pan when active page to crop changes
  useEffect(() => {
    setCanvasZoom(2);
    setPanPos({ x: 0, y: 0 });
  }, [activePageToCrop]);

  // Render high-res page image whenever signature placement page changes
  useEffect(() => {
    setHighResSignPageUrl(null);
    if (activePageToSign === null || !uploadedFiles[0]?.buffer) return;
    let cancelled = false;
    (async () => {
      try {
        if (window.pdfjsLib) {
          const loadingTask = window.pdfjsLib.getDocument({ data: uploadedFiles[0].buffer.slice(0) });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(activePageToSign + 1);
          const viewport = page.getViewport({ scale: 2.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          if (!cancelled) setHighResSignPageUrl(canvas.toDataURL('image/jpeg', 0.95));
        }
      } catch (err) {
        console.error('Hi-res sign page render failed:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [activePageToSign]);

  // Render high-res page image whenever crop page changes
  useEffect(() => {
    setHighResCropPageUrl(null);
    if (activePageToCrop === null || !uploadedFiles[0]?.buffer) return;
    let cancelled = false;
    (async () => {
      try {
        if (window.pdfjsLib) {
          const loadingTask = window.pdfjsLib.getDocument({ data: uploadedFiles[0].buffer.slice(0) });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(activePageToCrop + 1);
          const viewport = page.getViewport({ scale: 2.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          if (!cancelled) setHighResCropPageUrl(canvas.toDataURL('image/jpeg', 0.95));
        }
      } catch (err) {
        console.error('Hi-res crop page render failed:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [activePageToCrop]);

  // Initializing Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('pdf-craft-theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle Android/Mobile Physical Back Button
  // When a tool is opened, push a fake history state so the back button returns to home
  useEffect(() => {
    if (activeTool !== null) {
      // Push a state so back button has somewhere to go
      window.history.pushState({ tool: activeTool }, '', window.location.href);
    }
  }, [activeTool]);

  useEffect(() => {
    const handlePopState = (e) => {
      // If we're inside a tool, intercept the back button and go home
      if (activeTool !== null) {
        e.preventDefault();
        resetToolState();
        setActiveTool(null);
        // Push state again so the next back press is also intercepted if needed
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTool]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('pdf-craft-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // QR Code Real-time generation effect
  useEffect(() => {
    if (activeTool === 'qr') {
      QRCode.toDataURL(qrText || ' ', {
        color: {
          dark: qrFgColor,
          light: qrBgColor
        },
        margin: 1,
        width: 300
      })
        .then(url => {
          setQrDataUrl(url);
          setSignatureDataUrl(url); // Map QR code to reuse signature visual placement components!
          setSignatureAspectRatio(1); // QR is always square (1:1 ratio)
        })
        .catch(err => console.error(err));
    }
  }, [qrText, qrFgColor, qrBgColor, activeTool]);

  // Standalone QR Generator real-time generation
  useEffect(() => {
    if (activeTool === 'qr-generator') {
      if (!qrGenText.trim()) {
        setQrGenDataUrl('');
        setQrGenError('Please enter a URL or text to generate QR code.');
        return;
      }
      setQrGenError('');
      QRCode.toDataURL(qrGenText, {
        color: {
          dark: qrGenFgColor,
          light: qrGenBgColor
        },
        margin: 2,
        width: qrGenSize,
        errorCorrectionLevel: 'H'
      })
        .then(async (rawUrl) => {
          try {
            const finalUrl = await drawQrWithLabelAndSpacing(
              rawUrl,
              qrGenFgColor,
              qrGenBgColor,
              qrGenSize,
              qrGenLabelText,
              qrGenLabelFontSize,
              qrGenTopSpace,
              qrGenBottomSpace,
              qrGenLabelPosition
            );
            setQrGenDataUrl(finalUrl);
          } catch (canvasErr) {
            console.error(canvasErr);
            setQrGenDataUrl(rawUrl);
          }
        })
        .catch(err => {
          setQrGenError('Failed to generate QR code: ' + err.message);
          setQrGenDataUrl('');
        });
    }
  }, [
    qrGenText,
    qrGenFgColor,
    qrGenBgColor,
    qrGenSize,
    qrGenLabelText,
    qrGenLabelFontSize,
    qrGenTopSpace,
    qrGenBottomSpace,
    qrGenLabelPosition,
    activeTool
  ]);

  // Scanner tool image loading
  useEffect(() => {
    if (activeTool === 'scanner' && uploadedFiles.length > 0) {
      const file = uploadedFiles[0];
      const src = file.previewUrl;
      setScannerImageSrc(src);
      
      const img = new Image();
      img.onload = () => {
        setScannerImage(img);
        setScannerImageDimensions({ w: img.width, h: img.height });
        setScannerCrop({ x: 10, y: 10, w: 80, h: 80 });
      };
      img.src = src;
    } else {
      setScannerImage(null);
      setScannerImageSrc(null);
    }
  }, [uploadedFiles, activeTool]);

  const handlePointerDown = (e, handle) => {
    e.preventDefault();
    setActiveDragHandle(handle);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setDragStartOffset({ x: clientX, y: clientY });
  };

  const handlePointerMove = (e) => {
    if (!activeDragHandle || !scannerImage) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX === undefined || clientY === undefined) return;

    const container = document.querySelector('.scanner-preview-wrapper');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    
    // Convert movement to percentage
    const dx = ((clientX - dragStartOffset.x) / rect.width) * 100;
    const dy = ((clientY - dragStartOffset.y) / rect.height) * 100;
    
    setDragStartOffset({ x: clientX, y: clientY });
    
    setScannerCrop(prev => {
      let { x, y, w, h } = prev;
      const minSize = 10;
      
      if (activeDragHandle === 'center') {
        x = Math.max(0, Math.min(100 - w, x + dx));
        y = Math.max(0, Math.min(100 - h, y + dy));
      } else if (activeDragHandle === 'tl') {
        const newX = Math.max(0, Math.min(x + w - minSize, x + dx));
        w = w - (newX - x);
        x = newX;
        const newY = Math.max(0, Math.min(y + h - minSize, y + dy));
        h = h - (newY - y);
        y = newY;
      } else if (activeDragHandle === 'tr') {
        w = Math.max(minSize, Math.min(100 - x, w + dx));
        const newY = Math.max(0, Math.min(y + h - minSize, y + dy));
        h = h - (newY - y);
        y = newY;
      } else if (activeDragHandle === 'bl') {
        const newX = Math.max(0, Math.min(x + w - minSize, x + dx));
        w = w - (newX - x);
        x = newX;
        h = Math.max(minSize, Math.min(100 - y, h + dy));
      } else if (activeDragHandle === 'br') {
        w = Math.max(minSize, Math.min(100 - x, w + dx));
        h = Math.max(minSize, Math.min(100 - y, h + dy));
      }
      
      return { x, y, w, h };
    });
  };

  const handlePointerUp = () => {
    setActiveDragHandle(null);
  };

  useEffect(() => {
    if (activeDragHandle) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [activeDragHandle, dragStartOffset]);

  const handleScannerRotate = () => {
    if (!scannerImage) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = scannerImage.height;
    canvas.height = scannerImage.width;
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(scannerImage, -scannerImage.width / 2, -scannerImage.height / 2);
    
    const rotatedSrc = canvas.toDataURL('image/jpeg', 0.95);
    setScannerImageSrc(rotatedSrc);
    
    const img = new Image();
    img.onload = () => {
      setScannerImage(img);
      setScannerImageDimensions({ w: img.width, h: img.height });
      setScannerCrop({ x: 10, y: 10, w: 80, h: 80 });
    };
    img.src = rotatedSrc;
  };

  const processScannerImage = async (format) => {
    if (!scannerImage) return;
    setProcessing(true);
    setProgress(10);
    setProcessingStatus('Scanning image at high resolution...');
    
    try {
      const scaleMap = { '1x': 1, '2x': 2, '3x': 3 };
      const scale = scaleMap[scannerResolution] || 2;
      
      const srcX = (scannerCrop.x / 100) * scannerImage.width;
      const srcY = (scannerCrop.y / 100) * scannerImage.height;
      const srcW = (scannerCrop.w / 100) * scannerImage.width;
      const srcH = (scannerCrop.h / 100) * scannerImage.height;
      
      const destW = Math.round(srcW * scale);
      const destH = Math.round(srcH * scale);
      
      const canvas = document.createElement('canvas');
      canvas.width = destW;
      canvas.height = destH;
      const ctx = canvas.getContext('2d');
      
      if (scannerFilter === 'magic') {
        ctx.filter = 'contrast(1.35) brightness(1.08) saturate(1.2)';
      } else if (scannerFilter === 'bw') {
        ctx.filter = 'grayscale(1) contrast(3.5) brightness(1.05)';
      } else if (scannerFilter === 'grayscale') {
        ctx.filter = 'grayscale(1) contrast(1.2) brightness(1.05)';
      } else {
        ctx.filter = 'none';
      }
      
      ctx.drawImage(scannerImage, srcX, srcY, srcW, srcH, 0, 0, destW, destH);
      setProgress(50);
      setProcessingStatus('Encoding output files...');
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const resBytes = await fetch(dataUrl).then(res => res.arrayBuffer());
      setProgress(80);
      
      const originalName = uploadedFiles[0]?.name || 'scanned_doc';
      const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      
      if (format === 'pdf') {
        setProcessingStatus('Compiling scanned PDF document...');
        const imageFiles = [{
          name: `${baseName}_scanned.jpg`,
          buffer: new Uint8Array(resBytes)
        }];
        const pdfBytes = await imageToPdf(imageFiles, { layout: 'a4', orientation: destH > destW ? 'portrait' : 'landscape', margin: 'none' });
        
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        setResultBlob(blob);
        setResultName(`${baseName}_scanned.pdf`);
      } else {
        const blob = new Blob([resBytes], { type: 'image/jpeg' });
        setResultBlob(blob);
        setResultName(`${baseName}_scanned.jpg`);
      }
      
      setProgress(100);
      setProcessing(false);
    } catch (err) {
      console.error(err);
      setError('An error occurred while scanning and processing the image.');
      setProcessing(false);
    }
  };

  // Define tools catalog
  const tools = [
    {
      id: 'merge',
      title: 'Merge PDF',
      description: 'Combine multiple PDF files into a single document in any order you choose.',
      icon: <Combine size={24} />,
      category: 'Organize',
      multiple: true,
      accept: '.pdf'
    },
    {
      id: 'split',
      title: 'Split PDF',
      description: 'Extract specific pages or page ranges from a PDF document into a new file.',
      icon: <Scissors size={24} />,
      category: 'Organize',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'organize',
      title: 'Organize PDF',
      description: 'Visually sort, rotate, and delete pages of a PDF to restructure the document.',
      icon: <Layers size={24} />,
      category: 'Organize',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'sign',
      title: 'Sign PDF',
      description: 'Draw or upload your signature, then visually place and resize it on any page of the PDF.',
      icon: <PenTool size={24} />,
      category: 'Edits',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'qr',
      title: 'Stamp QR Code',
      description: 'Generate a QR code from text or URLs and visually stamp it on any page of the PDF.',
      icon: <QrCode size={24} />,
      category: 'Edits',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'protect',
      title: 'Protect PDF',
      description: 'Encrypt your PDF with a secure password to restrict unauthorized opening or modifications.',
      icon: <Lock size={24} />,
      category: 'Security',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'unlock',
      title: 'Unlock PDF',
      description: 'Remove password protection from a PDF file. Enter the current password to unlock it.',
      icon: <LockOpen size={24} />,
      category: 'Security',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'compress',
      title: 'Compress PDF',
      description: 'Reduce the file size of your PDF while maintaining optimal visual quality.',
      icon: <Sliders size={24} />,
      category: 'Optimize',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'rotate',
      title: 'Rotate PDF',
      description: 'Rotate the pages of your PDF document (90, 180, or 270 degrees).',
      icon: <RotateCw size={24} />,
      category: 'Organize',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'img-to-pdf',
      title: 'JPG to PDF',
      description: 'Convert JPG, JPEG, and PNG images into a clean, paginated PDF file.',
      icon: <IconJpgToPdf size={28} />,
      category: 'Convert to PDF',
      multiple: true,
      accept: '.jpg,.jpeg,.png'
    },
    {
      id: 'docx-to-pdf',
      title: 'Word to PDF',
      description: 'Convert Microsoft Word (.docx) files into clean, readable PDF documents client-side.',
      icon: <IconWordToPdf size={28} />,
      category: 'Convert to PDF',
      multiple: false,
      accept: '.docx'
    },
    {
      id: 'pptx-to-pdf',
      title: 'PowerPoint to PDF',
      description: 'Convert PowerPoint (.pptx) presentation slides into a PDF document client-side.',
      icon: <IconPptToPdf size={28} />,
      category: 'Convert to PDF',
      multiple: false,
      accept: '.pptx'
    },
    {
      id: 'xlsx-to-pdf',
      title: 'Excel to PDF',
      description: 'Convert Excel spreadsheets (.xlsx, .xls) into clean, tabular PDF documents client-side.',
      icon: <IconExcelToPdf size={28} />,
      category: 'Convert to PDF',
      multiple: false,
      accept: '.xlsx,.xls'
    },
    {
      id: 'html-to-pdf',
      title: 'HTML to PDF',
      description: 'Convert web page HTML files into a structured PDF document client-side.',
      icon: <IconHtmlToPdf size={28} />,
      category: 'Convert to PDF',
      multiple: false,
      accept: '.html,.htm'
    },
    {
      id: 'pdf-to-img',
      title: 'PDF to JPG',
      description: 'Convert and extract every page of a PDF document into standard JPG images.',
      icon: <IconPdfToJpg size={28} />,
      category: 'Convert from PDF',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'extract-text',
      title: 'Extract Text',
      description: 'Perform text extraction to get all textual content from a PDF document.',
      icon: <FileText size={24} />,
      category: 'Convert from PDF',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'pdf-to-docx',
      title: 'PDF to Word',
      description: 'Convert your PDF document into an editable Microsoft Word DOCX file client-side.',
      icon: <IconPdfToWord size={28} />,
      category: 'Convert from PDF',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'pdf-to-pptx',
      title: 'PDF to PowerPoint',
      description: 'Convert your PDF pages into editable PowerPoint slides (.pptx) client-side.',
      icon: <IconPdfToPpt size={28} />,
      category: 'Convert from PDF',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'pdf-to-xlsx',
      title: 'PDF to Excel',
      description: 'Extract tables and structured rows from your PDF into an Excel spreadsheet (.xlsx) client-side.',
      icon: <IconPdfToExcel size={28} />,
      category: 'Convert from PDF',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'pdf-to-pdfa',
      title: 'PDF to PDF/A',
      description: 'Convert your PDF to standard PDF/A-1b format for long-term archiving and compliance.',
      icon: <IconPdfToPdfA size={28} />,
      category: 'Convert from PDF',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'page-numbers',
      title: 'Add Page Numbers',
      description: 'Customize and stamp page numbers on pages with layout controls.',
      icon: <Hash size={24} />,
      category: 'Edits',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'watermark',
      title: 'Add Watermark',
      description: 'Overlay custom text watermarks with control over color, rotation, and opacity.',
      icon: <Type size={24} />,
      category: 'Edits',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'metadata',
      title: 'Edit Metadata',
      description: 'Update the metadata fields of your PDF (Author, Title, Creator, Subject, Keywords).',
      icon: <Settings size={24} />,
      category: 'Edits',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'crop',
      title: 'Crop PDF',
      description: 'Visually crop margins or selected sections of your PDF pages easily.',
      icon: <Crop size={24} />,
      category: 'Edits',
      multiple: false,
      accept: '.pdf'
    },
    {
      id: 'qr-generator',
      title: 'QR Code Generator',
      description: 'Convert any link or text into a downloadable QR code image instantly.',
      icon: <QrCode size={24} />,
      category: 'Utilities',
      multiple: false,
      accept: null // No file needed
    },
    {
      id: 'scanner',
      title: 'Doc Scanner',
      description: 'Scan images, crop margins, apply high-contrast scanning filters, and save as high-res PDF/JPG.',
      icon: <Scan size={24} />,
      category: 'Utilities',
      multiple: false,
      accept: '.jpg,.jpeg,.png'
    },
    {
      id: 'grayscale',
      title: 'Grayscale PDF',
      description: 'Convert your PDF pages to grayscale (black & white) to save printer ink and toner.',
      icon: <Printer size={24} />,
      category: 'Optimize',
      multiple: false,
      accept: '.pdf'
    }
  ];

  const currentTool = tools.find(t => t.id === activeTool);

  // Background Cache Loader for Uploaded PDF Files
  const loadPagePreviews = async (buffer) => {
    setLoadingPreviews(true);
    setPreviewProgress(10);
    try {
      const previews = await renderPdfPagesToImages(buffer, (prog) => {
        setPreviewProgress(Math.max(10, prog));
      });
      setPagePreviews(previews);
      setLoadingPreviews(false);
      return previews;
    } catch (e) {
      console.error(e);
      setLoadingPreviews(false);
    }
    return [];
  };

  // Main file uploading process
  const handleFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    setError('');

    const newFiles = [];
    const accepts = currentTool?.accept ? currentTool.accept.split(',') : [];

    for (const file of filesList) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (accepts.length > 0 && !accepts.includes(ext) && !accepts.includes(ext.replace('jpeg', 'jpg'))) {
        setError(`Invalid file type. Only ${currentTool.accept} files are supported.`);
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();
        let pageCount = 0;
        let firstPagePreview = '';

        if (ext === '.pdf') {
          // Read page count and pre-render page 1 for the upload preview card
          if (window.pdfjsLib) {
            const loadingTask = window.pdfjsLib.getDocument({ data: buffer.slice(0) });
            const pdf = await loadingTask.promise;
            pageCount = pdf.numPages;

            // Render first page immediately as file icon preview
            const page = await pdf.getPage(1);
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: 0.25 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport }).promise;
            firstPagePreview = canvas.toDataURL('image/jpeg', 0.8);
          }
        } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          // It is an image file
          firstPagePreview = URL.createObjectURL(file);
        } else {
          // Word, PowerPoint, or other format
          firstPagePreview = '';
        }

        newFiles.push({
          file,
          buffer,
          pageCount,
          name: file.name,
          size: file.size,
          previewUrl: URL.createObjectURL(file),
          firstPagePreview
        });
      } catch (err) {
        console.error(err);
        setError(`Failed to read file: ${file.name}`);
      }
    }

    if (newFiles.length === 0) return;

    if (currentTool?.multiple) {
      const mergedList = [...uploadedFiles, ...newFiles];
      setUploadedFiles(mergedList);
    } else {
      const singleFile = newFiles[0];
      setUploadedFiles([singleFile]);

      // Trigger background thumbnail pre-rendering if PDF
      if (singleFile.pageCount > 0) {
        const previews = await loadPagePreviews(singleFile.buffer);

        // Initialize organize list for organize tool
        if (currentTool?.id === 'organize') {
          const pages = Array.from({ length: singleFile.pageCount }, (_, i) => ({
            id: `page-${Date.now()}-${i}-${Math.random()}`,
            originalIndex: i,
            rotation: 0
          }));
          setOrganizePages(pages);
        }
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...uploadedFiles];
    URL.revokeObjectURL(newFiles[index].previewUrl);
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);

    // Clear preview cache if all files are cleared
    if (newFiles.length === 0) {
      setPagePreviews([]);
      setOrganizePages([]);
      setSelectedPagesForSplit(new Set());
      setPlacedSignatures([]);
      setActivePageToSign(null);
      setActivePageToCrop(null);
      setPlacedCrops({});
    }
  };

  const resetToolState = () => {
    uploadedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setUploadedFiles([]);
    setPagePreviews([]);
    setOrganizePages([]);
    setSelectedPagesForSplit(new Set());
    setPlacedSignatures([]);
    setActivePageToSign(null);
    setActivePageToCrop(null);
    setCropMargins({ top: 10, bottom: 10, left: 10, right: 10 });
    setPlacedCrops({});
    setResultBlob(null);
    
    // Reset scanner states
    setScannerImage(null);
    setScannerImageSrc(null);
    setScannerCrop({ x: 10, y: 10, w: 80, h: 80 });
    setScannerFilter('magic');
    setScannerResolution('2x');
    setScannerRotation(0);
    setActiveDragHandle(null);
    setResultName('');
    setProcessing(false);
    setProgress(0);
    setProcessingStatus('');
    setError('');
    setExtractedText('');

    // Reset specific tool settings
    setSplitRanges('');
    setGlobalRotation(90);
    setWatermarkOptions({
      text: 'CONFIDENTIAL',
      opacity: 0.3,
      size: 48,
      rotation: 45,
      color: '#ef4444'
    });
    setPageNumberOptions({
      position: 'bottomRight',
      style: 'simple',
      startNumber: 1,
      fontSize: 10,
      color: '#475569'
    });
    setMetadataOptions({
      title: '',
      author: '',
      subject: '',
      keywords: '',
      creator: 'PDFCraft Online'
    });
    setProtectPassword('');
    setUnlockPassword('');
    setProtectOptions({
      allowPrinting: true,
      allowCopying: true,
      allowModifying: true,
      algorithm: 'AES-256'
    });
    setQrText('https://pdfcraft.online');
    setQrFgColor('#000000');
    setQrBgColor('#ffffff');
    setQrDataUrl('');
  };

  const backToHome = () => {
    resetToolState();
    setActiveTool(null);
  };

  const navigateToTool = (toolId) => {
    resetToolState();
    setActiveTool(toolId);
  };

  // Up/down ordering for Merge PDF (Takes 0ms, very responsive)
  const moveFileOrder = (index, direction) => {
    const list = [...uploadedFiles];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;

    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;

    setUploadedFiles(list);
  };

  // Visual Organise Operations (Instant array manipulations using pre-rendered cache)
  const moveOrganizePage = (index, direction) => {
    const list = [...organizePages];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;

    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;

    setOrganizePages(list);
  };

  const rotateOrganizePage = (index) => {
    const list = [...organizePages];
    // Rotate instantly in UI by setting rotation angle in state (rendered via CSS transform)
    list[index].rotation = (list[index].rotation + 90) % 360;
    setOrganizePages(list);
  };

  const deleteOrganizePage = (index) => {
    const list = [...organizePages];
    list.splice(index, 1);
    setOrganizePages(list);
  };

  // Visual Page Selection for Splitting PDF
  const toggleSplitPageSelection = (originalIndex) => {
    const newSelected = new Set(selectedPagesForSplit);
    if (newSelected.has(originalIndex)) {
      newSelected.delete(originalIndex);
    } else {
      newSelected.add(originalIndex);
    }

    setSelectedPagesForSplit(newSelected);

    // Auto-generate split range string based on selection (e.g. "1-2, 5")
    if (newSelected.size === 0) {
      setSplitRanges('');
      return;
    }

    const sortedIndices = Array.from(newSelected).sort((a, b) => a - b);
    const ranges = [];
    let start = sortedIndices[0];
    let end = start;

    for (let i = 1; i < sortedIndices.length; i++) {
      if (sortedIndices[i] === end + 1) {
        end = sortedIndices[i];
      } else {
        ranges.push(start === end ? `${start + 1}` : `${start + 1}-${end + 1}`);
        start = sortedIndices[i];
        end = start;
      }
    }
    ranges.push(start === end ? `${start + 1}` : `${start + 1}-${end + 1}`);

    setSplitRanges(ranges.join(', '));
  };

  // Sync hand-typed Split Range box back to Visual Selection checkmarks
  const handleSplitRangeInputChange = (val) => {
    setSplitRanges(val);

    try {
      const pageCount = uploadedFiles[0]?.pageCount || 0;
      if (pageCount === 0) return;

      const newSelected = new Set();
      const parts = val.split(',');
      for (const part of parts) {
        const clean = part.trim();
        if (clean.includes('-')) {
          const [startStr, endStr] = clean.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
              if (i >= 1 && i <= pageCount) newSelected.add(i - 1);
            }
          }
        } else {
          const p = parseInt(clean, 10);
          if (!isNaN(p) && p >= 1 && p <= pageCount) {
            newSelected.add(p - 1);
          }
        }
      }
      setSelectedPagesForSplit(newSelected);
    } catch (e) {
      // Ignore parse errors on half-typed values
    }
  };

  // CANVAS SIGNATURE DRAWING PAD HANDLERS
  const startDrawing = (e) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000'; // Draw in black for standard signature look

    isDrawingRef.current = true;
  };

  const drawSignature = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawnSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    // Check if canvas is empty
    const ctx = canvas.getContext('2d');
    const buffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    const hasData = buffer.some(color => color !== 0);

    if (!hasData) {
      alert('Please draw your signature first!');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    setSignatureDataUrl(dataUrl);
    setSignatureAspectRatio(2); // standard 400x200 canvas has aspect ratio 2

    // Reset dragging position size
    setSigPos({ x: 50, y: 50, w: 120, h: 60 });

    setShowSignatureModal(false);
  };

  // Upload Pre-scanned Signature File (PNG / JPG)
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;

      // Create image object to read aspect ratio
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        setSignatureDataUrl(dataUrl);
        setSignatureAspectRatio(ratio);

        // Size signature box proportionally
        const w = 120;
        setSigPos({ x: 50, y: 50, w, h: Math.round(w / ratio) });
        setShowSignatureModal(false);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Stamp Visual Drag Handler (Mouse and Touch supported)
  const handleSignatureMouseDown = (e) => {
    e.preventDefault();
    const isTouch = e.type === 'touchstart';
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const startX = clientX;
    const startY = clientY;
    const initLeft = sigPos.x;
    const initTop = sigPos.y;

    const container = pageImageRef.current.parentElement;
    const maxW = container.clientWidth || renderedPageDimensions.w;
    const maxH = container.clientHeight || renderedPageDimensions.h;

    let animationFrameId = null;

    const handleMove = (moveEvent) => {
      const moveClientX = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveClientY = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientY : moveEvent.clientY;

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        // Adjust delta by zoom level so stamp moves accurately with cursor
        const deltaX = (moveClientX - startX) / canvasZoom;
        const deltaY = (moveClientY - startY) / canvasZoom;

        // Bound checking within the rendered page container
        const newX = Math.max(0, Math.min(maxW - sigPos.w, initLeft + deltaX));
        const newY = Math.max(0, Math.min(maxH - sigPos.h, initTop + deltaY));

        setSigPos(prev => ({ ...prev, x: newX, y: newY }));
      });
    };

    const handleEnd = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (isTouch) {
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      } else {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
      }
    };

    if (isTouch) {
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    } else {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    }
  };

  // Canvas background Pan drag handler
  const handleBackgroundMouseDown = (e) => {
    // Return if the click/touch is on the draggable stamp itself
    if (e.target.closest('.draggable-stamp')) return;

    // Check if clicked element is a button (e.g. inside toolbar)
    if (e.target.closest('button')) return;

    e.preventDefault();
    const isTouch = e.type === 'touchstart';
    const startX = isTouch ? e.touches[0].clientX : e.clientX;
    const startY = isTouch ? e.touches[0].clientY : e.clientY;
    const startPanX = panPos.x;
    const startPanY = panPos.y;

    setIsPanning(true);

    let animationFrameId = null;

    const handlePanMove = (moveEvent) => {
      const moveClientX = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveClientY = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientY : moveEvent.clientY;

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        // Pan translation should also adapt to scale so panning speed matches cursor
        const deltaX = (moveClientX - startX) / canvasZoom;
        const deltaY = (moveClientY - startY) / canvasZoom;

        setPanPos({
          x: startPanX + deltaX,
          y: startPanY + deltaY
        });
      });
    };

    const handlePanEnd = () => {
      setIsPanning(false);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (isTouch) {
        document.removeEventListener('touchmove', handlePanMove);
        document.removeEventListener('touchend', handlePanEnd);
      } else {
        document.removeEventListener('mousemove', handlePanMove);
        document.removeEventListener('mouseup', handlePanEnd);
      }
    };

    if (isTouch) {
      document.addEventListener('touchmove', handlePanMove, { passive: false });
      document.addEventListener('touchend', handlePanEnd);
    } else {
      document.addEventListener('mousemove', handlePanMove);
      document.addEventListener('mouseup', handlePanEnd);
    }
  };

  // Adjust signature dimensions proportionally via sidebar size slider
  const handleSignatureSizeChange = (newWidth) => {
    const w = parseInt(newWidth, 10);
    const h = Math.round(w / signatureAspectRatio);

    // Maintain placement bounds
    let x = sigPos.x;
    let y = sigPos.y;
    if (pageImageRef.current) {
      const container = pageImageRef.current.parentElement;
      const maxW = container.clientWidth || renderedPageDimensions.w;
      const maxH = container.clientHeight || renderedPageDimensions.h;

      if (x + w > maxW) {
        x = Math.max(0, maxW - w);
      }
      if (y + h > maxH) {
        y = Math.max(0, maxH - h);
      }
    }

    setSigPos({ x, y, w, h });
  };

  // Visual layout loaded sizes callback
  const handlePageImageLoad = () => {
    if (pageImageRef.current) {
      const w = pageImageRef.current.clientWidth;
      const h = pageImageRef.current.clientHeight;
      setRenderedPageDimensions({ w, h });
    }
  };

  // Drag handler for Crop Bounding Box handles
  const handleCropHandleMouseDown = (handle, e) => {
    e.preventDefault();
    e.stopPropagation();

    const isTouch = e.type === 'touchstart';
    const rect = pageImageRef.current.getBoundingClientRect();

    let animationFrameId = null;

    const handleMove = (moveEvent) => {
      const clientX = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientY : moveEvent.clientY;

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const pctX = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        const pctY = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

        setCropMargins(prev => {
          const next = { ...prev };
          if (handle === 'tl') {
            next.left = Math.min(100 - prev.right - 5, pctX);
            next.top = Math.min(100 - prev.bottom - 5, pctY);
          } else if (handle === 'tr') {
            next.right = Math.min(100 - prev.left - 5, 100 - pctX);
            next.top = Math.min(100 - prev.bottom - 5, pctY);
          } else if (handle === 'bl') {
            next.left = Math.min(100 - prev.right - 5, pctX);
            next.bottom = Math.min(100 - prev.top - 5, 100 - pctY);
          } else if (handle === 'br') {
            next.right = Math.min(100 - prev.left - 5, 100 - pctX);
            next.bottom = Math.min(100 - prev.top - 5, 100 - pctY);
          } else if (handle === 'top') {
            next.top = Math.min(100 - prev.bottom - 5, pctY);
          } else if (handle === 'bottom') {
            next.bottom = Math.min(100 - prev.top - 5, 100 - pctY);
          } else if (handle === 'left') {
            next.left = Math.min(100 - prev.right - 5, pctX);
          } else if (handle === 'right') {
            next.right = Math.min(100 - prev.left - 5, 100 - pctX);
          }
          return next;
        });
      });
    };

    const handleEnd = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (isTouch) {
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      } else {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
      }
    };

    if (isTouch) {
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    } else {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    }
  };

  // Save placed signature stamp details
  const saveSignaturePlacement = (applyToAll = false) => {
    if (renderedPageDimensions.w === 0 || renderedPageDimensions.h === 0) return;

    if (applyToAll) {
      const totalPages = uploadedFiles[0]?.pageCount || 0;
      const newStamps = [];
      for (let i = 0; i < totalPages; i++) {
        newStamps.push({
          pageIndex: i,
          dataUrl: signatureDataUrl,
          x: sigPos.x,
          y: sigPos.y,
          width: sigPos.w,
          height: sigPos.h,
          pageW: renderedPageDimensions.w,
          pageH: renderedPageDimensions.h
        });
      }
      setPlacedSignatures([...placedSignatures, ...newStamps]);
    } else {
      const newStamp = {
        pageIndex: activePageToSign,
        dataUrl: signatureDataUrl,
        x: sigPos.x,
        y: sigPos.y,
        width: sigPos.w,
        height: sigPos.h,
        pageW: renderedPageDimensions.w,
        pageH: renderedPageDimensions.h
      };
      setPlacedSignatures([...placedSignatures, newStamp]);
    }
    setActivePageToSign(null); // return to signature/qr page grid
  };

  // Save crop box margins
  const saveCropMargins = (applyToAll = false) => {
    if (applyToAll) {
      const totalPages = uploadedFiles[0]?.pageCount || 0;
      const newCrops = {};
      for (let i = 0; i < totalPages; i++) {
        newCrops[i] = { ...cropMargins };
      }
      setPlacedCrops(newCrops);
    } else {
      setPlacedCrops(prev => ({
        ...prev,
        [activePageToCrop]: { ...cropMargins }
      }));
    }
    setActivePageToCrop(null); // return to page list
  };

  const removePlacedSignature = (index) => {
    const list = [...placedSignatures];
    list.splice(index, 1);
    setPlacedSignatures(list);
  };

  // Perform PDF Operations
  const runProcess = async () => {
    if (uploadedFiles.length === 0) return;

    setProcessing(true);
    setProgress(20);
    setProcessingStatus('Reading documents...');
    setError('');

    try {
      let outputBytes = null;
      let filename = 'processed.pdf';

      if (activeTool === 'merge') {
        setProcessingStatus('Merging PDF files...');
        const buffers = uploadedFiles.map(f => f.buffer);
        outputBytes = await mergePdfs(buffers);
        filename = 'merged_document.pdf';
      }

      else if (activeTool === 'split') {
        setProcessingStatus('Splitting PDF file...');
        const file = uploadedFiles[0];
        outputBytes = await splitPdf(file.buffer, splitRanges);
        filename = `${file.name.replace('.pdf', '')}_split.pdf`;
      }

      else if (activeTool === 'organize') {
        setProcessingStatus('Restructuring PDF pages...');
        const file = uploadedFiles[0];
        const pageActions = organizePages.map(p => ({
          index: p.originalIndex,
          rotation: p.rotation
        }));

        if (pageActions.length === 0) {
          throw new Error('All pages have been deleted. Please keep at least one page.');
        }

        outputBytes = await organizePdf(file.buffer, pageActions);
        filename = `${file.name.replace('.pdf', '')}_organized.pdf`;
      }

      else if (activeTool === 'compress') {
        setProcessingStatus('Compressing PDF pages and images...');
        const file = uploadedFiles[0];
        outputBytes = await compressPdf(file.buffer, compressLevel, (prog) => {
          setProgress(20 + Math.round(prog * 0.7));
        });
        filename = `${file.name.replace('.pdf', '')}_compressed.pdf`;
      }

      else if (activeTool === 'grayscale') {
        setProcessingStatus('Converting PDF pages to grayscale (Ink-Saver)...');
        const file = uploadedFiles[0];
        outputBytes = await convertToGrayscalePdf(file.buffer, (prog) => {
          setProgress(20 + Math.round(prog * 0.7));
        });
        filename = `${file.name.replace('.pdf', '')}_grayscale.pdf`;
      }

      else if (activeTool === 'crop') {
        setProcessingStatus('Cropping PDF page margins...');
        const file = uploadedFiles[0];
        outputBytes = await cropPdf(file.buffer, placedCrops, (prog) => {
          setProgress(20 + Math.round(prog * 0.7));
        });
        filename = `${file.name.replace('.pdf', '')}_cropped.pdf`;
      }

      else if (activeTool === 'rotate') {
        setProcessingStatus('Rotating PDF pages...');
        const file = uploadedFiles[0];
        outputBytes = await rotatePdf(file.buffer, globalRotation);
        filename = `${file.name.replace('.pdf', '')}_rotated.pdf`;
      }

      else if (activeTool === 'img-to-pdf') {
        setProcessingStatus('Converting images to PDF pages...');
        const images = uploadedFiles.map(f => ({
          name: f.name,
          buffer: f.buffer
        }));
        outputBytes = await imageToPdf(images, imgToPdfOptions);
        filename = 'images_converted.pdf';
      }

      else if (activeTool === 'page-numbers') {
        setProcessingStatus('Adding page numbers...');
        const file = uploadedFiles[0];
        outputBytes = await addPageNumbers(file.buffer, pageNumberOptions);
        filename = `${file.name.replace('.pdf', '')}_numbered.pdf`;
      }

      else if (activeTool === 'watermark') {
        setProcessingStatus('Stamping watermarks...');
        const file = uploadedFiles[0];
        outputBytes = await addWatermark(file.buffer, watermarkOptions);
        filename = `${file.name.replace('.pdf', '')}_watermarked.pdf`;
      }

      else if (activeTool === 'metadata') {
        setProcessingStatus('Saving PDF metadata...');
        const file = uploadedFiles[0];
        outputBytes = await editMetadata(file.buffer, metadataOptions);
        filename = `${file.name.replace('.pdf', '')}_updated.pdf`;
      }

      else if (activeTool === 'sign') {
        setProcessingStatus('Applying digital signatures...');
        const file = uploadedFiles[0];

        if (placedSignatures.length === 0) {
          throw new Error('Please visually place at least one signature stamp on a page.');
        }

        outputBytes = await stampSignatures(file.buffer, placedSignatures);
        filename = `${file.name.replace('.pdf', '')}_signed.pdf`;
      }

      else if (activeTool === 'qr') {
        setProcessingStatus('Embedding QR codes...');
        const file = uploadedFiles[0];

        if (placedSignatures.length === 0) {
          throw new Error('Please visually place at least one QR code stamp on a page.');
        }

        outputBytes = await stampQrCode(file.buffer, placedSignatures);
        filename = `${file.name.replace('.pdf', '')}_qr_stamped.pdf`;
      }

      else if (activeTool === 'protect') {
        setProcessingStatus('Encrypting document...');
        const file = uploadedFiles[0];
        if (!protectPassword.trim()) {
          throw new Error('Please enter a password to protect the PDF.');
        }

        const encryptedBytes = await encryptPdfFile(file.buffer, protectPassword, protectOptions);
        outputBytes = encryptedBytes;
        filename = `${file.name.replace('.pdf', '')}_protected.pdf`;
      }

      else if (activeTool === 'unlock') {
        setProcessingStatus('Removing password protection...');
        const file = uploadedFiles[0];
        if (!unlockPassword.trim()) {
          throw new Error('Please enter the current password to unlock the PDF.');
        }
        outputBytes = await unlockPdf(file.buffer, unlockPassword);
        filename = `${file.name.replace('.pdf', '')}_unlocked.pdf`;
      }

      else if (activeTool === 'pdf-to-docx') {
        setProcessingStatus('Converting PDF to Word document...');
        const file = uploadedFiles[0];
        const docxBlob = await convertPdfToDocx(file.buffer, (prog) => {
          setProgress(20 + Math.round(prog * 0.7));
        });
        setResultBlob(docxBlob);
        setResultName(`${file.name.replace('.pdf', '')}.docx`);
        setProgress(100);
        setTimeout(() => {
          setProcessing(false);
        }, 150);
        return;
      }

      else if (activeTool === 'pdf-to-pptx') {
        setProcessingStatus('Converting PDF to PowerPoint slides...');
        const file = uploadedFiles[0];
        const pptxBlob = await convertPdfToPptx(file.buffer, (prog) => {
          setProgress(20 + Math.round(prog * 0.7));
        });
        setResultBlob(pptxBlob);
        setResultName(`${file.name.replace('.pdf', '')}.pptx`);
        setProgress(100);
        setTimeout(() => {
          setProcessing(false);
        }, 150);
        return;
      }

      else if (activeTool === 'docx-to-pdf') {
        setProcessingStatus('Converting Word document to PDF...');
        const file = uploadedFiles[0];
        outputBytes = await convertDocxToPdf(file.buffer);
        filename = `${file.name.replace('.docx', '')}.pdf`;
      }

      else if (activeTool === 'pptx-to-pdf') {
        setProcessingStatus('Converting PowerPoint presentation to PDF...');
        const file = uploadedFiles[0];
        outputBytes = await convertPptxToPdf(file.buffer);
        filename = `${file.name.replace('.pptx', '')}.pdf`;
      }

      else if (activeTool === 'xlsx-to-pdf') {
        setProcessingStatus('Converting Excel spreadsheet to PDF...');
        const file = uploadedFiles[0];
        outputBytes = await convertXlsxToPdf(file.buffer);
        filename = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
      }

      else if (activeTool === 'html-to-pdf') {
        setProcessingStatus('Converting HTML file to PDF...');
        const file = uploadedFiles[0];
        outputBytes = await convertHtmlToPdf(file.buffer);
        filename = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
      }

      else if (activeTool === 'pdf-to-xlsx') {
        setProcessingStatus('Converting PDF to Excel spreadsheet...');
        const file = uploadedFiles[0];
        const xlsxBlob = await convertPdfToXlsx(file.buffer, (prog) => {
          setProgress(20 + Math.round(prog * 0.7));
        });
        setResultBlob(xlsxBlob);
        setResultName(`${file.name.replace('.pdf', '')}.xlsx`);
        setProgress(100);
        setTimeout(() => {
          setProcessing(false);
        }, 150);
        return;
      }

      else if (activeTool === 'pdf-to-pdfa') {
        setProcessingStatus('Converting PDF to PDF/A archive format...');
        const file = uploadedFiles[0];
        outputBytes = await convertPdfToPdfA(file.buffer);
        filename = `${file.name.replace('.pdf', '')}_pdfa.pdf`;
      }

      else if (activeTool === 'extract-text') {
        setProcessingStatus('Extracting text content...');
        const file = uploadedFiles[0];
        const text = await extractTextFromPdf(file.buffer, (prog) => {
          setProgress(20 + Math.round(prog * 0.7));
        });
        setExtractedText(text);
        setProgress(100);
        setProcessing(false);
        return;
      }

      else if (activeTool === 'pdf-to-img') {
        setProcessingStatus('Rendering pages to images...');
        const file = uploadedFiles[0];
        const zip = new JSZip();

        if (!window.pdfjsLib) {
          throw new Error('PDF render worker is not loaded yet.');
        }

        const loadingTask = window.pdfjsLib.getDocument({ data: file.buffer.slice(0) });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        // Render pages in parallel chunks of 3 for fast processing with zero UI freezing
        const batchSize = 3;
        for (let i = 1; i <= totalPages; i += batchSize) {
          setProcessingStatus(`Rendering pages ${i} to ${Math.min(i + batchSize - 1, totalPages)}...`);
          setProgress(20 + Math.round((i / totalPages) * 70));

          const batchPromises = [];
          for (let j = i; j < i + batchSize && j <= totalPages; j++) {
            batchPromises.push((async (pageNum) => {
              const page = await pdf.getPage(pageNum);
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');

              // Crisp 2.0x render scale for HD download
              const viewport = page.getViewport({ scale: 2.0 });
              canvas.width = viewport.width;
              canvas.height = viewport.height;

              await page.render({ canvasContext: context, viewport }).promise;
              const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
              zip.file(`page-${pageNum}.jpg`, blob);
            })(j));
          }
          await Promise.all(batchPromises);
        }

        setProcessingStatus('Compressing ZIP archive...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        setResultBlob(zipBlob);
        setResultName(`${file.name.replace('.pdf', '')}_images.zip`);
        setProgress(100);
        setProcessing(false);
        return;
      }

      if (outputBytes) {
        setProgress(90);
        setProcessingStatus('Finalizing document...');

        const blob = new Blob([outputBytes], { type: 'application/pdf' });
        setResultBlob(blob);
        setResultName(filename);

        setProgress(100);
        setTimeout(() => {
          setProcessing(false);
        }, 150);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while processing the PDF.');
      setProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (resultBlob && resultName) {
      downloadBlob(resultBlob, resultName);
    }
  };

  const handleShareClick = (blob, name, type) => {
    setShareData({ blob, name, type });
    const file = new File([blob], name, { type });
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

    if (navigator.share) {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: name,
          text: 'Here is your file from pdfCraft!',
        }).catch(err => {
          console.log('Native file sharing cancelled or failed:', err);
        });
      } else {
        navigator.share({
          title: name,
          text: `Here is your processed file: ${name}`,
          url: window.location.origin
        }).catch(err => {
          console.log('Native sharing cancelled or failed:', err);
        });
      }
    } else {
      if (!isMobile) {
        setShowShareModal(true);
      } else {
        downloadBlob(blob, name);
      }
    }
  };

  const copyFileToClipboard = async (blob) => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      return true;
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      return false;
    }
  };

  const handleDesktopShare = async (platform) => {
    if (!shareData.blob) return;

    // Try to copy the file/image to clipboard so the user can paste it directly
    const copied = await copyFileToClipboard(shareData.blob);

    const openPlatform = () => {
      let url = '';
      const websiteUrl = 'https://pdf-craft-sand.vercel.app/';
      const messageText = `Hi, I just processed my file securely and 100% locally using pdfCraft. Website: ${websiteUrl}`;

      if (platform === 'whatsapp') {
        url = `https://web.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
      } else if (platform === 'telegram') {
        url = `https://t.me/share/url?url=${encodeURIComponent(websiteUrl)}&text=${encodeURIComponent('I just processed my file securely and 100% locally using pdfCraft!')}`;
      } else if (platform === 'gmail') {
        url = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent('Processed File: ' + shareData.name)}&body=${encodeURIComponent("Hi,\n\nPlease find attached the file that I processed securely using pdfCraft.\n\nWebsite: https://pdf-craft-sand.vercel.app/")}`;
      } else if (platform === 'email') {
        url = `mailto:?subject=${encodeURIComponent('Processed File: ' + shareData.name)}&body=${encodeURIComponent("Hi,\n\nPlease find attached the file that I processed securely using pdfCraft.\n\nWebsite: https://pdf-craft-sand.vercel.app/")}`;
      }

      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    };

    const file = new File([shareData.blob], shareData.name, { type: shareData.type });

    // If native share is supported and available, prioritize it
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: shareData.name,
        text: 'Here is your file from pdfCraft!',
      }).catch(err => {
        if (err.name !== 'AbortError') {
          openPlatform();
        }
      });
    } else {
      openPlatform();
      if (copied) {
        alert(`File "${shareData.name}" has been copied to your clipboard!\n\nWe have opened the chat/email window. Simply press Ctrl+V (or Paste) to attach it directly!`);
      } else {
        alert(`We have opened the chat/email window.\n\nTo share the file, please click the "Download File" button in the modal to save it, and then attach it manually.`);
      }
    }
  };

  const shareProcessedFile = async () => {
    if (!resultBlob || !resultName) return;
    handleShareClick(resultBlob, resultName, resultBlob.type);
  };

  const downloadQrCodeImage = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qrcode_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


  const categorizedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  // Explicit category display order
  const categoryOrder = ['Organize', 'Edits', 'Optimize', 'Security', 'Convert to PDF', 'Convert from PDF', 'Utilities'];
  const orderedCategories = categoryOrder.filter(cat => categorizedTools[cat]);
  // Filter categories based on mobileTab selection
  const getFilteredCategories = () => {
    if (mobileTab === 'all') return orderedCategories;
    if (mobileTab === 'organize') {
      return orderedCategories.filter(cat => cat === 'Organize' || cat === 'Edits');
    }
    if (mobileTab === 'convert') {
      return orderedCategories.filter(cat => cat === 'Convert to PDF' || cat === 'Convert from PDF');
    }
    if (mobileTab === 'security') {
      return orderedCategories.filter(cat => cat === 'Security' || cat === 'Optimize' || cat === 'Utilities');
    }
    return orderedCategories;
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-left">
          {/* Mobile Menu Toggle Button */}
          <button className="btn-icon btn-burger-menu" title="Menu" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={20} />
          </button>

          <a href="/" className="nav-brand" onClick={(e) => { e.preventDefault(); backToHome(); }}>
            <span className="logo-pdf">pdf</span>
            <span className="logo-heart">❤️</span>
            <span className="logo-craft">Craft</span>
          </a>

          <nav className="nav-menu">
            <a href="#merge" className={`nav-item ${activeTool === 'merge' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateToTool('merge'); }}>
              MERGE PDF
            </a>
            <a href="#split" className={`nav-item ${activeTool === 'split' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateToTool('split'); }}>
              SPLIT PDF
            </a>
            <a href="#compress" className={`nav-item ${activeTool === 'compress' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateToTool('compress'); }}>
              COMPRESS PDF
            </a>

            {/* Convert PDF Dropdown */}
            <div className="nav-dropdown-trigger">
              <span className="nav-item-dropdown">
                CONVERT PDF <ChevronDown size={14} className="dropdown-arrow" />
              </span>
              <div className="nav-dropdown-menu mega-convert">
                <div className="dropdown-column">
                  <div className="dropdown-col-title">CONVERT TO PDF</div>
                  <a href="#img-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('img-to-pdf'); }} className="dropdown-link">
                    <span className="link-icon"><IconJpgToPdf size={28} /></span> JPG to PDF
                  </a>
                  <a href="#docx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('docx-to-pdf'); }} className="dropdown-link">
                    <span className="link-icon"><IconWordToPdf size={28} /></span> WORD to PDF
                  </a>
                  <a href="#pptx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('pptx-to-pdf'); }} className="dropdown-link">
                    <span className="link-icon"><IconPptToPdf size={28} /></span> POWERPOINT to PDF
                  </a>
                  <a href="#xlsx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('xlsx-to-pdf'); }} className="dropdown-link">
                    <span className="link-icon"><IconExcelToPdf size={28} /></span> EXCEL to PDF
                  </a>
                  <a href="#html-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('html-to-pdf'); }} className="dropdown-link">
                    <span className="link-icon"><IconHtmlToPdf size={28} /></span> HTML to PDF
                  </a>
                </div>
                <div className="dropdown-column">
                  <div className="dropdown-col-title">CONVERT FROM PDF</div>
                  <a href="#pdf-to-img" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-img'); }} className="dropdown-link">
                    <span className="link-icon"><IconPdfToJpg size={28} /></span> PDF to JPG
                  </a>
                  <a href="#pdf-to-docx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-docx'); }} className="dropdown-link">
                    <span className="link-icon"><IconPdfToWord size={28} /></span> PDF to WORD
                  </a>
                  <a href="#pdf-to-pptx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-pptx'); }} className="dropdown-link">
                    <span className="link-icon"><IconPdfToPpt size={28} /></span> PDF to POWERPOINT
                  </a>
                  <a href="#pdf-to-xlsx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-xlsx'); }} className="dropdown-link">
                    <span className="link-icon"><IconPdfToExcel size={28} /></span> PDF to EXCEL
                  </a>
                  <a href="#pdf-to-pdfa" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-pdfa'); }} className="dropdown-link">
                    <span className="link-icon"><IconPdfToPdfA size={28} /></span> PDF to PDF/A
                  </a>
                </div>
              </div>
            </div>

            {/* All PDF Tools Mega Dropdown */}
            <div className="nav-dropdown-trigger">
              <span className="nav-item-dropdown">
                ALL PDF TOOLS <ChevronDown size={14} className="dropdown-arrow" />
              </span>
              <div className="nav-dropdown-menu mega-all">
                <div className="dropdown-column">
                  <div className="dropdown-col-title">ORGANIZE PDF</div>
                  <a href="#merge" onClick={(e) => { e.preventDefault(); navigateToTool('merge'); }} className="dropdown-link">
                    <span className="link-icon"><Combine size={18} /></span> Merge PDF
                  </a>
                  <a href="#split" onClick={(e) => { e.preventDefault(); navigateToTool('split'); }} className="dropdown-link">
                    <span className="link-icon"><Scissors size={18} /></span> Split PDF
                  </a>
                  <a href="#organize" onClick={(e) => { e.preventDefault(); navigateToTool('organize'); }} className="dropdown-link">
                    <span className="link-icon"><Layers size={18} /></span> Organize PDF
                  </a>
                  <a href="#rotate" onClick={(e) => { e.preventDefault(); navigateToTool('rotate'); }} className="dropdown-link">
                    <span className="link-icon"><RotateCw size={18} /></span> Rotate PDF
                  </a>
                </div>
                <div className="dropdown-column">
                  <div className="dropdown-col-title">EDIT PDF</div>
                  <a href="#sign" onClick={(e) => { e.preventDefault(); navigateToTool('sign'); }} className="dropdown-link">
                    <span className="link-icon"><PenTool size={18} /></span> Sign PDF
                  </a>
                  <a href="#qr" onClick={(e) => { e.preventDefault(); navigateToTool('qr'); }} className="dropdown-link">
                    <span className="link-icon"><QrCode size={18} /></span> Stamp QR Code
                  </a>
                  <a href="#page-numbers" onClick={(e) => { e.preventDefault(); navigateToTool('page-numbers'); }} className="dropdown-link">
                    <span className="link-icon"><Hash size={18} /></span> Add Page Numbers
                  </a>
                  <a href="#watermark" onClick={(e) => { e.preventDefault(); navigateToTool('watermark'); }} className="dropdown-link">
                    <span className="link-icon"><Type size={18} /></span> Add Watermark
                  </a>
                  <a href="#metadata" onClick={(e) => { e.preventDefault(); navigateToTool('metadata'); }} className="dropdown-link">
                    <span className="link-icon"><Settings size={18} /></span> Edit Metadata
                  </a>
                </div>
                <div className="dropdown-column">
                  <div className="dropdown-col-title">CONVERT</div>
                  <a href="#docx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('docx-to-pdf'); }} className="dropdown-link">
                    <span className="link-icon"><IconWordToPdf size={20} /></span> Word to PDF
                  </a>
                  <a href="#pptx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('pptx-to-pdf'); }} className="dropdown-link">
                    <span className="link-icon"><IconPptToPdf size={20} /></span> PowerPoint to PDF
                  </a>
                  <a href="#img-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('img-to-pdf'); }} className="dropdown-link">
                    <span className="link-icon"><IconJpgToPdf size={20} /></span> JPG to PDF
                  </a>
                  <a href="#xlsx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('xlsx-to-pdf'); }} className="dropdown-link">
                    <span className="link-icon"><IconExcelToPdf size={20} /></span> Excel to PDF
                  </a>
                  <a href="#html-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('html-to-pdf'); }} className="dropdown-link">
                    <span className="link-icon"><IconHtmlToPdf size={20} /></span> HTML to PDF
                  </a>
                  <a href="#pdf-to-img" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-img'); }} className="dropdown-link">
                    <span className="link-icon"><IconPdfToJpg size={20} /></span> PDF to JPG
                  </a>
                  <a href="#pdf-to-docx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-docx'); }} className="dropdown-link">
                    <span className="link-icon"><IconPdfToWord size={20} /></span> PDF to Word
                  </a>
                  <a href="#pdf-to-pptx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-pptx'); }} className="dropdown-link">
                    <span className="link-icon"><IconPdfToPpt size={20} /></span> PDF to PowerPoint
                  </a>
                  <a href="#pdf-to-xlsx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-xlsx'); }} className="dropdown-link">
                    <span className="link-icon"><IconPdfToExcel size={20} /></span> PDF to Excel
                  </a>
                  <a href="#pdf-to-pdfa" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-pdfa'); }} className="dropdown-link">
                    <span className="link-icon"><IconPdfToPdfA size={20} /></span> PDF to PDF/A
                  </a>
                  <a href="#extract-text" onClick={(e) => { e.preventDefault(); navigateToTool('extract-text'); }} className="dropdown-link">
                    <span className="link-icon"><FileText size={18} /></span> Extract Text
                  </a>
                </div>
                <div className="dropdown-column">
                  <div className="dropdown-col-title">SECURITY & UTILITIES</div>
                  <a href="#compress" onClick={(e) => { e.preventDefault(); navigateToTool('compress'); }} className="dropdown-link font-semibold">
                    <span className="link-icon"><Sliders size={18} /></span> Compress PDF
                  </a>
                  <a href="#protect" onClick={(e) => { e.preventDefault(); navigateToTool('protect'); }} className="dropdown-link">
                    <span className="link-icon"><Lock size={18} /></span> Protect PDF
                  </a>
                  <a href="#qr-generator" onClick={(e) => { e.preventDefault(); navigateToTool('qr-generator'); }} className="dropdown-link highlight">
                    <span className="link-icon"><QrCode size={18} /></span> QR Generator
                  </a>
                  <a href="#scanner" onClick={(e) => { e.preventDefault(); navigateToTool('scanner'); }} className="dropdown-link font-semibold">
                    <span className="link-icon"><Scan size={18} /></span> Doc Scanner
                  </a>
                </div>
              </div>
            </div>
            <a href="#qr-generator" className={`nav-item ${activeTool === 'qr-generator' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateToTool('qr-generator'); }}>
              QR CODE GENERATOR
            </a>
          </nav>
        </div>

        <div className="navbar-right">
          <button onClick={toggleTheme} className="btn-icon btn-theme-toggle" title="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* 9-Dot Menu Button */}
          <div className="grid-menu-trigger">
            <button className="btn-icon btn-grid-menu" title="All tools grid" onClick={() => setGridMenuOpen(!gridMenuOpen)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <rect x="3" y="3" width="4" height="4" rx="1" />
                <rect x="10" y="3" width="4" height="4" rx="1" />
                <rect x="17" y="3" width="4" height="4" rx="1" />
                <rect x="3" y="10" width="4" height="4" rx="1" />
                <rect x="10" y="10" width="4" height="4" rx="1" />
                <rect x="17" y="10" width="4" height="4" rx="1" />
                <rect x="3" y="17" width="4" height="4" rx="1" />
                <rect x="10" y="17" width="4" height="4" rx="1" />
                <rect x="17" y="17" width="4" height="4" rx="1" />
              </svg>
            </button>
            {gridMenuOpen && (
              <div className="grid-menu-dropdown">
                <div className="grid-menu-header">
                  <span>Quick Access Tools</span>
                  <button className="grid-menu-close" onClick={() => setGridMenuOpen(false)}>×</button>
                </div>
                <div className="grid-menu-body">
                  {tools.map(tool => (
                    <button
                      key={tool.id}
                      className={`grid-menu-item tool-cat-${tool.category.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => { navigateToTool(tool.id); setGridMenuOpen(false); }}
                    >
                      <span className="grid-menu-icon">{tool.icon}</span>
                      <span className="grid-menu-label">{tool.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Mobile Side Drawer Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <div className="drawer-overlay" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="drawer-content">
              <div className="drawer-header">
                <a href="/" className="nav-brand" onClick={(e) => { e.preventDefault(); backToHome(); setMobileMenuOpen(false); }}>
                  <span className="logo-pdf">pdf</span>
                  <span className="logo-heart">❤️</span>
                  <span className="logo-craft">Craft</span>
                </a>
                <button className="btn-icon btn-close-drawer" onClick={() => setMobileMenuOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="drawer-body">
                <a href="#merge" className="drawer-item tool-cat-organize" onClick={(e) => { e.preventDefault(); navigateToTool('merge'); setMobileMenuOpen(false); }}>
                  <Combine size={18} /> Merge PDF
                </a>
                <a href="#split" className="drawer-item tool-cat-organize" onClick={(e) => { e.preventDefault(); navigateToTool('split'); setMobileMenuOpen(false); }}>
                  <Scissors size={18} /> Split PDF
                </a>
                <a href="#compress" className="drawer-item tool-cat-optimize" onClick={(e) => { e.preventDefault(); navigateToTool('compress'); setMobileMenuOpen(false); }}>
                  <Sliders size={18} /> Compress PDF
                </a>

                {/* Convert Group */}
                <div className="drawer-group">
                  <div className="drawer-group-title">Convert PDF</div>
                  <div className="drawer-group-items">
                    <a href="#img-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('img-to-pdf'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-convert-to-pdf">
                      <IconJpgToPdf size={20} /> JPG to PDF
                    </a>
                    <a href="#docx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('docx-to-pdf'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-convert-to-pdf">
                      <IconWordToPdf size={20} /> Word to PDF
                    </a>
                    <a href="#pptx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('pptx-to-pdf'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-convert-to-pdf">
                      <IconPptToPdf size={20} /> PowerPoint to PDF
                    </a>
                    <a href="#xlsx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('xlsx-to-pdf'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-convert-to-pdf">
                      <IconExcelToPdf size={20} /> Excel to PDF
                    </a>
                    <a href="#html-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('html-to-pdf'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-convert-to-pdf">
                      <IconHtmlToPdf size={20} /> HTML to PDF
                    </a>
                    <a href="#pdf-to-img" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-img'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-convert-from-pdf">
                      <IconPdfToJpg size={20} /> PDF to JPG
                    </a>
                    <a href="#pdf-to-docx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-docx'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-convert-from-pdf">
                      <IconPdfToWord size={20} /> PDF to Word
                    </a>
                    <a href="#pdf-to-pptx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-pptx'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-convert-from-pdf">
                      <IconPdfToPpt size={20} /> PDF to PowerPoint
                    </a>
                    <a href="#pdf-to-xlsx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-xlsx'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-convert-from-pdf">
                      <IconPdfToExcel size={20} /> PDF to Excel
                    </a>
                    <a href="#pdf-to-pdfa" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-pdfa'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-convert-from-pdf">
                      <IconPdfToPdfA size={20} /> PDF to PDF/A
                    </a>
                    <a href="#extract-text" onClick={(e) => { e.preventDefault(); navigateToTool('extract-text'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-utilities">
                      <FileText size={18} /> Extract Text
                    </a>
                  </div>
                </div>

                {/* Edit & Organize Group */}
                <div className="drawer-group">
                  <div className="drawer-group-title">All Tools</div>
                  <div className="drawer-group-items">
                    <a href="#organize" onClick={(e) => { e.preventDefault(); navigateToTool('organize'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-organize">
                      <Layers size={18} /> Organize PDF
                    </a>
                    <a href="#rotate" onClick={(e) => { e.preventDefault(); navigateToTool('rotate'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-organize">
                      <RotateCw size={18} /> Rotate PDF
                    </a>
                    <a href="#sign" onClick={(e) => { e.preventDefault(); navigateToTool('sign'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-security">
                      <PenTool size={18} /> Sign PDF
                    </a>
                    <a href="#qr" onClick={(e) => { e.preventDefault(); navigateToTool('qr'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-edits">
                      <QrCode size={18} /> Stamp QR Code
                    </a>
                    <a href="#page-numbers" onClick={(e) => { e.preventDefault(); navigateToTool('page-numbers'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-edits">
                      <Hash size={18} /> Add Page Numbers
                    </a>
                    <a href="#watermark" onClick={(e) => { e.preventDefault(); navigateToTool('watermark'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-edits">
                      <Type size={18} /> Add Watermark
                    </a>
                    <a href="#metadata" onClick={(e) => { e.preventDefault(); navigateToTool('metadata'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-utilities">
                      <Settings size={18} /> Edit Metadata
                    </a>
                    <a href="#protect" onClick={(e) => { e.preventDefault(); navigateToTool('protect'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-security">
                      <Lock size={18} /> Protect PDF
                    </a>
                    <a href="#unlock" onClick={(e) => { e.preventDefault(); navigateToTool('unlock'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-security">
                      <LockOpen size={18} /> Unlock PDF
                    </a>
                    <a href="#scanner" onClick={(e) => { e.preventDefault(); navigateToTool('scanner'); setMobileMenuOpen(false); }} className="drawer-subitem tool-cat-utilities font-semibold">
                      <Scan size={18} /> Doc Scanner
                    </a>
                    <a href="#qr-generator" onClick={(e) => { e.preventDefault(); navigateToTool('qr-generator'); setMobileMenuOpen(false); }} className="drawer-subitem font-semibold color-accent tool-cat-utilities">
                      <QrCode size={18} /> QR Code Generator
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="main-content">
        {activeTool === null ? (
          /* Tool Grid View (Home) */
          <>
            <div className="hero">
              <div className="hero-left">
                <h1>Organize, compress, and edit PDFs.</h1>
                <p>Simple, lightning-fast tools that run completely client-side in your browser. Your files never leave your computer, ensuring absolute privacy.</p>
              </div>
              <div className="hero-right">
                <div 
                  className="interactive-3d-card-container"
                  onMouseMove={handleHeroMouseMove}
                  onMouseLeave={handleHeroMouseLeave}
                >
                  <div className="interactive-3d-card" ref={heroCardRef}>
                    <div className="card-layer background-layer"></div>
                    <div className="card-layer document-layer">
                      <div className="doc-header">
                        <div className="doc-logo">PDF</div>
                        <div className="doc-lines">
                          <div className="doc-line short"></div>
                          <div className="doc-line"></div>
                        </div>
                      </div>
                      <div className="doc-pages-illustration">
                        <div className="doc-illust-page page-1">
                          <div className="page-line heading"></div>
                          <div className="page-line body-line"></div>
                          <div className="page-line body-line long"></div>
                        </div>
                        <div className="doc-illust-page page-2">
                          <div className="page-line heading accent"></div>
                          <div className="page-line body-line short"></div>
                          <div className="page-illust-content">
                            <div className="mini-signature"></div>
                          </div>
                        </div>
                        <div className="doc-illust-page page-3">
                          <div className="page-line heading"></div>
                          <div className="page-line body-line"></div>
                          <div className="page-line body-line short"></div>
                        </div>
                      </div>
                    </div>
                    <div className="card-layer overlay-layer">
                      <div className="floating-badge badge-secure">Secure</div>
                      <div className="floating-badge badge-fast">Local</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="tools" className="tool-sections-container">
              {(() => {
                let cardIndex = 0;
                return getFilteredCategories().map((category) => (
                  <div key={category} className="tool-category-section">
                    <h2 className="tool-section-title">{category}</h2>
                    <div className="tool-grid">
                      {categorizedTools[category].map((tool) => {
                        const currentDelayIndex = cardIndex++;
                        return (
                          <div
                            key={tool.id}
                            className={`tool-card tool-cat-${tool.category.toLowerCase().replace(/\s+/g, '-')}`}
                            style={{ animationDelay: `${currentDelayIndex * 35}ms` }}
                            onClick={() => setActiveTool(tool.id)}
                          >
                            <div className="tool-card-icon">{tool.icon}</div>
                            <h3>{tool.title}</h3>
                            <p>{tool.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </>
        ) : (
          /* Active Tool Workspace */
          <div className="workspace-container">
            <div className="workspace-header">
              <button className="btn-back btn-back-desktop" onClick={backToHome}>
                <ArrowLeft size={16} /> Back to Tools
              </button>
              <div className="workspace-title-area">
                <h2>{currentTool.title}</h2>
                <p>{currentTool.description}</p>
              </div>
            </div>

            {error && (
              <div style={{
                backgroundColor: 'var(--accent-light)',
                border: '1px solid var(--accent-color)',
                color: 'var(--text-primary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.9rem'
              }}>
                <strong>Error: </strong> {error}
              </div>
            )}

            {/* Sub-View: QR Generator (No file needed) */}
            {activeTool === 'qr-generator' ? (
              <div className="workspace-layout qr-layout" style={{ minHeight: 'auto' }}>
                {/* Column 1: QR Preview Box */}
                <div className="workspace-main" style={{
                  padding: '1.25rem',
                  minHeight: 'auto',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {qrGenError && (
                    <div style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>
                      {qrGenError}
                    </div>
                  )}
                  {qrGenDataUrl ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        padding: '0.5rem',
                        backgroundColor: qrGenBgColor,
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)',
                      }}>
                        <img
                          src={qrGenDataUrl}
                          alt="Generated QR Code"
                          style={{ maxWidth: '240px', width: '100%', height: 'auto', display: 'block' }}
                        />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                          Scan this QR Code to open:
                        </p>
                        <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', wordBreak: 'break-all', maxWidth: '240px', margin: '0 auto' }}>
                          {qrGenText}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '200px' }}>
                        <button
                          className="btn-download-success"
                          style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = qrGenDataUrl;
                            a.download = `qrcode_${Date.now()}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                        >
                          <Download size={16} /> Download PNG
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <QrCode size={60} style={{ opacity: 0.3 }} />
                      <p style={{ fontSize: '0.85rem' }}>Enter a URL or text in the right panel to generate your QR code</p>
                    </div>
                  )}
                </div>

                {/* Column 2: Quick Presets Box (Middle) */}
                <div className="workspace-sidebar qr-presets-column" style={{ padding: '1rem' }}>
                  <div className="sidebar-section">
                    <h3>Quick Presets</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {[
                        { label: '🖤 Classic', fg: '#000000', bg: '#ffffff' },
                        { label: '🔴 Red Accent', fg: '#e11d48', bg: '#ffffff' },
                        { label: '🌑 Dark Mode', fg: '#f1f5f9', bg: '#0f172a' },
                        { label: '💙 Corp Blue', fg: '#1e40af', bg: '#eff6ff' },
                        { label: '💚 Forest', fg: '#15803d', bg: '#f0fdf4' },
                        { label: '🍊 Sunset', fg: '#ea580c', bg: '#fff7ed' },
                        { label: '💜 Royal', fg: '#6d28d9', bg: '#faf5ff' },
                        { label: '💖 Pink', fg: '#db2777', bg: '#fdf2f8' },
                        { label: '🧪 Cyberpunk', fg: '#06b6d4', bg: '#0b0f19' },
                        { label: '✨ Gold', fg: '#b45309', bg: '#fffbeb' },
                        { label: '🍵 Mint', fg: '#0d9488', bg: '#f0fdfa' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          className="option-select-btn"
                          onClick={() => { setQrGenFgColor(preset.fg); setQrGenBgColor(preset.bg); }}
                          style={{
                            textAlign: 'left',
                            padding: '0.35rem 0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.75rem',
                            width: '100%'
                          }}
                        >
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: preset.fg, border: '1px solid var(--border-color)', flexShrink: 0 }}></span>
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 3: Controls Sidebar (Right) */}
                <div className="qr-controls-column">
                  {/* Card 1: Content Box */}
                  <div className="workspace-sidebar" style={{ padding: '1rem' }}>
                    <div className="sidebar-section">
                      <h3>QR Content</h3>
                      <div className="form-group">
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="https://example.com or any text..."
                          value={qrGenText}
                          onChange={(e) => setQrGenText(e.target.value)}
                          style={{ resize: 'none', fontFamily: 'monospace', fontSize: '0.8rem', padding: '0.5rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Customize Box (Appearance, Text Label, Spacing) */}
                  <div className="workspace-sidebar" style={{ padding: '1rem', gap: '1rem' }}>
                    {/* Appearance Section */}
                    <div className="sidebar-section">
                      <h3>Appearance</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group" style={{ minWidth: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Foreground</label>
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <input
                              type="color"
                              value={qrGenFgColor}
                              onChange={(e) => setQrGenFgColor(e.target.value)}
                              style={{ width: '28px', height: '28px', padding: '1px', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}
                            />
                            <input
                              className="form-control"
                              type="text"
                              value={qrGenFgColor}
                              onChange={(e) => setQrGenFgColor(e.target.value)}
                              style={{ flex: 1, width: '100%', minWidth: 0, padding: '0.35rem', fontSize: '0.75rem', fontFamily: 'monospace' }}
                            />
                          </div>
                        </div>

                        <div className="form-group" style={{ minWidth: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Background</label>
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <input
                              type="color"
                              value={qrGenBgColor}
                              onChange={(e) => setQrGenBgColor(e.target.value)}
                              style={{ width: '28px', height: '28px', padding: '1px', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}
                            />
                            <input
                              className="form-control"
                              type="text"
                              value={qrGenBgColor}
                              onChange={(e) => setQrGenBgColor(e.target.value)}
                              style={{ flex: 1, width: '100%', minWidth: 0, padding: '0.35rem', fontSize: '0.75rem', fontFamily: 'monospace' }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginTop: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Size</span>
                          <strong>{qrGenSize}px</strong>
                        </label>
                        <input
                          type="range"
                          min={128}
                          max={1024}
                          step={64}
                          value={qrGenSize}
                          onChange={(e) => setQrGenSize(Number(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                        />
                      </div>
                    </div>

                    {/* Text Label Section */}
                    <div className="sidebar-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                      <h3>Text Label</h3>
                      <div className="form-group">
                        <input
                          className="form-control"
                          type="text"
                          placeholder="e.g. Scan me..."
                          value={qrGenLabelText}
                          onChange={(e) => setQrGenLabelText(e.target.value)}
                          style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                        />
                      </div>
                      {qrGenLabelText && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                          <div className="form-group">
                            <label style={{ fontSize: '0.7rem' }}>Position</label>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button
                                type="button"
                                className={`option-select-btn ${qrGenLabelPosition === 'bottom' ? 'active' : ''}`}
                                onClick={() => setQrGenLabelPosition('bottom')}
                                style={{ flex: 1, padding: '0.25rem', fontSize: '0.7rem' }}
                              >
                                Bottom
                              </button>
                              <button
                                type="button"
                                className={`option-select-btn ${qrGenLabelPosition === 'top' ? 'active' : ''}`}
                                onClick={() => setQrGenLabelPosition('top')}
                                style={{ flex: 1, padding: '0.25rem', fontSize: '0.7rem' }}
                              >
                                Top
                              </button>
                            </div>
                          </div>
                          <div className="form-group">
                            <label style={{ fontSize: '0.7rem' }}>Font: {qrGenLabelFontSize}px</label>
                            <input
                              type="range"
                              min={10}
                              max={40}
                              step={2}
                              value={qrGenLabelFontSize}
                              onChange={(e) => setQrGenLabelFontSize(Number(e.target.value))}
                              style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Spacing Section */}
                    <div className="sidebar-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                      <h3>Spacing (Margins)</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Top</span>
                            <strong>{qrGenTopSpace}px</strong>
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={150}
                            step={10}
                            value={qrGenTopSpace}
                            onChange={(e) => setQrGenTopSpace(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Bottom</span>
                            <strong>{qrGenBottomSpace}px</strong>
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={150}
                            step={10}
                            value={qrGenBottomSpace}
                            onChange={(e) => setQrGenBottomSpace(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Sub-View: 1-5 — All non-QR tool views */}
            {activeTool !== 'qr-generator' && (processing ? (
              <div className="workspace-main" style={{ minHeight: '380px' }}>
                <div className="progress-container">
                  <div className="scanner-container">
                    <div className="scanner-line"></div>
                    <FileText size={64} className="scanner-icon" />
                  </div>
                  <svg className="svg-morph-spinner" viewBox="0 0 50 50">
                    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
                  </svg>
                  <div style={{ fontWeight: '600', marginTop: '1rem' }}>{processingStatus}</div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{progress}% Complete</div>
                </div>
              </div>
            ) : (activeTool !== 'qr-generator' && resultBlob) ? (
              <div className="workspace-main workspace-success-card" style={{ minHeight: '380px' }}>
                <div className="success-screen">
                  <div className="success-checkmark-wrapper">
                    <div className="halo-wave w1"></div>
                    <div className="halo-wave w2"></div>
                    <svg className="checkmark-svg" viewBox="0 0 52 52">
                      <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                      <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                    </svg>
                    <div className="confetti-container">
                      <div className="confetti-particle p1"></div>
                      <div className="confetti-particle p2"></div>
                      <div className="confetti-particle p3"></div>
                      <div className="confetti-particle p4"></div>
                      <div className="confetti-particle p5"></div>
                      <div className="confetti-particle p6"></div>
                      <div className="confetti-particle p7"></div>
                      <div className="confetti-particle p8"></div>
                    </div>
                  </div>
                  <div className="success-text-container">
                    <h3>Your file is ready!</h3>
                    <p>The processing completed entirely in your browser. Click download to retrieve your file.</p>
                  </div>
                  <div className="success-actions-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center', width: '100%', maxWidth: '400px', alignItems: 'center' }}>
                    <button className="btn-download-success" onClick={triggerDownload} style={{ width: '100%', padding: '0.75rem' }}>
                      <Download size={18} /> Download {
                        currentTool.id === 'pdf-to-img' ? 'ZIP' :
                          currentTool.id === 'pdf-to-docx' ? 'Word DOCX' :
                            currentTool.id === 'pdf-to-pptx' ? 'PowerPoint PPTX' :
                              currentTool.id === 'pdf-to-xlsx' ? 'Excel XLSX' :
                                'PDF'
                      }
                    </button>
                    {navigator.share && (
                      <button
                        className="btn-share-file-action"
                        onClick={() => handleShareClick(resultBlob, resultName, resultBlob.type || 'application/pdf')}
                        style={{ width: '100%' }}
                      >
                        <Share2 size={18} /> Share File
                      </button>
                    )}
                    <button className="btn-reset" onClick={resetToolState} style={{ marginTop: '0.5rem', width: '100%' }}>
                      Perform Another Operation
                    </button>
                  </div>
                </div>
              </div>
            ) : extractedText ? (
              /* Sub-View: 3. Extracted Text Screen */
              <div className="workspace-layout">
                <div className="workspace-main" style={{ display: 'block', padding: '1.5rem', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Extracted Text Result</h3>
                    <button className="btn-upload" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => {
                      navigator.clipboard.writeText(extractedText);
                      alert('Text copied to clipboard!');
                    }}>
                      Copy to Clipboard
                    </button>
                  </div>
                  <pre style={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    whiteSpace: 'pre-wrap',
                    backgroundColor: 'var(--bg-primary)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    textAlign: 'left'
                  }}>
                    {extractedText}
                  </pre>
                </div>
                <div className="workspace-sidebar">
                  <div className="sidebar-section">
                    <h3>Actions</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You can copy the extracted text or download it as a raw text file.</p>
                    <button className="btn-action-primary" style={{ backgroundColor: 'var(--success-color)' }} onClick={() => {
                      const textBlob = new Blob([extractedText], { type: 'text/plain' });
                      downloadBlob(textBlob, `${uploadedFiles[0].name.replace('.pdf', '')}_text.txt`);
                    }}>
                      <Download size={18} /> Download TXT
                    </button>
                    <button className="btn-reset" style={{ width: '100%' }} onClick={resetToolState}>
                      Upload Another File
                    </button>
                  </div>
                </div>
              </div>
            ) : (activeTool !== 'qr-generator' && uploadedFiles.length === 0) ? (
              /* Sub-View: 4. Empty state */
              <div
                className={`workspace-main dropzone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('workspace-file-input').click()}
                style={{ minHeight: '460px', gap: '1.5rem' }}
              >
                <div style={{
                  width: '88px', height: '88px', borderRadius: '50%',
                  backgroundColor: 'var(--accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--accent-color)',
                  boxShadow: '0 0 0 8px var(--accent-light)',
                }}>
                  <UploadCloud size={36} style={{ color: 'var(--accent-color)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Drag &amp; Drop your file here
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    or click anywhere to browse from your computer
                  </p>
                </div>

                <button
                  className="btn-upload"
                  style={{ padding: '0.75rem 2.5rem', fontSize: '0.95rem', fontWeight: '700', borderRadius: 'var(--radius-md)' }}
                  onClick={(e) => { e.stopPropagation(); document.getElementById('workspace-file-input').click(); }}
                >
                  Select {currentTool.multiple ? 'Files' : 'File'}
                </button>

                <input
                  id="workspace-file-input"
                  type="file"
                  className="file-input"
                  multiple={currentTool.multiple}
                  accept={currentTool.accept}
                  onChange={handleFileInput}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Supported:</span>
                  {currentTool.accept.split(',').map(fmt => (
                    <span key={fmt} style={{
                      fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.6rem',
                      backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {fmt.trim().replace('.', '')}
                    </span>
                  ))}
                </div>
              </div>
            ) : loadingPreviews ? (
              /* Sub-View: 4b. Smooth transition rendering page animation */
              <div 
                className="workspace-main rendering-loader-container" 
                style={{ 
                  height: '480px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '2.5rem',
                  padding: '3rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Scanner effect overlay */}
                <div className="scanner-line"></div>
                
                {/* 3D-like document loading illustration */}
                <div className="rendering-document-wrapper">
                  <div className="rendering-doc-page page-back"></div>
                  <div className="rendering-doc-page page-mid"></div>
                  <div className="rendering-doc-page page-front">
                    <div className="rendering-doc-logo">PDF</div>
                    <div className="rendering-progress-ring-container">
                      <svg className="progress-ring-svg" viewBox="0 0 36 36">
                        <path
                          className="progress-ring-bg"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="progress-ring-bar"
                          strokeDasharray={`${previewProgress}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="rendering-progress-text">{previewProgress}%</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'center', zIndex: 5 }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Preparing document pages...
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '340px' }}>
                    Generating high-fidelity page previews directly in your browser.
                  </p>
                </div>
              </div>
            ) : (
              /* Sub-View: 5. File workspace with sidebars */
              <div className="workspace-layout">
                {/* Left Workspace Panel */}
                <div className="workspace-main" style={{ justifyContent: 'flex-start', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                      Selected {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
                    </div>
                    {currentTool.multiple && (
                      <button className="btn-reset" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => document.getElementById('workspace-file-input-add').click()}>
                        + Add More Files
                      </button>
                    )}
                    <input
                      id="workspace-file-input-add"
                      type="file"
                      className="file-input"
                      multiple
                      accept={currentTool.accept}
                      onChange={handleFileInput}
                    />
                  </div>

                  {/* Merge View or General File List */}
                  {activeTool === 'scanner' ? (
                    scannerImageSrc ? (
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                          Drag corners to crop, or use sidebar filters to enhance the document
                        </div>
                        
                        <div
                          className="scanner-preview-wrapper"
                          style={{
                            position: 'relative',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-md)',
                            backgroundColor: 'var(--bg-secondary)',
                            maxWidth: '100%',
                            maxHeight: 'min(65vh, 520px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                            userSelect: 'none'
                          }}
                        >
                          <img
                            src={scannerImageSrc}
                            style={{
                              maxWidth: '100%',
                              maxHeight: 'min(65vh, 520px)',
                              display: 'block',
                              pointerEvents: 'none'
                            }}
                            alt="Scanner Source"
                          />
                          
                          {/* Dark backdrop overlay outside the crop box */}
                          <div
                            style={{
                              position: 'absolute',
                              left: `${scannerCrop.x}%`,
                              top: `${scannerCrop.y}%`,
                              width: `${scannerCrop.w}%`,
                              height: `${scannerCrop.h}%`,
                              border: '2px solid var(--accent-color)',
                              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                              cursor: 'move'
                            }}
                            onMouseDown={(e) => handlePointerDown(e, 'center')}
                            onTouchStart={(e) => handlePointerDown(e, 'center')}
                          >
                            {/* Drag handles for corners */}
                            <div
                              style={{ position: 'absolute', left: '-7px', top: '-7px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', border: '2px solid white', cursor: 'nwse-resize', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                              onMouseDown={(e) => { e.stopPropagation(); handlePointerDown(e, 'tl'); }}
                              onTouchStart={(e) => { e.stopPropagation(); handlePointerDown(e, 'tl'); }}
                            />
                            <div
                              style={{ position: 'absolute', right: '-7px', top: '-7px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', border: '2px solid white', cursor: 'nesw-resize', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                              onMouseDown={(e) => { e.stopPropagation(); handlePointerDown(e, 'tr'); }}
                              onTouchStart={(e) => { e.stopPropagation(); handlePointerDown(e, 'tr'); }}
                            />
                            <div
                              style={{ position: 'absolute', left: '-7px', bottom: '-7px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', border: '2px solid white', cursor: 'nesw-resize', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                              onMouseDown={(e) => { e.stopPropagation(); handlePointerDown(e, 'bl'); }}
                              onTouchStart={(e) => { e.stopPropagation(); handlePointerDown(e, 'bl'); }}
                            />
                            <div
                              style={{ position: 'absolute', right: '-7px', bottom: '-7px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', border: '2px solid white', cursor: 'nwse-resize', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                              onMouseDown={(e) => { e.stopPropagation(); handlePointerDown(e, 'br'); }}
                              onTouchStart={(e) => { e.stopPropagation(); handlePointerDown(e, 'br'); }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="skeleton-pulse" style={{ width: '100%', height: '300px', borderRadius: 'var(--radius-md)' }} />
                    )
                  ) : activeTool === 'merge' ? (
                    <div className="files-preview-container">
                      <div className="files-grid" style={{ gridTemplateColumns: '1fr' }}>
                        {uploadedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              padding: '0.75rem 1rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                              <div style={{ width: '32px', height: '40px', flexShrink: 0, border: '1px solid var(--border-color)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
                                <img src={file.firstPagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="pdf first page" />
                                <button
                                  className="btn-preview-eye"
                                  style={{ width: '18px', height: '18px', bottom: '2px', right: '2px', padding: 0 }}
                                  title="Preview Page"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openLightbox(file, 0, file.firstPagePreview, file.name);
                                  }}
                                >
                                  <Eye size={10} />
                                </button>
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.pageCount} pages
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                              <button className="btn-icon" style={{ padding: '4px' }} disabled={idx === 0} onClick={() => moveFileOrder(idx, -1)}>
                                ▲
                              </button>
                              <button className="btn-icon" style={{ padding: '4px' }} disabled={idx === uploadedFiles.length - 1} onClick={() => moveFileOrder(idx, 1)}>
                                ▼
                              </button>
                              <button className="btn-icon" style={{ padding: '4px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }} onClick={() => removeFile(idx)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : activeTool === 'organize' ? (
                    /* Visual Page Organizer Grid using Pre-rendered static images for 0ms lag */
                    <div className="files-preview-container">
                      <div className="files-grid">
                        {organizePages.map((page, idx) => {
                          const previewObj = pagePreviews.find(p => p.originalIndex === page.originalIndex);
                          return (
                            <div
                              key={page.id}
                              className={`file-preview-card ${draggedPageIndex === idx ? 'dragging' : ''}`}
                              draggable={true}
                              onDragStart={(e) => {
                                setDraggedPageIndex(idx);
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', idx);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (draggedPageIndex === null || draggedPageIndex === idx) return;

                                const list = [...organizePages];
                                const draggedItem = list[draggedPageIndex];
                                list.splice(draggedPageIndex, 1);
                                list.splice(idx, 0, draggedItem);

                                setDraggedPageIndex(idx);
                                setOrganizePages(list);
                              }}
                              onDragEnd={() => setDraggedPageIndex(null)}
                              style={{
                                cursor: 'grab',
                                opacity: draggedPageIndex === idx ? 0.4 : 1,
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                border: draggedPageIndex === idx ? '2px dashed var(--accent-color)' : '1px solid var(--border-color)',
                                animationDelay: `${idx * 25}ms`
                              }}
                            >
                              <div className="file-preview-thumbnail">
                                {previewObj ? (
                                  <img
                                    src={previewObj.dataUrl}
                                    className="file-preview-img"
                                    style={{ transform: `rotate(${page.rotation}deg)` }}
                                    alt={`Page ${page.originalIndex + 1}`}
                                  />
                                ) : (
                                  <div className="skeleton-pulse" />
                                )}
                                <div className="card-actions">
                                  <button className="btn-card-action rotate-btn" title="Rotate Page" onClick={() => rotateOrganizePage(idx)}>
                                    <RotateCw size={12} />
                                  </button>
                                  <button className="btn-card-action" title="Delete Page" onClick={() => deleteOrganizePage(idx)}>
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                {previewObj && (
                                  <button
                                    className="btn-preview-eye"
                                    title="Preview Page"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openLightbox(uploadedFiles[0], page.originalIndex, previewObj.dataUrl, `Page ${page.originalIndex + 1}`, page.rotation);
                                    }}
                                  >
                                    <Eye size={14} />
                                  </button>
                                )}
                              </div>
                              <div className="file-preview-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.5rem 0.75rem' }}>
                                <div className="file-preview-name" style={{ margin: 0 }}>Page {page.originalIndex + 1}</div>
                                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', cursor: 'grab' }}>
                                  <GripVertical size={14} />
                                </div>
                              </div>
                              <div className="card-nav-buttons">
                                <button className="btn-icon btn-nav" disabled={idx === 0} onClick={() => moveOrganizePage(idx, -1)}>
                                  ◀
                                </button>
                                <button className="btn-icon btn-nav" disabled={idx === organizePages.length - 1} onClick={() => moveOrganizePage(idx, 1)}>
                                  ▶
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : activeTool === 'split' ? (
                    /* Interactive Visual Page Selection Grid for Splitting PDF */
                    <div className="files-preview-container">
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Click on pages below to visually select them for splitting, or type the ranges manually on the right panel.
                      </div>
                      <div className="files-grid">
                        {Array.from({ length: uploadedFiles[0].pageCount }).map((_, originalIdx) => {
                          const isSelected = selectedPagesForSplit.has(originalIdx);
                          const previewObj = pagePreviews.find(p => p.originalIndex === originalIdx);
                          return (
                            <div
                              key={originalIdx}
                              className={`file-preview-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => toggleSplitPageSelection(originalIdx)}
                              style={{ cursor: 'pointer', animationDelay: `${originalIdx * 25}ms` }}
                            >
                              <div className="select-badge">✓</div>
                              <div className="file-preview-thumbnail" style={{ position: 'relative' }}>
                                {previewObj ? (
                                  <>
                                    <img
                                      src={previewObj.dataUrl}
                                      className="file-preview-img"
                                      alt={`Page ${originalIdx + 1}`}
                                    />
                                    <button
                                      className="btn-preview-eye"
                                      title="Preview Page"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openLightbox(uploadedFiles[0], originalIdx, previewObj.dataUrl, `Page ${originalIdx + 1}`);
                                      }}
                                    >
                                      <Eye size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <div className="skeleton-pulse" />
                                )}
                              </div>
                              <div className="file-preview-info">
                                <div className="file-preview-name">Page {originalIdx + 1}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (activeTool === 'sign' || activeTool === 'qr') ? (
                    /* Visual Signature / QR Code Placement Layout */
                    activePageToSign !== null ? (
                      /* visual page placement zoom view */
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', alignItems: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button className="btn-back" style={{ padding: '0.35rem 0.6rem' }} onClick={() => setActivePageToSign(null)}>
                            ◀ Cancel
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Placing {activeTool === 'qr' ? 'QR Code' : 'signature'} on Page {activePageToSign + 1}</span>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-upload" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', backgroundColor: 'var(--border-color)', color: 'var(--text-primary)' }} onClick={() => saveSignaturePlacement(false)}>
                              Apply to This Page
                            </button>
                            <button className="btn-upload" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', backgroundColor: 'var(--success-color)' }} onClick={() => saveSignaturePlacement(true)}>
                              Apply to All Pages
                            </button>
                          </div>
                        </div>

                        {/* Interactive Page Canvas Wrapper */}
                        <div
                          onMouseDown={handleBackgroundMouseDown}
                          onTouchStart={handleBackgroundMouseDown}
                          style={{
                            position: 'relative',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-md)',
                            backgroundColor: 'var(--bg-secondary)',
                            width: '100%',
                            maxWidth: '100%',
                            height: 'min(75vh, 680px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                            cursor: canvasZoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                            userSelect: 'none'
                          }}
                        >
                          <div style={{
                            position: 'relative',
                            transform: `scale(${canvasZoom}) translate(${panPos.x}px, ${panPos.y}px)`,
                            transformOrigin: 'center center',
                            transition: isPanning ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            width: renderedPageDimensions.w ? `${renderedPageDimensions.w}px` : 'auto',
                            height: renderedPageDimensions.h ? `${renderedPageDimensions.h}px` : 'auto',
                            display: 'inline-flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            border: '1px solid rgba(0, 0, 0, 0.08)'
                          }}>
                            <img
                              ref={pageImageRef}
                              src={highResSignPageUrl || pagePreviews.find(p => p.originalIndex === activePageToSign)?.dataUrl}
                              onLoad={handlePageImageLoad}
                              style={{
                                display: 'block',
                                width: 'auto',
                                height: '100%',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                pointerEvents: 'none'
                              }}
                              alt="page to stamp"
                            />

                            {/* Draggable signature element */}
                            <div
                              className="draggable-stamp"
                              style={{
                                position: 'absolute',
                                left: `${sigPos.x}px`,
                                top: `${sigPos.y}px`,
                                width: `${sigPos.w}px`,
                                height: `${sigPos.h}px`,
                                border: '1.5px dashed var(--accent-color)',
                                cursor: 'move',
                                backgroundColor: 'rgba(254, 226, 226, 0.2)',
                                touchAction: 'none',
                                zIndex: 10
                              }}
                              onMouseDown={handleSignatureMouseDown}
                              onTouchStart={handleSignatureMouseDown}
                            >
                              <img src={signatureDataUrl} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} alt="stamp seal" />
                            </div>
                          </div>

                          {/* Floating Zoom Controls */}
                          <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '4px',
                            boxShadow: 'var(--shadow-md)',
                            zIndex: 20
                          }}>
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ padding: '2px 8px', fontSize: '0.8rem', fontWeight: 'bold', minWidth: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => setCanvasZoom(prev => Math.max(1, prev - 0.25))}
                              disabled={canvasZoom <= 1}
                            >
                              -
                            </button>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', minWidth: '42px', textAlign: 'center', color: 'var(--text-primary)' }}>
                              {Math.round(canvasZoom * 100)}%
                            </span>
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ padding: '2px 8px', fontSize: '0.8rem', fontWeight: 'bold', minWidth: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => setCanvasZoom(prev => Math.min(3, prev + 0.25))}
                              disabled={canvasZoom >= 3}
                            >
                              +
                            </button>
                            <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ padding: '2px 6px', fontSize: '0.7rem', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => { setCanvasZoom(2); setPanPos({ x: 0, y: 0 }); }}
                              disabled={canvasZoom === 2 && panPos.x === 0 && panPos.y === 0}
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          Drag the stamp box to position it. Use the slider on the right to resize.
                        </span>
                      </div>
                    ) : (
                      /* page selection list for stamping */
                      <div className="files-preview-container">
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          {signatureDataUrl ? `Choose a page below to visually stamp your ${activeTool === 'qr' ? 'QR Code' : 'signature'}.` : 'Please set up your options in the right panel first.'}
                        </div>
                        <div className="files-grid">
                          {Array.from({ length: uploadedFiles[0].pageCount }).map((_, originalIdx) => {
                            const previewObj = pagePreviews.find(p => p.originalIndex === originalIdx);
                            const pageStampCount = placedSignatures.filter(s => s.pageIndex === originalIdx).length;
                            const pageCropSig = placedCrops[originalIdx];
                            return (
                              <div
                                key={originalIdx}
                                className="file-preview-card"
                                style={{
                                  border: pageStampCount > 0 ? '1.5px solid var(--success-color)' : '1px solid var(--border-color)',
                                  animationDelay: `${originalIdx * 25}ms`
                                }}
                              >
                                {pageStampCount > 0 && (
                                  <div style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: 'var(--success-color)', color: 'white', borderRadius: 'var(--radius-full)', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '800', zIndex: 10 }}>
                                    {pageStampCount}
                                  </div>
                                )}
                                <div className="file-preview-thumbnail" style={{ position: 'relative', overflow: 'hidden' }}>
                                  {previewObj ? (
                                    <>
                                      <div style={{ position: 'relative', display: 'inline-flex', maxHeight: '100%', maxWidth: '100%', overflow: 'hidden', clipPath: pageCropSig ? `inset(${pageCropSig.top}% ${pageCropSig.right}% ${pageCropSig.bottom}% ${pageCropSig.left}%)` : 'none', transform: pageCropSig ? `scale(${1 / Math.max(0.1, 1 - Math.max(pageCropSig.left + pageCropSig.right, pageCropSig.top + pageCropSig.bottom) / 100)})` : 'none', transition: 'all 0.2s ease' }}>
                                        <img
                                          src={previewObj.dataUrl}
                                          className="file-preview-img"
                                          alt={`Page ${originalIdx + 1}`}
                                          style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                        {placedSignatures.filter(s => s.pageIndex === originalIdx).map((stamp, sIdx) => {
                                          const leftPct = (stamp.x / stamp.pageW) * 100;
                                          const topPct = (stamp.y / stamp.pageH) * 100;
                                          const widthPct = (stamp.width / stamp.pageW) * 100;
                                          const heightPct = (stamp.height / stamp.pageH) * 100;

                                          return (
                                            <img
                                              key={sIdx}
                                              src={stamp.dataUrl}
                                              style={{
                                                position: 'absolute',
                                                left: `${leftPct}%`,
                                                top: `${topPct}%`,
                                                width: `${widthPct}%`,
                                                height: `${heightPct}%`,
                                                pointerEvents: 'none'
                                              }}
                                              alt="signature overlay"
                                            />
                                          );
                                        })}
                                      </div>
                                      <button
                                        className="btn-preview-eye"
                                        title="Preview Page"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openLightbox(uploadedFiles[0], originalIdx, previewObj.dataUrl, `Page ${originalIdx + 1}`);
                                        }}
                                      >
                                        <Eye size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <div className="skeleton-pulse" />
                                  )}
                                </div>
                                <div className="file-preview-info" style={{ marginTop: '4px' }}>
                                  <div className="file-preview-name">Page {originalIdx + 1}</div>
                                  <button
                                    className="btn-upload"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', width: '100%', marginTop: '4px' }}
                                    disabled={!signatureDataUrl}
                                    onClick={() => {
                                      setRenderedPageDimensions({ w: 0, h: 0 });
                                      setActivePageToSign(originalIdx);
                                      // Center the stamp box by default
                                      const w = activeTool === 'qr' ? 100 : 120;
                                      setSigPos({ x: 40, y: 40, w, h: Math.round(w / signatureAspectRatio) });
                                    }}
                                  >
                                    Stamp {activeTool === 'qr' ? 'QR' : 'Sign'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  ) : activeTool === 'crop' ? (
                    /* Visual Bounding Box Crop Layout */
                    activePageToCrop !== null ? (
                      /* visual page placement crop view */
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', alignItems: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button className="btn-back" style={{ padding: '0.35rem 0.6rem' }} onClick={() => setActivePageToCrop(null)}>
                            ◀ Back to Pages
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Adjusting Crop Bounding Box on Page {activePageToCrop + 1}</span>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-upload" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', backgroundColor: 'var(--border-color)', color: 'var(--text-primary)' }} onClick={() => saveCropMargins(false)}>
                              Apply to This Page
                            </button>
                            <button className="btn-upload" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', backgroundColor: 'var(--success-color)' }} onClick={() => saveCropMargins(true)}>
                              Apply to All Pages
                            </button>
                          </div>
                        </div>

                        {/* Interactive Page Crop Canvas Wrapper */}
                        <div
                          onMouseDown={handleBackgroundMouseDown}
                          onTouchStart={handleBackgroundMouseDown}
                          style={{
                            position: 'relative',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-md)',
                            backgroundColor: 'var(--bg-secondary)',
                            width: '100%',
                            maxWidth: '100%',
                            height: 'min(75vh, 680px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                            cursor: canvasZoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                            userSelect: 'none'
                          }}
                        >
                          {/* Inner container that bounds the actual page image */}
                          <div style={{
                            position: 'relative',
                            transform: `scale(${canvasZoom}) translate(${panPos.x}px, ${panPos.y}px)`,
                            transformOrigin: 'center center',
                            transition: isPanning ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            width: renderedPageDimensions.w ? `${renderedPageDimensions.w}px` : 'auto',
                            height: renderedPageDimensions.h ? `${renderedPageDimensions.h}px` : 'auto',
                            display: 'inline-flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                          }}>
                            <img
                              ref={pageImageRef}
                              src={highResCropPageUrl || pagePreviews.find(p => p.originalIndex === activePageToCrop)?.dataUrl}
                              onLoad={handlePageImageLoad}
                              style={{
                                display: 'block',
                                width: 'auto',
                                height: '100%',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                pointerEvents: 'none'
                              }}
                              alt="page to crop"
                            />

                            {/* Shaded/Translucent overlays representing cropped-out areas */}
                            {/* Top mask */}
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: `${cropMargins.top}%`,
                              backgroundColor: 'rgba(15, 23, 42, 0.55)',
                              pointerEvents: 'none',
                              backdropFilter: 'blur(1px)'
                            }} />
                            {/* Bottom mask */}
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: `${cropMargins.bottom}%`,
                              backgroundColor: 'rgba(15, 23, 42, 0.55)',
                              pointerEvents: 'none',
                              backdropFilter: 'blur(1px)'
                            }} />
                            {/* Left mask */}
                            <div style={{
                              position: 'absolute',
                              top: `${cropMargins.top}%`,
                              bottom: `${cropMargins.bottom}%`,
                              left: 0,
                              width: `${cropMargins.left}%`,
                              backgroundColor: 'rgba(15, 23, 42, 0.55)',
                              pointerEvents: 'none',
                              backdropFilter: 'blur(1px)'
                            }} />
                            {/* Right mask */}
                            <div style={{
                              position: 'absolute',
                              top: `${cropMargins.top}%`,
                              bottom: `${cropMargins.bottom}%`,
                              right: 0,
                              width: `${cropMargins.right}%`,
                              backgroundColor: 'rgba(15, 23, 42, 0.55)',
                              pointerEvents: 'none',
                              backdropFilter: 'blur(1px)'
                            }} />

                            {/* Bounding Box Outline */}
                            <div
                              style={{
                                position: 'absolute',
                                top: `${cropMargins.top}%`,
                                bottom: `${cropMargins.bottom}%`,
                                left: `${cropMargins.left}%`,
                                right: `${cropMargins.right}%`,
                                border: '2.5px dashed var(--accent-color)',
                                boxSizing: 'border-box',
                                zIndex: 10
                              }}
                            >
                              {/* Edge drag handles */}
                              {/* Top edge */}
                              <div
                                onMouseDown={(e) => handleCropHandleMouseDown('top', e)}
                                onTouchStart={(e) => handleCropHandleMouseDown('top', e)}
                                style={{ position: 'absolute', top: '-4px', left: '10px', right: '10px', height: '8px', cursor: 'ns-resize', zIndex: 15 }}
                              />
                              {/* Bottom edge */}
                              <div
                                onMouseDown={(e) => handleCropHandleMouseDown('bottom', e)}
                                onTouchStart={(e) => handleCropHandleMouseDown('bottom', e)}
                                style={{ position: 'absolute', bottom: '-4px', left: '10px', right: '10px', height: '8px', cursor: 'ns-resize', zIndex: 15 }}
                              />
                              {/* Left edge */}
                              <div
                                onMouseDown={(e) => handleCropHandleMouseDown('left', e)}
                                onTouchStart={(e) => handleCropHandleMouseDown('left', e)}
                                style={{ position: 'absolute', left: '-4px', top: '10px', bottom: '10px', width: '8px', cursor: 'ew-resize', zIndex: 15 }}
                              />
                              {/* Right edge */}
                              <div
                                onMouseDown={(e) => handleCropHandleMouseDown('right', e)}
                                onTouchStart={(e) => handleCropHandleMouseDown('right', e)}
                                style={{ position: 'absolute', right: '-4px', top: '10px', bottom: '10px', width: '8px', cursor: 'ew-resize', zIndex: 15 }}
                              />

                              {/* Corner drag handles */}
                              {/* Top-Left */}
                              <div
                                onMouseDown={(e) => handleCropHandleMouseDown('tl', e)}
                                onTouchStart={(e) => handleCropHandleMouseDown('tl', e)}
                                style={{
                                  position: 'absolute',
                                  top: '-7px',
                                  left: '-7px',
                                  width: '14px',
                                  height: '14px',
                                  backgroundColor: '#ffffff',
                                  border: '2.5px solid var(--accent-color)',
                                  borderRadius: '2px',
                                  cursor: 'nwse-resize',
                                  zIndex: 20
                                }}
                              />
                              {/* Top-Right */}
                              <div
                                onMouseDown={(e) => handleCropHandleMouseDown('tr', e)}
                                onTouchStart={(e) => handleCropHandleMouseDown('tr', e)}
                                style={{
                                  position: 'absolute',
                                  top: '-7px',
                                  right: '-7px',
                                  width: '14px',
                                  height: '14px',
                                  backgroundColor: '#ffffff',
                                  border: '2.5px solid var(--accent-color)',
                                  borderRadius: '2px',
                                  cursor: 'nesw-resize',
                                  zIndex: 20
                                }}
                              />
                              {/* Bottom-Left */}
                              <div
                                onMouseDown={(e) => handleCropHandleMouseDown('bl', e)}
                                onTouchStart={(e) => handleCropHandleMouseDown('bl', e)}
                                style={{
                                  position: 'absolute',
                                  bottom: '-7px',
                                  left: '-7px',
                                  width: '14px',
                                  height: '14px',
                                  backgroundColor: '#ffffff',
                                  border: '2.5px solid var(--accent-color)',
                                  borderRadius: '2px',
                                  cursor: 'nesw-resize',
                                  zIndex: 20
                                }}
                              />
                              {/* Bottom-Right */}
                              <div
                                onMouseDown={(e) => handleCropHandleMouseDown('br', e)}
                                onTouchStart={(e) => handleCropHandleMouseDown('br', e)}
                                style={{
                                  position: 'absolute',
                                  bottom: '-7px',
                                  right: '-7px',
                                  width: '14px',
                                  height: '14px',
                                  backgroundColor: '#ffffff',
                                  border: '2.5px solid var(--accent-color)',
                                  borderRadius: '2px',
                                  cursor: 'nwse-resize',
                                  zIndex: 20
                                }}
                              />
                            </div>
                          </div>

                          {/* Floating Zoom Controls */}
                          <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '4px',
                            boxShadow: 'var(--shadow-md)',
                            zIndex: 20
                          }}>
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ padding: '2px 8px', fontSize: '0.8rem', fontWeight: 'bold', minWidth: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => setCanvasZoom(prev => Math.max(1, prev - 0.25))}
                              disabled={canvasZoom <= 1}
                            >
                              -
                            </button>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', minWidth: '42px', textAlign: 'center', color: 'var(--text-primary)' }}>
                              {Math.round(canvasZoom * 100)}%
                            </span>
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ padding: '2px 8px', fontSize: '0.8rem', fontWeight: 'bold', minWidth: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => setCanvasZoom(prev => Math.min(3, prev + 0.25))}
                              disabled={canvasZoom >= 3}
                            >
                              +
                            </button>
                            <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ padding: '2px 6px', fontSize: '0.7rem', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => { setCanvasZoom(2); setPanPos({ x: 0, y: 0 }); }}
                              disabled={canvasZoom === 2 && panPos.x === 0 && panPos.y === 0}
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          Drag the dashed borders or corners to adjust crop margins. Or use sliders in the right panel.
                        </span>
                      </div>
                    ) : (
                      /* page selection list for cropping */
                      <div className="files-preview-container">
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          Choose a page below to visually preview and crop the page margins.
                        </div>
                        <div className="files-grid">
                          {Array.from({ length: uploadedFiles[0].pageCount }).map((_, originalIdx) => {
                            const previewObj = pagePreviews.find(p => p.originalIndex === originalIdx);
                            const pageCrop = placedCrops[originalIdx];
                            return (
                              <div
                                key={originalIdx}
                                className="file-preview-card"
                                style={{ border: pageCrop ? '1.5px solid var(--success-color)' : '1px solid var(--border-color)' }}
                              >
                                {pageCrop && (
                                  <div style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: 'var(--success-color)', color: 'white', borderRadius: 'var(--radius-md)', padding: '2px 6px', fontSize: '9px', fontWeight: '800', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>Cropped ({pageCrop.left}%)</span>
                                    <button
                                      style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', fontWeight: '900', fontSize: '10px' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPlacedCrops(prev => {
                                          const next = { ...prev };
                                          delete next[originalIdx];
                                          return next;
                                        });
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}
                                <div className="file-preview-thumbnail" style={{ position: 'relative', overflow: 'hidden' }}>
                                  {previewObj ? (
                                    <>
                                      <div style={{
                                        position: 'relative',
                                        display: 'inline-flex',
                                        maxHeight: '100%',
                                        maxWidth: '100%',
                                        overflow: 'hidden',
                                        clipPath: pageCrop ? `inset(${pageCrop.top}% ${pageCrop.right}% ${pageCrop.bottom}% ${pageCrop.left}%)` : 'none',
                                        transform: pageCrop ? `scale(${1 / Math.max(0.1, 1 - Math.max(pageCrop.left + pageCrop.right, pageCrop.top + pageCrop.bottom) / 100)})` : 'none',
                                        transition: 'all 0.2s ease'
                                      }}>
                                        <img
                                          src={previewObj.dataUrl}
                                          className="file-preview-img"
                                          alt={`Page ${originalIdx + 1}`}
                                          style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                      </div>
                                      <button
                                        className="btn-preview-eye"
                                        title="Preview Page"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const title = `Page ${originalIdx + 1}${pageCrop ? ' (Cropped)' : ''}`;

                                          // Show low-res cropped thumbnail immediately as fallback
                                          const fallbackCropped = pageCrop
                                            ? await getCroppedDataUrl(previewObj.dataUrl, pageCrop)
                                            : previewObj.dataUrl;
                                          setPreviewModalTitle(title);
                                          setPreviewModalRotation(0);
                                          setPreviewModalImage(fallbackCropped);
                                          setPreviewModalPageIndex(originalIdx);
                                          setIsHighResRendered(false);
                                          setLightboxLoading(true);

                                          // Render hi-res from PDF buffer, then apply crop
                                          try {
                                            if (window.pdfjsLib && uploadedFiles[0]?.buffer) {
                                              const loadingTask = window.pdfjsLib.getDocument({ data: uploadedFiles[0].buffer.slice(0) });
                                              const pdf = await loadingTask.promise;
                                              const pdfPage = await pdf.getPage(originalIdx + 1);
                                              const viewport = pdfPage.getViewport({ scale: 2.0 });
                                              const hiResCanvas = document.createElement('canvas');
                                              hiResCanvas.width = viewport.width;
                                              hiResCanvas.height = viewport.height;
                                              await pdfPage.render({ canvasContext: hiResCanvas.getContext('2d'), viewport }).promise;
                                              const hiResUrl = hiResCanvas.toDataURL('image/jpeg', 0.95);
                                              const hiResCropped = pageCrop
                                                ? await getCroppedDataUrl(hiResUrl, pageCrop)
                                                : hiResUrl;
                                              setPreviewModalImage(hiResCropped);
                                              setIsHighResRendered(true);
                                            }
                                          } catch (err) {
                                            console.error('High-res crop preview failed:', err);
                                          } finally {
                                            setLightboxLoading(false);
                                          }
                                        }}
                                      >
                                        <Eye size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <div className="skeleton-pulse" />
                                  )}
                                </div>
                                <div className="file-preview-info" style={{ marginTop: '4px' }}>
                                  <div className="file-preview-name">Page {originalIdx + 1}</div>
                                  <button
                                    className="btn-upload"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', width: '100%', marginTop: '4px' }}
                                    onClick={() => {
                                      setRenderedPageDimensions({ w: 0, h: 0 });
                                      setActivePageToCrop(originalIdx);
                                    }}
                                  >
                                    Crop Bounding Box
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  ) : (activeTool === 'watermark' || activeTool === 'page-numbers') ? (
                    /* Visual Page Watermark & Page Numbers Grid */
                    <div className="files-preview-container">
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        {activeTool === 'watermark'
                          ? 'Previewing watermark on your pages below. Update text and styling in the right panel.'
                          : 'Previewing page numbers on your pages below. Update position and styling in the right panel.'}
                      </div>
                      <div className="files-grid">
                        {Array.from({ length: uploadedFiles[0].pageCount }).map((_, originalIdx) => {
                          const previewObj = pagePreviews.find(p => p.originalIndex === originalIdx);
                          const pageCropW = placedCrops[originalIdx];
                          return (
                            <div
                              key={originalIdx}
                              className="file-preview-card"
                              style={{ animationDelay: `${originalIdx * 25}ms` }}
                            >
                              <div
                                className="file-preview-thumbnail"
                                style={{
                                  position: 'relative',
                                  overflow: 'hidden',
                                  containerType: 'inline-size'
                                }}
                              >
                                {previewObj ? (
                                  <>
                                    <div style={{ position: 'relative', display: 'inline-flex', maxHeight: '100%', maxWidth: '100%', overflow: 'hidden', clipPath: pageCropW ? `inset(${pageCropW.top}% ${pageCropW.right}% ${pageCropW.bottom}% ${pageCropW.left}%)` : 'none', transform: pageCropW ? `scale(${1 / Math.max(0.1, 1 - Math.max(pageCropW.left + pageCropW.right, pageCropW.top + pageCropW.bottom) / 100)})` : 'none', transition: 'all 0.2s ease' }}>
                                      <img
                                        src={previewObj.dataUrl}
                                        className="file-preview-img"
                                        alt={`Page ${originalIdx + 1}`}
                                        style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                      />
                                    </div>

                                    {/* Watermark Overlay */}
                                    {activeTool === 'watermark' && (
                                      <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        pointerEvents: 'none',
                                        overflow: 'hidden'
                                      }}>
                                        <div style={{
                                          color: watermarkOptions.color || '#ef4444',
                                          opacity: watermarkOptions.opacity !== undefined ? watermarkOptions.opacity : 0.3,
                                          fontSize: `${(watermarkOptions.size || 48) / 595 * 100}cqw`,
                                          fontWeight: 'bold',
                                          transform: `rotate(${-watermarkOptions.rotation || -45}deg)`,
                                          whiteSpace: 'nowrap',
                                          userSelect: 'none',
                                          textAlign: 'center',
                                          fontFamily: 'Helvetica, Arial, sans-serif'
                                        }}>
                                          {watermarkOptions.text || 'CONFIDENTIAL'}
                                        </div>
                                      </div>
                                    )}

                                    {/* Page Number Overlay */}
                                    {activeTool === 'page-numbers' && (
                                      <div style={{
                                        position: 'absolute',
                                        pointerEvents: 'none',
                                        color: pageNumberOptions.color || '#475569',
                                        fontSize: '9px',
                                        fontWeight: '600',
                                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                        padding: '2px 4px',
                                        borderRadius: '3px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        zIndex: 10,
                                        whiteSpace: 'nowrap',
                                        ...getPositionStyle(pageNumberOptions.position)
                                      }}>
                                        {pageNumberOptions.style === 'detailed'
                                          ? `Page ${pageNumberOptions.startNumber + originalIdx} of ${uploadedFiles[0].pageCount}`
                                          : `${pageNumberOptions.startNumber + originalIdx}`}
                                      </div>
                                    )}

                                    <button
                                      className="btn-preview-eye"
                                      title="Preview Page"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openLightbox(uploadedFiles[0], originalIdx, previewObj.dataUrl, `Page ${originalIdx + 1}`);
                                      }}
                                    >
                                      <Eye size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <div className="skeleton-pulse" />
                                )}
                              </div>
                              <div className="file-preview-info">
                                <div className="file-preview-name">Page {originalIdx + 1}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : activeTool === 'img-to-pdf' ? (
                    /* Image list */
                    <div className="files-preview-container">
                      <div className="files-grid">
                        {uploadedFiles.map((file, idx) => {
                          const isLandscape = imgToPdfOptions.orientation === 'landscape';
                          const dynamicAspectRatio = isLandscape
                            ? (imgToPdfOptions.layout === 'letter' ? '792 / 612' : '842 / 595')
                            : (imgToPdfOptions.layout === 'letter' ? '612 / 792' : '595 / 842');

                          return (
                            <div
                              key={idx}
                              className={`file-preview-card ${draggedPageIndex === idx ? 'dragging' : ''}`}
                              draggable={true}
                              onDragStart={(e) => {
                                setDraggedPageIndex(idx);
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', idx);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (draggedPageIndex === null || draggedPageIndex === idx) return;

                                const list = [...uploadedFiles];
                                const draggedItem = list[draggedPageIndex];
                                list.splice(draggedPageIndex, 1);
                                list.splice(idx, 0, draggedItem);

                                setDraggedPageIndex(idx);
                                setUploadedFiles(list);
                              }}
                              onDragEnd={() => setDraggedPageIndex(null)}
                              style={{
                                animationDelay: `${idx * 25}ms`,
                                cursor: 'grab',
                                opacity: draggedPageIndex === idx ? 0.4 : 1,
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
                                border: draggedPageIndex === idx ? '2px dashed var(--accent-color)' : '1px solid var(--border-color)'
                              }}
                            >
                              <div
                                className="file-preview-thumbnail"
                                style={{
                                  position: 'relative',
                                  aspectRatio: dynamicAspectRatio
                                }}
                              >
                                <img src={file.firstPagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="uploaded" />
                                <div className="card-actions">
                                  <button className="btn-card-action" title="Delete Image" onClick={() => removeFile(idx)}>
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <button
                                  className="btn-preview-eye"
                                  title="Preview Page"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openLightbox(file, 0, file.firstPagePreview, file.name);
                                  }}
                                >
                                  <Eye size={14} />
                                </button>
                              </div>
                              <div className="file-preview-info">
                                <div className="file-preview-name">{file.name}</div>
                                <div className="file-preview-pages">{(file.size / 1024).toFixed(1)} KB</div>
                              </div>
                              <div className="card-nav-buttons">
                                <button className="btn-icon btn-nav" disabled={idx === 0} onClick={() => moveFileOrder(idx, -1)}>
                                  ◀
                                </button>
                                <button className="btn-icon btn-nav" disabled={idx === uploadedFiles.length - 1} onClick={() => moveFileOrder(idx, 1)}>
                                  ▶
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Default Single File Preview */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem' }}>
                      <div style={{
                        width: '120px',
                        height: '160px',
                        boxShadow: 'var(--shadow-md)',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        {uploadedFiles[0].firstPagePreview ? (
                          <>
                            <img
                              src={uploadedFiles[0].firstPagePreview}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                transform: activeTool === 'rotate' ? `rotate(${globalRotation}deg)` : 'none',
                                transition: 'transform 0.2s ease-in-out'
                              }}
                              alt="File Preview"
                            />
                            <button
                              className="btn-preview-eye"
                              title="Preview Page"
                              onClick={(e) => {
                                e.stopPropagation();
                                openLightbox(uploadedFiles[0], 0, uploadedFiles[0].firstPagePreview, uploadedFiles[0].name, activeTool === 'rotate' ? globalRotation : 0);
                              }}
                            >
                              <Eye size={14} />
                            </button>
                          </>
                        ) : (
                          <FileText size={48} style={{ color: 'var(--accent-color)' }} />
                        )}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '1rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadedFiles[0].name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {(uploadedFiles[0].size / 1024 / 1024).toFixed(2)} MB {uploadedFiles[0].pageCount > 0 ? `• ${uploadedFiles[0].pageCount} pages` : ''}
                        </div>
                      </div>
                      <button className="btn-reset" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }} onClick={() => removeFile(0)}>
                        Remove file
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Sidebar Options Panel */}
                <div className="workspace-sidebar">
                  {/* Tool-specific options */}
                  {activeTool === 'scanner' && (
                    <div className="sidebar-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h3>Scanner Controls</h3>
                      
                      <div className="form-group">
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>Scan Filter</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          {[
                            { id: 'original', label: 'Original Image' },
                            { id: 'magic', label: 'Magic Color' },
                            { id: 'bw', label: 'Black & White' },
                            { id: 'grayscale', label: 'Grayscale' }
                          ].map(f => (
                            <button
                              key={f.id}
                              type="button"
                              className="btn-upload"
                              style={{
                                padding: '0.5rem',
                                fontSize: '0.8rem',
                                backgroundColor: scannerFilter === f.id ? 'var(--accent-color)' : 'var(--bg-secondary)',
                                color: scannerFilter === f.id ? 'white' : 'var(--text-primary)',
                                border: scannerFilter === f.id ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)'
                              }}
                              onClick={() => setScannerFilter(f.id)}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>Resolution DPI</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {[
                            { id: '1x', label: 'Standard (1x)' },
                            { id: '2x', label: 'High-Res (2x)' },
                            { id: '3x', label: 'Super-Res (3x)' }
                          ].map(res => (
                            <button
                              key={res.id}
                              type="button"
                              className="btn-upload"
                              style={{
                                flex: 1,
                                padding: '0.5rem 0.25rem',
                                fontSize: '0.75rem',
                                backgroundColor: scannerResolution === res.id ? 'var(--accent-color)' : 'var(--bg-secondary)',
                                color: scannerResolution === res.id ? 'white' : 'var(--text-primary)',
                                border: scannerResolution === res.id ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)'
                              }}
                              onClick={() => setScannerResolution(res.id)}
                            >
                              {res.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>Adjust Image</label>
                        <button
                          type="button"
                          className="btn-reset"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem'
                          }}
                          onClick={handleScannerRotate}
                        >
                          <RotateCw size={14} />
                          Rotate 90° Clockwise
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                        <button
                          className="btn-upload"
                          style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--success-color)' }}
                          onClick={() => processScannerImage('pdf')}
                        >
                          Convert to Scanned PDF
                        </button>
                        <button
                          className="btn-upload"
                          style={{
                            width: '100%',
                            padding: '0.65rem',
                            backgroundColor: 'var(--accent-color)'
                          }}
                          onClick={() => processScannerImage('jpg')}
                        >
                          Save as Scanned Image (JPG)
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTool === 'merge' && (
                    <div className="sidebar-section">
                      <h3>Merge Settings</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Verify file ordering. Click arrows to sort files. Merging starts from the top file.</p>
                    </div>
                  )}

                  {activeTool === 'split' && (
                    <div className="sidebar-section">
                      <h3>Split Options</h3>
                      <div className="form-group">
                        <label>Page Ranges</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 1-3, 5, 7-10"
                          value={splitRanges}
                          onChange={(e) => handleSplitRangeInputChange(e.target.value)}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Enter ranges manually or click page thumbnails on the left. Maximum pages: {uploadedFiles[0].pageCount}.
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTool === 'organize' && (
                    <div className="sidebar-section">
                      <h3>Organize Options</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rotate or delete individual pages in the left panel. Click arrows to reorder.</p>
                      <div style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <strong>Summary:</strong> Keeping {organizePages.length} of {uploadedFiles[0].pageCount} pages.
                      </div>
                    </div>
                  )}

                  {activeTool === 'sign' && (
                    <div className="sidebar-section" style={{ gap: '1rem' }}>
                      <h3>Signature Setup</h3>

                      {signatureDataUrl ? (
                        /* Signature configured preview */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Active Signature</label>
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.5rem',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img src={signatureDataUrl} style={{ maxHeight: '100%', maxWidth: '100%' }} alt="drawn signature" />
                          </div>
                          <button className="btn-reset" style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }} onClick={() => setShowSignatureModal(true)}>
                            Redraw Signature
                          </button>
                        </div>
                      ) : (
                        /* Empty state prompt signature */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Create your signature drawing or upload a scanned image to enable stamping on pages.</p>
                          <button className="btn-action-primary" style={{ padding: '0.75rem' }} onClick={() => setShowSignatureModal(true)}>
                            Create Signature
                          </button>
                        </div>
                      )}

                      {/* Active stamp page resizing slider */}
                      {activePageToSign !== null && (
                        <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                          <label>Signature Width ({sigPos.w}px)</label>
                          <input
                            type="range"
                            min="30"
                            max="250"
                            value={sigPos.w}
                            onChange={(e) => handleSignatureSizeChange(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Stamped List */}
                      {placedSignatures.length > 0 && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Placed Stamps ({placedSignatures.length})</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '120px', overflowY: 'auto' }}>
                            {placedSignatures.map((stamp, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', backgroundColor: 'var(--bg-secondary)', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                <span>Page {stamp.pageIndex + 1} stamp</span>
                                <button style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => removePlacedSignature(idx)}>
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTool === 'qr' && (
                    <div className="sidebar-section" style={{ gap: '1rem' }}>
                      <h3>QR Code Generator</h3>

                      <div className="form-group">
                        <label>QR Code Content (Text / URL)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={qrText}
                          onChange={(e) => setQrText(e.target.value)}
                          placeholder="e.g. https://www.google.com"
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div className="form-group">
                          <label>Foreground</label>
                          <input
                            type="color"
                            className="form-control"
                            style={{ height: '38px', padding: '2px', cursor: 'pointer' }}
                            value={qrFgColor}
                            onChange={(e) => setQrFgColor(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Background</label>
                          <input
                            type="color"
                            className="form-control"
                            style={{ height: '38px', padding: '2px', cursor: 'pointer' }}
                            value={qrBgColor}
                            onChange={(e) => setQrBgColor(e.target.value)}
                          />
                        </div>
                      </div>

                      {qrDataUrl && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: '600', width: '100%' }}>QR Preview</label>
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.5rem',
                            width: '100px',
                            height: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img src={qrDataUrl} style={{ height: '100%', width: '100%', objectFit: 'contain' }} alt="qr code preview" />
                          </div>
                          <button
                            className="btn-upload"
                            style={{
                              width: '100%',
                              padding: '0.4rem',
                              fontSize: '0.8rem',
                              backgroundColor: 'var(--success-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem'
                            }}
                            onClick={downloadQrCodeImage}
                          >
                            <Download size={14} /> Download QR Image
                          </button>
                        </div>
                      )}

                      {/* Active stamp page resizing slider */}
                      {activePageToSign !== null && (
                        <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                          <label>QR Code Width ({sigPos.w}px)</label>
                          <input
                            type="range"
                            min="30"
                            max="250"
                            value={sigPos.w}
                            onChange={(e) => handleSignatureSizeChange(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Stamped List */}
                      {placedSignatures.length > 0 && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Placed QR Stamps ({placedSignatures.length})</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '120px', overflowY: 'auto' }}>
                            {placedSignatures.map((stamp, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', backgroundColor: 'var(--bg-secondary)', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                <span>Page {stamp.pageIndex + 1} QR stamp</span>
                                <button style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => removePlacedSignature(idx)}>
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTool === 'protect' && (
                    <div className="sidebar-section" style={{ gap: '1rem' }}>
                      <h3>Security Settings</h3>

                      <div className="form-group">
                        <label>Enter Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Password to open PDF"
                          value={protectPassword}
                          onChange={(e) => setProtectPassword(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Encryption Algorithm</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className={`option-select-btn ${protectOptions.algorithm === 'AES-256' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                            onClick={() => setProtectOptions({ ...protectOptions, algorithm: 'AES-256' })}
                          >
                            AES-256 (Strong)
                          </button>
                          <button
                            className={`option-select-btn ${protectOptions.algorithm === 'RC4' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                            onClick={() => setProtectOptions({ ...protectOptions, algorithm: 'RC4' })}
                          >
                            RC4 (Legacy)
                          </button>
                        </div>
                      </div>

                      <div className="form-group" style={{ gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <label style={{ marginBottom: '0.25rem' }}>Permissions</label>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Allow Printing</span>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={protectOptions.allowPrinting}
                              onChange={(e) => setProtectOptions({ ...protectOptions, allowPrinting: e.target.checked })}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Allow Copying Text/Images</span>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={protectOptions.allowCopying}
                              onChange={(e) => setProtectOptions({ ...protectOptions, allowCopying: e.target.checked })}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Allow Modifications</span>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={protectOptions.allowModifying}
                              onChange={(e) => setProtectOptions({ ...protectOptions, allowModifying: e.target.checked })}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTool === 'unlock' && (
                    <div className="sidebar-section" style={{ gap: '1rem' }}>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LockOpen size={16} /> Unlock Settings
                      </h3>

                      <div style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(59,130,246,0.08)',
                        border: '1px solid rgba(59,130,246,0.25)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.5'
                      }}>
                        🔓 Enter the current password of the PDF to remove its protection permanently.
                      </div>

                      <div className="form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter PDF password..."
                          value={unlockPassword}
                          onChange={(e) => setUnlockPassword(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && runProcess()}
                        />
                      </div>
                    </div>
                  )}

                  {activeTool === 'compress' && (
                    <div className="sidebar-section">
                      <h3>Compression Level</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                          className={`option-select-btn ${compressLevel === 'high' ? 'active' : ''}`}
                          onClick={() => setCompressLevel('high')}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', width: '100%', gap: '0.5rem' }}
                        >
                          <div>
                            <div style={{ fontWeight: '600' }}>Extreme Compression</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '400', opacity: 0.8 }}>Less quality, smallest file</div>
                          </div>
                          {uploadedFiles[0] && (
                            <span className="compress-size-badge" style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              backgroundColor: compressLevel === 'high' ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)',
                              color: compressLevel === 'high' ? 'white' : 'var(--text-secondary)',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: compressLevel === 'high' ? 'none' : '1px solid var(--border-color)',
                              whiteSpace: 'nowrap'
                            }}>
                              ~{(uploadedFiles[0].size * 0.3 / 1024 / 1024) >= 0.1
                                ? `${(uploadedFiles[0].size * 0.3 / 1024 / 1024).toFixed(2)} MB`
                                : `${(uploadedFiles[0].size * 0.3 / 1024).toFixed(0)} KB`
                              }
                            </span>
                          )}
                        </button>
                        <button
                          className={`option-select-btn ${compressLevel === 'recommended' ? 'active' : ''}`}
                          onClick={() => setCompressLevel('recommended')}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', width: '100%', gap: '0.5rem' }}
                        >
                          <div>
                            <div style={{ fontWeight: '600' }}>Recommended Compression</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '400', opacity: 0.8 }}>Good quality and size</div>
                          </div>
                          {uploadedFiles[0] && (
                            <span className="compress-size-badge" style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              backgroundColor: compressLevel === 'recommended' ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)',
                              color: compressLevel === 'recommended' ? 'white' : 'var(--text-secondary)',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: compressLevel === 'recommended' ? 'none' : '1px solid var(--border-color)',
                              whiteSpace: 'nowrap'
                            }}>
                              ~{(uploadedFiles[0].size * 0.5 / 1024 / 1024) >= 0.1
                                ? `${(uploadedFiles[0].size * 0.5 / 1024 / 1024).toFixed(2)} MB`
                                : `${(uploadedFiles[0].size * 0.5 / 1024).toFixed(0)} KB`
                              }
                            </span>
                          )}
                        </button>
                        <button
                          className={`option-select-btn ${compressLevel === 'low' ? 'active' : ''}`}
                          onClick={() => setCompressLevel('low')}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', width: '100%', gap: '0.5rem' }}
                        >
                          <div>
                            <div style={{ fontWeight: '600' }}>Less Compression</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '400', opacity: 0.8 }}>High quality, larger file</div>
                          </div>
                          {uploadedFiles[0] && (
                            <span className="compress-size-badge" style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              backgroundColor: compressLevel === 'low' ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)',
                              color: compressLevel === 'low' ? 'white' : 'var(--text-secondary)',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: compressLevel === 'low' ? 'none' : '1px solid var(--border-color)',
                              whiteSpace: 'nowrap'
                            }}>
                              ~{(uploadedFiles[0].size * 0.8 / 1024 / 1024) >= 0.1
                                ? `${(uploadedFiles[0].size * 0.8 / 1024 / 1024).toFixed(2)} MB`
                                : `${(uploadedFiles[0].size * 0.8 / 1024).toFixed(0)} KB`
                              }
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTool === 'rotate' && (
                    <div className="sidebar-section">
                      <h3>Rotate Direction</h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className={`option-select-btn ${globalRotation === 90 ? 'active' : ''}`}
                          style={{ flex: 1 }}
                          onClick={() => setGlobalRotation(90)}
                        >
                          90° Right
                        </button>
                        <button
                          className={`option-select-btn ${globalRotation === 180 ? 'active' : ''}`}
                          style={{ flex: 1 }}
                          onClick={() => setGlobalRotation(180)}
                        >
                          180°
                        </button>
                        <button
                          className={`option-select-btn ${globalRotation === 270 ? 'active' : ''}`}
                          style={{ flex: 1 }}
                          onClick={() => setGlobalRotation(270)}
                        >
                          90° Left
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTool === 'img-to-pdf' && (
                    <div className="sidebar-section" style={{ gap: '1rem' }}>
                      <h3>Page Layout</h3>

                      <div className="form-group">
                        <label>Page Size</label>
                        <select
                          className="form-control"
                          value={imgToPdfOptions.layout}
                          onChange={(e) => setImgToPdfOptions({ ...imgToPdfOptions, layout: e.target.value })}
                        >
                          <option value="a4">A4 (595 x 842 pt)</option>
                          <option value="letter">US Letter (612 x 792 pt)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Orientation</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className={`option-select-btn ${imgToPdfOptions.orientation === 'portrait' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                            onClick={() => setImgToPdfOptions({ ...imgToPdfOptions, orientation: 'portrait' })}
                          >
                            Portrait
                          </button>
                          <button
                            className={`option-select-btn ${imgToPdfOptions.orientation === 'landscape' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                            onClick={() => setImgToPdfOptions({ ...imgToPdfOptions, orientation: 'landscape' })}
                          >
                            Landscape
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Page Margins</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className={`option-select-btn ${imgToPdfOptions.margin === 'none' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                            onClick={() => setImgToPdfOptions({ ...imgToPdfOptions, margin: 'none' })}
                          >
                            None
                          </button>
                          <button
                            className={`option-select-btn ${imgToPdfOptions.margin === 'small' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                            onClick={() => setImgToPdfOptions({ ...imgToPdfOptions, margin: 'small' })}
                          >
                            Small
                          </button>
                          <button
                            className={`option-select-btn ${imgToPdfOptions.margin === 'large' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                            onClick={() => setImgToPdfOptions({ ...imgToPdfOptions, margin: 'large' })}
                          >
                            Big
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTool === 'pdf-to-img' && (
                    <div className="sidebar-section">
                      <h3>Conversion Format</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Every page of this PDF will be extracted as a high-definition JPG image and compiled into a single ZIP archive.</p>
                    </div>
                  )}

                  {activeTool === 'extract-text' && (
                    <div className="sidebar-section">
                      <h3>Text Extraction</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Extract clean, indexable plain text from PDF pages client-side using PDF.js text layer mapping.</p>
                    </div>
                  )}

                  {activeTool === 'page-numbers' && (
                    <div className="sidebar-section" style={{ gap: '1rem' }}>
                      <h3>Position & Styling</h3>

                      <div className="form-group">
                        <label>Location on Page</label>
                        <div className="position-grid">
                          {['topLeft', 'topCenter', 'topRight', 'bottomLeft', 'bottomCenter', 'bottomRight'].map((pos) => (
                            <div
                              key={pos}
                              className={`position-cell ${pageNumberOptions.position === pos ? 'active' : ''}`}
                              onClick={() => setPageNumberOptions({ ...pageNumberOptions, position: pos })}
                              title={pos.replace(/([A-Z])/g, ' $1')}
                            >
                              <div className="position-dot"></div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Number Style</label>
                        <select
                          className="form-control"
                          value={pageNumberOptions.style}
                          onChange={(e) => setPageNumberOptions({ ...pageNumberOptions, style: e.target.value })}
                        >
                          <option value="simple">Simple number (e.g. "1")</option>
                          <option value="detailed">Complete Page Info (e.g. "Page 1 of N")</option>
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div className="form-group">
                          <label>Start From</label>
                          <input
                            type="number"
                            className="form-control"
                            value={pageNumberOptions.startNumber}
                            onChange={(e) => setPageNumberOptions({ ...pageNumberOptions, startNumber: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Font Size</label>
                          <input
                            type="number"
                            className="form-control"
                            value={pageNumberOptions.fontSize}
                            onChange={(e) => setPageNumberOptions({ ...pageNumberOptions, fontSize: parseInt(e.target.value) || 10 })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Number Color</label>
                        <input
                          type="color"
                          className="form-control"
                          style={{ height: '38px', padding: '2px', cursor: 'pointer' }}
                          value={pageNumberOptions.color}
                          onChange={(e) => setPageNumberOptions({ ...pageNumberOptions, color: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {activeTool === 'watermark' && (
                    <div className="sidebar-section" style={{ gap: '1rem' }}>
                      <h3>Watermark Options</h3>

                      <div className="form-group">
                        <label>Watermark Text</label>
                        <input
                          type="text"
                          className="form-control"
                          value={watermarkOptions.text}
                          onChange={(e) => setWatermarkOptions({ ...watermarkOptions, text: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Opacity ({Math.round(watermarkOptions.opacity * 100)}%)</label>
                        <input
                          type="range"
                          min="0.05"
                          max="1.0"
                          step="0.05"
                          value={watermarkOptions.opacity}
                          onChange={(e) => setWatermarkOptions({ ...watermarkOptions, opacity: parseFloat(e.target.value) })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Size ({watermarkOptions.size}pt)</label>
                        <input
                          type="range"
                          min="12"
                          max="120"
                          step="2"
                          value={watermarkOptions.size}
                          onChange={(e) => setWatermarkOptions({ ...watermarkOptions, size: parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Rotation Angle ({watermarkOptions.rotation}°)</label>
                        <input
                          type="range"
                          min="-90"
                          max="90"
                          step="5"
                          value={watermarkOptions.rotation}
                          onChange={(e) => setWatermarkOptions({ ...watermarkOptions, rotation: parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Text Color</label>
                        <input
                          type="color"
                          className="form-control"
                          style={{ height: '38px', padding: '2px', cursor: 'pointer' }}
                          value={watermarkOptions.color}
                          onChange={(e) => setWatermarkOptions({ ...watermarkOptions, color: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {activeTool === 'metadata' && (
                    <div className="sidebar-section" style={{ gap: '0.75rem' }}>
                      <h3>Metadata Values</h3>

                      <div className="form-group">
                        <label>Document Title</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Leave empty to clear"
                          value={metadataOptions.title}
                          onChange={(e) => setMetadataOptions({ ...metadataOptions, title: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Author / Owner</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Author name"
                          value={metadataOptions.author}
                          onChange={(e) => setMetadataOptions({ ...metadataOptions, author: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Subject</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Brief description"
                          value={metadataOptions.subject}
                          onChange={(e) => setMetadataOptions({ ...metadataOptions, subject: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Keywords (comma separated)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="pdf, document, report"
                          value={metadataOptions.keywords}
                          onChange={(e) => setMetadataOptions({ ...metadataOptions, keywords: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Creator Application</label>
                        <input
                          type="text"
                          className="form-control"
                          value={metadataOptions.creator}
                          onChange={(e) => setMetadataOptions({ ...metadataOptions, creator: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {activeTool === 'pdf-to-docx' && (
                    <div className="sidebar-section">
                      <h3>PDF to Word</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Convert PDF text content into an editable Microsoft Word document (.docx). All operations run client-side in your browser.
                      </p>
                    </div>
                  )}

                  {activeTool === 'pdf-to-pptx' && (
                    <div className="sidebar-section">
                      <h3>PDF to PowerPoint</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Convert PDF pages into slide layouts containing editable slide texts. No data is sent to any servers.
                      </p>
                    </div>
                  )}

                  {activeTool === 'docx-to-pdf' && (
                    <div className="sidebar-section">
                      <h3>Word to PDF</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Convert and render Microsoft Word docx layouts into standard PDF files. Powered by client-side XML layouts.
                      </p>
                    </div>
                  )}

                  {activeTool === 'pptx-to-pdf' && (
                    <div className="sidebar-section">
                      <h3>PowerPoint to PDF</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Render PowerPoint presentation slides (.pptx) to standard PDF pages client-side in real-time.
                      </p>
                    </div>
                  )}

                  {activeTool === 'grayscale' && (
                    <div className="sidebar-section">
                      <h3>Grayscale Option</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Convert all colored elements (images, texts, shapes) of the PDF to grayscale. Perfect for saving colored printer ink.
                      </p>
                      <div className="option-info-box" style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem',
                        fontSize: '0.75rem',
                        marginTop: '0.5rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Printer size={16} style={{ flexShrink: 0, color: 'var(--accent-color)' }} />
                        <span>This operation is fully processed in your browser. Your files are 100% secure.</span>
                      </div>
                    </div>
                  )}

                  {activeTool === 'crop' && (
                    <div className="sidebar-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h3>Crop Settings</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Drag the crop handles on the page preview to specify crop margins, or configure them using the sliders below.
                      </p>

                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Top Margin</span>
                          <strong>{cropMargins.top}%</strong>
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={80}
                          value={cropMargins.top}
                          onChange={(e) => setCropMargins({ ...cropMargins, top: Number(e.target.value) })}
                          style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Bottom Margin</span>
                          <strong>{cropMargins.bottom}%</strong>
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={80}
                          value={cropMargins.bottom}
                          onChange={(e) => setCropMargins({ ...cropMargins, bottom: Number(e.target.value) })}
                          style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Left Margin</span>
                          <strong>{cropMargins.left}%</strong>
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={80}
                          value={cropMargins.left}
                          onChange={(e) => setCropMargins({ ...cropMargins, left: Number(e.target.value) })}
                          style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Right Margin</span>
                          <strong>{cropMargins.right}%</strong>
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={80}
                          value={cropMargins.right}
                          onChange={(e) => setCropMargins({ ...cropMargins, right: Number(e.target.value) })}
                          style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                        />
                      </div>

                      <button
                        type="button"
                        className="option-select-btn"
                        onClick={() => setCropMargins({ top: 10, bottom: 10, left: 10, right: 10 })}
                        style={{ padding: '0.4rem', fontSize: '0.75rem', width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
                      >
                        Reset Crop Box
                      </button>
                    </div>
                  )}

                  {/* Primary Trigger Button */}
                  <button
                    className="btn-action-primary"
                    onClick={runProcess}
                    disabled={
                      (activeTool === 'split' && !splitRanges.trim()) ||
                      ((activeTool === 'sign' || activeTool === 'qr') && placedSignatures.length === 0) ||
                      ((activeTool === 'sign' || activeTool === 'qr') && activePageToSign !== null) ||
                      (activeTool === 'crop' && (activePageToCrop !== null || Object.keys(placedCrops).length === 0)) ||
                      (activeTool === 'protect' && !protectPassword.trim()) ||
                      (activeTool === 'unlock' && !unlockPassword.trim())
                    }
                  >
                    {
                      activeTool === 'extract-text' ? 'Extract Text' :
                        activeTool === 'pdf-to-docx' ? 'Convert to Word' :
                          activeTool === 'pdf-to-pptx' ? 'Convert to PowerPoint' :
                            activeTool === 'grayscale' ? 'Convert to Grayscale' :
                              activeTool === 'crop' ? 'Crop PDF Document' :
                                `Convert to ${currentTool?.id === 'pdf-to-img' ? 'Images' : 'PDF'}`
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* SIGNATURE DRAWING PAD MODAL */}
      {showSignatureModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '460px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-xl)',
            animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Create Your Signature</h3>
              <button className="btn-icon" style={{ padding: '2px 6px', fontSize: '0.8rem' }} onClick={() => setShowSignatureModal(false)}>✕</button>
            </div>

            {/* Draw Pad Canvas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Draw inside the box:</span>
              <canvas
                ref={signatureCanvasRef}
                width={400}
                height={200}
                style={{
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'white',
                  cursor: 'crosshair',
                  touchAction: 'none',
                  width: '100%',
                  height: '200px'
                }}
                onMouseDown={startDrawing}
                onMouseMove={drawSignature}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={drawSignature}
                onTouchEnd={stopDrawing}
              />
            </div>

            {/* Option to Upload Image instead */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Or upload scanned signature image (PNG / JPG):</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleSignatureUpload}
                style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn-reset" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={clearSignatureCanvas}>
                Clear Drawpad
              </button>
              <button className="btn-upload" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }} onClick={saveDrawnSignature}>
                Save Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SHARE MODAL */}
      {showShareModal && shareData.blob && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          animation: 'fadeIn 0.2s ease',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            width: '100%',
            maxWidth: '480px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-xl)',
            animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Share2 size={20} style={{ color: 'var(--accent-color)' }} />
                {shareData.type === 'image/png' ? 'Share QR Code' : 'Share File'}
              </h3>
              <button
                className="btn-icon"
                style={{ padding: '4px 8px', fontSize: '0.85rem', cursor: 'pointer' }}
                onClick={() => {
                  setShowShareModal(false);
                  setShareData({ blob: null, name: '', type: '' });
                }}
              >
                ✕
              </button>
            </div>

            {/* File Info Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1.5px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)'
            }}>
              {shareData.type === 'image/png' ? (
                <div style={{ color: 'var(--accent-color)' }}><QrCode size={32} /></div>
              ) : (
                <div style={{ color: 'var(--accent-color)' }}><FileText size={32} /></div>
              )}
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {shareData.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Size: {shareData.blob.size ? ((shareData.blob.size / 1024).toFixed(1) > 1024
                    ? `${(shareData.blob.size / (1024 * 1024)).toFixed(2)} MB`
                    : `${(shareData.blob.size / 1024).toFixed(1)} KB`)
                    : 'Unknown'
                  }
                </div>
              </div>
            </div>

            {/* Direct Share Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {navigator.canShare && navigator.canShare({ files: [new File([shareData.blob], shareData.name, { type: shareData.type })] }) && (
                <button
                  className="btn-download-success"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem'
                  }}
                  onClick={async () => {
                    try {
                      const file = new File([shareData.blob], shareData.name, { type: shareData.type });
                      await navigator.share({
                        files: [file],
                        title: shareData.name,
                        text: 'Here is your file from pdfCraft!',
                      });
                    } catch (err) {
                      if (err.name !== 'AbortError') {
                        alert('Sharing failed: ' + err.message);
                      }
                    }
                  }}
                >
                  <Share2 size={16} /> Share via System Dialog (WhatsApp, Telegram, etc.)
                </button>
              )}
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Share via Web Apps:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  onClick={() => handleDesktopShare('whatsapp')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.08)',
                    color: '#15803d',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.457 3.473 1.328 4.982L2.03 22l5.182-1.36c1.464.798 3.11 1.218 4.793 1.218 5.507 0 9.988-4.482 9.988-9.988C22 6.482 17.52 2 12.012 2zm6.262 14.372c-.258.73-1.488 1.428-2.046 1.482-.5.05-1.155.08-3.328-.82-2.777-1.15-4.57-3.98-4.71-4.168-.14-.19-1.123-1.493-1.123-2.846 0-1.353.708-2.015.96-2.28.25-.268.55-.333.73-.333.18 0 .36 0 .52.01.17 0 .4.01.61.51.22.53.76 1.86.83 1.99.07.13.11.29.02.46-.08.17-.18.28-.35.48-.17.2-.36.45-.52.6-.18.17-.37.36-.16.73.21.36.93 1.54 2 2.49 1.38 1.23 2.54 1.62 2.9 1.8.36.18.57.15.79-.09.21-.24.93-1.08 1.18-1.45.25-.37.5-.31.84-.18.35.13 2.2 1.04 2.58 1.23.38.19.64.28.73.43.08.16.08.93-.18 1.66z" />
                  </svg>
                  WhatsApp
                </button>

                <button
                  onClick={() => handleDesktopShare('telegram')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.08)',
                    color: '#0369a1',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.6.15-.15 2.76-2.53 2.81-2.75.01-.03.01-.1-.04-.15-.05-.05-.12-.03-.17-.02-.07.02-1.29.83-3.64 2.42-.34.24-.66.35-.95.34-.32-.01-.94-.18-1.4-.33-.56-.18-1-.28-.96-.6.02-.17.25-.34.69-.53 2.7-1.17 4.5-1.95 5.4-2.33 2.56-1.09 3.09-1.28 3.44-1.28.08 0 .25.02.36.11.1.08.13.2.14.3-.01.06-.01.12-.02.18z" />
                  </svg>
                  Telegram
                </button>

                <button
                  onClick={() => handleDesktopShare('gmail')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: '#b91c1c',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  Gmail
                </button>

                <button
                  onClick={() => handleDesktopShare('email')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--text-secondary)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Other Email
                </button>
              </div>
            </div>

            {/* Instruction Banner */}
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--accent-color)',
              margin: '0',
              lineHeight: '1.4'
            }}>
              💡 <strong>How it works:</strong> We copy the file/image directly to your clipboard and open the app. Simply press <strong>Ctrl+V (or Paste)</strong> in the chat to share it. If your browser doesn't support clipboard files, click <strong>Download File</strong> below to download and attach it manually.
            </div>

            {/* Actions Grid */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginTop: '0.25rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1rem'
            }}>
              {/* Primary Download Button */}
              <button
                className="btn-download-success"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
                onClick={() => downloadBlob(shareData.blob, shareData.name)}
              >
                <Download size={18} /> Download File
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* Copy Image Button (only for QR Codes/Images) */}
                {shareData.type === 'image/png' && (
                  <button
                    className="btn-reset"
                    style={{ flex: 1, padding: '0.6rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', border: '1px solid var(--accent-color)', color: 'var(--accent-color)' }}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.write([
                          new ClipboardItem({
                            [shareData.type]: shareData.blob
                          })
                        ]);
                        alert('QR Code image copied to clipboard! Paste (Ctrl+V) it anywhere.');
                      } catch (err) {
                        console.error(err);
                        alert('Clipboard copy is not supported in this browser. Please download the PNG.');
                      }
                    }}
                  >
                    <Copy size={14} /> Copy Image
                  </button>
                )}

                {/* Share App Link Button */}
                <button
                  className="btn-reset"
                  style={{ flex: 1, padding: '0.6rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  onClick={() => {
                    navigator.clipboard.writeText('https://pdf-craft-sand.vercel.app/');
                    alert('pdfCraft website link copied to clipboard!');
                  }}
                >
                  <Copy size={14} /> Copy App Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW LIGHTBOX MODAL */}
      {previewModalImage && (
        <div className="preview-lightbox-backdrop" onClick={() => { setPreviewModalImage(null); setPreviewModalPageIndex(null); }}>
          <div className="preview-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-lightbox-header">
              <span className="preview-lightbox-title">{previewModalTitle || 'Page Preview'}</span>
              <button className="preview-lightbox-close" onClick={() => { setPreviewModalImage(null); setPreviewModalPageIndex(null); }}>
                <X size={20} />
              </button>
            </div>
            <div className="preview-lightbox-body" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {lightboxLoading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(15, 23, 42, 0.4)',
                  backdropFilter: 'blur(3px)',
                  zIndex: 20
                }}>
                  <div className="lightbox-loader"></div>
                </div>
              )}

              <div style={{ position: 'relative', display: 'inline-flex', maxWidth: '100%' }}>
                <img
                  src={previewModalImage}
                  alt="Page Preview"
                  className="preview-lightbox-img"
                  style={{
                    display: 'block',
                    transform: (!isHighResRendered && previewModalRotation) ? `rotate(${previewModalRotation}deg)` : 'none',
                    maxHeight: (!isHighResRendered && (previewModalRotation === 90 || previewModalRotation === 270)) ? '70vw' : '75vh',
                    maxWidth: (!isHighResRendered && (previewModalRotation === 90 || previewModalRotation === 270)) ? '70vh' : '100%',
                    width: 'auto',
                    height: 'auto',
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />

                {/* Visual signature / QR stamp overlays in the lightbox preview */}
                {(activeTool === 'sign' || activeTool === 'qr') && previewModalPageIndex !== null && (
                  placedSignatures.filter(s => s.pageIndex === previewModalPageIndex).map((stamp, sIdx) => {
                    const leftPct = (stamp.x / stamp.pageW) * 100;
                    const topPct = (stamp.y / stamp.pageH) * 100;
                    const widthPct = (stamp.width / stamp.pageW) * 100;
                    const heightPct = (stamp.height / stamp.pageH) * 100;

                    return (
                      <img
                        key={sIdx}
                        src={stamp.dataUrl}
                        style={{
                          position: 'absolute',
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${widthPct}%`,
                          height: `${heightPct}%`,
                          pointerEvents: 'none'
                        }}
                        alt="signature overlay"
                      />
                    );
                  })
                )}

                {/* Visual Watermark overlay in the lightbox preview */}
                {activeTool === 'watermark' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    overflow: 'hidden',
                    containerType: 'inline-size'
                  }}>
                    <div style={{
                      color: watermarkOptions.color || '#ef4444',
                      opacity: watermarkOptions.opacity !== undefined ? watermarkOptions.opacity : 0.3,
                      fontSize: `${(watermarkOptions.size || 48) / 595 * 100}cqw`,
                      fontWeight: 'bold',
                      transform: `rotate(${-watermarkOptions.rotation || -45}deg)`,
                      whiteSpace: 'nowrap',
                      userSelect: 'none',
                      textAlign: 'center',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      {watermarkOptions.text || 'CONFIDENTIAL'}
                    </div>
                  </div>
                )}

                {/* Visual Page Number overlay in the lightbox preview */}
                {activeTool === 'page-numbers' && previewModalPageIndex !== null && (
                  <div style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    color: pageNumberOptions.color || '#475569',
                    fontSize: `${(pageNumberOptions.fontSize || 10) * 1.5}px`,
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 10,
                    whiteSpace: 'nowrap',
                    ...getPositionStyle(pageNumberOptions.position)
                  }}>
                    {pageNumberOptions.style === 'detailed'
                      ? `Page ${pageNumberOptions.startNumber + previewModalPageIndex} of ${uploadedFiles[0].pageCount}`
                      : `${pageNumberOptions.startNumber + previewModalPageIndex}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Info size={14} />
          <span>All document parsing and alterations happen locally via WebAssembly and Canvas. No files are uploaded to any server.</span>
        </div>
        <div>© {new Date().getFullYear()} pdfCraft. Clean & secure browser utilities.</div>
      </footer>
      {/* Premium Glassmorphic Bottom Navigation Bar for Mobile */}
      <div className="bottom-nav">
        <button
          className={`bottom-nav-item ${mobileTab === 'all' && activeTool === null ? 'active' : ''}`}
          onClick={() => {
            setActiveTool(null);
            setMobileTab('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Layers size={20} />
          <span>All Tools</span>
        </button>
        <button
          className={`bottom-nav-item ${mobileTab === 'organize' && activeTool === null ? 'active' : ''}`}
          onClick={() => {
            setActiveTool(null);
            setMobileTab('organize');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Scissors size={20} />
          <span>Organize</span>
        </button>
        <button
          className={`bottom-nav-item ${mobileTab === 'convert' && activeTool === null ? 'active' : ''}`}
          onClick={() => {
            setActiveTool(null);
            setMobileTab('convert');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Combine size={20} />
          <span>Convert</span>
        </button>
        <button
          className={`bottom-nav-item ${mobileTab === 'security' && activeTool === null ? 'active' : ''}`}
          onClick={() => {
            setActiveTool(null);
            setMobileTab('security');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Lock size={20} />
          <span>Security</span>
        </button>
      </div>
    </div>
  );
}

export default App;
