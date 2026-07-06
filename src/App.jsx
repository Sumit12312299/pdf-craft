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
  QrCode,
  Share2,
  Copy,
  ChevronDown,
  Menu,
  X,
  Eye
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
  stampQrCode,
  convertDocxToPdf,
  convertPptxToPdf,
  convertPdfToDocx,
  convertPdfToPptx,
  convertXlsxToPdf,
  convertHtmlToPdf,
  convertPdfToXlsx,
  convertPdfToPdfA
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

function App() {
  // Theme state
  const [theme, setTheme] = useState('light');
  
  // Navigation
  const [activeTool, setActiveTool] = useState(null);
  const [gridMenuOpen, setGridMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Signature States
  const [signatureDataUrl, setSignatureDataUrl] = useState(null); // Drawn signature PNG or QR Code PNG
  const [signatureAspectRatio, setSignatureAspectRatio] = useState(2); // width / height
  const [placedSignatures, setPlacedSignatures] = useState([]); // Array of { pageIndex, dataUrl, x, y, width, height, pageW, pageH }
  const [activePageToSign, setActivePageToSign] = useState(null); // index of page being stamped
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({ blob: null, name: '', type: '' });
  const [sigPos, setSigPos] = useState({ x: 50, y: 50, w: 120, h: 60 });
  const [renderedPageDimensions, setRenderedPageDimensions] = useState({ w: 0, h: 0 });
  const [previewModalImage, setPreviewModalImage] = useState(null);
  const [previewModalTitle, setPreviewModalTitle] = useState('');
  
  const signatureCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const pageImageRef = useRef(null);

  // Text Extraction Results
  const [extractedText, setExtractedText] = useState('');

  // Page level organize actions (for organize tool)
  const [organizePages, setOrganizePages] = useState([]); // Array of { id, originalIndex, rotation }

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
      .then(url => setQrGenDataUrl(url))
      .catch(err => {
        setQrGenError('Failed to generate QR code: ' + err.message);
        setQrGenDataUrl('');
      });
    }
  }, [qrGenText, qrGenFgColor, qrGenBgColor, qrGenSize, activeTool]);

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
      id: 'qr-generator',
      title: 'QR Code Generator',
      description: 'Convert any link or text into a downloadable QR code image instantly.',
      icon: <QrCode size={24} />,
      category: 'Utilities',
      multiple: false,
      accept: null // No file needed
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
    setResultBlob(null);
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
    const containerRect = container.getBoundingClientRect();
    
    const handleMove = (moveEvent) => {
      const moveClientX = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveClientY = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const deltaX = moveClientX - startX;
      const deltaY = moveClientY - startY;
      
      // Bound checking within the rendered page container
      const newX = Math.max(0, Math.min(containerRect.width - sigPos.w, initLeft + deltaX));
      const newY = Math.max(0, Math.min(containerRect.height - sigPos.h, initTop + deltaY));
      
      setSigPos(prev => ({ ...prev, x: newX, y: newY }));
    };
    
    const handleEnd = () => {
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

  // Adjust signature dimensions proportionally via sidebar size slider
  const handleSignatureSizeChange = (newWidth) => {
    const w = parseInt(newWidth, 10);
    const h = Math.round(w / signatureAspectRatio);
    
    // Maintain placement bounds
    let x = sigPos.x;
    let y = sigPos.y;
    if (pageImageRef.current) {
      const container = pageImageRef.current.parentElement;
      const containerRect = container.getBoundingClientRect();
      
      if (x + w > containerRect.width) {
        x = Math.max(0, containerRect.width - w);
      }
      if (y + h > containerRect.height) {
        y = Math.max(0, containerRect.height - h);
      }
    }
    
    setSigPos({ x, y, w, h });
  };

  // Visual layout loaded sizes callback
  const handlePageImageLoad = () => {
    if (pageImageRef.current) {
      const rect = pageImageRef.current.getBoundingClientRect();
      setRenderedPageDimensions({ w: rect.width, h: rect.height });
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
        setProcessingStatus('Compressing PDF structure...');
        const file = uploadedFiles[0];
        outputBytes = await compressPdf(file.buffer, compressLevel);
        filename = `${file.name.replace('.pdf', '')}_compressed.pdf`;
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
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: name,
        text: 'Here is your file from pdfCraft!',
      }).catch(err => {
        // Even if they cancel (AbortError) or it fails, open the modal so they have other options
        setShowShareModal(true);
      });
    } else {
      setShowShareModal(true);
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
  // Append any unlisted categories at the end
  Object.keys(categorizedTools).forEach(cat => {
    if (!orderedCategories.includes(cat)) orderedCategories.push(cat);
  });

  return (
    <div className="app-container">
      {/* Header */}
      <header className="navbar">
        <div className="navbar-left">
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
                  <a href="#merge" onClick={(e) => { e.preventDefault(); navigateToTool('merge'); }} className="dropdown-link">Merge PDF</a>
                  <a href="#split" onClick={(e) => { e.preventDefault(); navigateToTool('split'); }} className="dropdown-link">Split PDF</a>
                  <a href="#organize" onClick={(e) => { e.preventDefault(); navigateToTool('organize'); }} className="dropdown-link">Organize PDF</a>
                  <a href="#rotate" onClick={(e) => { e.preventDefault(); navigateToTool('rotate'); }} className="dropdown-link">Rotate PDF</a>
                </div>
                <div className="dropdown-column">
                  <div className="dropdown-col-title">EDIT PDF</div>
                  <a href="#sign" onClick={(e) => { e.preventDefault(); navigateToTool('sign'); }} className="dropdown-link">Sign PDF</a>
                  <a href="#qr" onClick={(e) => { e.preventDefault(); navigateToTool('qr'); }} className="dropdown-link">Stamp QR Code</a>
                  <a href="#page-numbers" onClick={(e) => { e.preventDefault(); navigateToTool('page-numbers'); }} className="dropdown-link">Add Page Numbers</a>
                  <a href="#watermark" onClick={(e) => { e.preventDefault(); navigateToTool('watermark'); }} className="dropdown-link">Add Watermark</a>
                  <a href="#metadata" onClick={(e) => { e.preventDefault(); navigateToTool('metadata'); }} className="dropdown-link">Edit Metadata</a>
                </div>
                <div className="dropdown-column">
                  <div className="dropdown-col-title">CONVERT</div>
                  <a href="#docx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('docx-to-pdf'); }} className="dropdown-link">Word to PDF</a>
                  <a href="#pptx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('pptx-to-pdf'); }} className="dropdown-link">PowerPoint to PDF</a>
                  <a href="#img-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('img-to-pdf'); }} className="dropdown-link">JPG to PDF</a>
                  <a href="#xlsx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('xlsx-to-pdf'); }} className="dropdown-link">Excel to PDF</a>
                  <a href="#html-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('html-to-pdf'); }} className="dropdown-link">HTML to PDF</a>
                  <a href="#pdf-to-img" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-img'); }} className="dropdown-link">PDF to JPG</a>
                  <a href="#pdf-to-docx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-docx'); }} className="dropdown-link">PDF to Word</a>
                  <a href="#pdf-to-pptx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-pptx'); }} className="dropdown-link">PDF to PowerPoint</a>
                  <a href="#pdf-to-xlsx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-xlsx'); }} className="dropdown-link">PDF to Excel</a>
                  <a href="#pdf-to-pdfa" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-pdfa'); }} className="dropdown-link">PDF to PDF/A</a>
                  <a href="#extract-text" onClick={(e) => { e.preventDefault(); navigateToTool('extract-text'); }} className="dropdown-link">Extract Text</a>
                </div>
                <div className="dropdown-column">
                  <div className="dropdown-col-title">SECURITY & UTILITIES</div>
                  <a href="#compress" onClick={(e) => { e.preventDefault(); navigateToTool('compress'); }} className="dropdown-link font-semibold">Compress PDF</a>
                  <a href="#protect" onClick={(e) => { e.preventDefault(); navigateToTool('protect'); }} className="dropdown-link">Protect PDF</a>
                  <a href="#qr-generator" onClick={(e) => { e.preventDefault(); navigateToTool('qr-generator'); }} className="dropdown-link highlight">QR Generator</a>
                </div>
              </div>
            </div>
          </nav>
        </div>

        <div className="navbar-right">
          <button onClick={toggleTheme} className="btn-icon" title="Toggle theme">
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
                    <button key={tool.id} className="grid-menu-item" onClick={() => { navigateToTool(tool.id); setGridMenuOpen(false); }}>
                      <span className="grid-menu-icon">{tool.icon}</span>
                      <span className="grid-menu-label">{tool.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button className="btn-icon btn-burger-menu" title="Menu" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={20} />
          </button>
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
                <a href="#merge" className="drawer-item" onClick={(e) => { e.preventDefault(); navigateToTool('merge'); setMobileMenuOpen(false); }}>
                  Merge PDF
                </a>
                <a href="#split" className="drawer-item" onClick={(e) => { e.preventDefault(); navigateToTool('split'); setMobileMenuOpen(false); }}>
                  Split PDF
                </a>
                <a href="#compress" className="drawer-item" onClick={(e) => { e.preventDefault(); navigateToTool('compress'); setMobileMenuOpen(false); }}>
                  Compress PDF
                </a>
                
                {/* Convert Group */}
                <div className="drawer-group">
                  <div className="drawer-group-title">Convert PDF</div>
                  <div className="drawer-group-items">
                    <a href="#img-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('img-to-pdf'); setMobileMenuOpen(false); }} className="drawer-subitem">JPG to PDF</a>
                    <a href="#docx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('docx-to-pdf'); setMobileMenuOpen(false); }} className="drawer-subitem">Word to PDF</a>
                    <a href="#pptx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('pptx-to-pdf'); setMobileMenuOpen(false); }} className="drawer-subitem">PowerPoint to PDF</a>
                    <a href="#xlsx-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('xlsx-to-pdf'); setMobileMenuOpen(false); }} className="drawer-subitem">Excel to PDF</a>
                    <a href="#html-to-pdf" onClick={(e) => { e.preventDefault(); navigateToTool('html-to-pdf'); setMobileMenuOpen(false); }} className="drawer-subitem">HTML to PDF</a>
                    <a href="#pdf-to-img" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-img'); setMobileMenuOpen(false); }} className="drawer-subitem">PDF to JPG</a>
                    <a href="#pdf-to-docx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-docx'); setMobileMenuOpen(false); }} className="drawer-subitem">PDF to Word</a>
                    <a href="#pdf-to-pptx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-pptx'); setMobileMenuOpen(false); }} className="drawer-subitem">PDF to PowerPoint</a>
                    <a href="#pdf-to-xlsx" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-xlsx'); setMobileMenuOpen(false); }} className="drawer-subitem">PDF to Excel</a>
                    <a href="#pdf-to-pdfa" onClick={(e) => { e.preventDefault(); navigateToTool('pdf-to-pdfa'); setMobileMenuOpen(false); }} className="drawer-subitem">PDF to PDF/A</a>
                    <a href="#extract-text" onClick={(e) => { e.preventDefault(); navigateToTool('extract-text'); setMobileMenuOpen(false); }} className="drawer-subitem">Extract Text</a>
                  </div>
                </div>

                {/* Edit & Organize Group */}
                <div className="drawer-group">
                  <div className="drawer-group-title">All Tools</div>
                  <div className="drawer-group-items">
                    <a href="#organize" onClick={(e) => { e.preventDefault(); navigateToTool('organize'); setMobileMenuOpen(false); }} className="drawer-subitem">Organize PDF</a>
                    <a href="#rotate" onClick={(e) => { e.preventDefault(); navigateToTool('rotate'); setMobileMenuOpen(false); }} className="drawer-subitem">Rotate PDF</a>
                    <a href="#sign" onClick={(e) => { e.preventDefault(); navigateToTool('sign'); setMobileMenuOpen(false); }} className="drawer-subitem">Sign PDF</a>
                    <a href="#qr" onClick={(e) => { e.preventDefault(); navigateToTool('qr'); setMobileMenuOpen(false); }} className="drawer-subitem">Stamp QR Code</a>
                    <a href="#page-numbers" onClick={(e) => { e.preventDefault(); navigateToTool('page-numbers'); setMobileMenuOpen(false); }} className="drawer-subitem">Add Page Numbers</a>
                    <a href="#watermark" onClick={(e) => { e.preventDefault(); navigateToTool('watermark'); setMobileMenuOpen(false); }} className="drawer-subitem">Add Watermark</a>
                    <a href="#metadata" onClick={(e) => { e.preventDefault(); navigateToTool('metadata'); setMobileMenuOpen(false); }} className="drawer-subitem">Edit Metadata</a>
                    <a href="#protect" onClick={(e) => { e.preventDefault(); navigateToTool('protect'); setMobileMenuOpen(false); }} className="drawer-subitem">Protect PDF</a>
                    <a href="#qr-generator" onClick={(e) => { e.preventDefault(); navigateToTool('qr-generator'); setMobileMenuOpen(false); }} className="drawer-subitem font-semibold color-accent">QR Code Generator</a>
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
              <h1>Organize, compress, and edit PDFs.</h1>
              <p>Simple, lightning-fast tools that run completely client-side in your browser. Your files never leave your computer, ensuring absolute privacy.</p>
            </div>
            
            <div id="tools" className="tool-sections-container">
              {orderedCategories.map((category) => (
                <div key={category} className="tool-category-section">
                  <h2 className="tool-section-title">{category}</h2>
                  <div className="tool-grid">
                    {categorizedTools[category].map((tool) => (
                      <div 
                        key={tool.id} 
                        className="tool-card" 
                        onClick={() => setActiveTool(tool.id)}
                      >
                        <div className="tool-card-icon">{tool.icon}</div>
                        <h3>{tool.title}</h3>
                        <p>{tool.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Active Tool Workspace */
          <div className="workspace-container">
            <div className="workspace-header">
              <button className="btn-back" onClick={backToHome}>
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
              <div className="workspace-layout">
                {/* Left: QR Preview */}
                <div className="workspace-main" style={{ justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
                  {qrGenError && (
                    <div style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>
                      {qrGenError}
                    </div>
                  )}
                  {qrGenDataUrl ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{
                        padding: '1.5rem',
                        backgroundColor: qrGenBgColor,
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-md)',
                      }}>
                        <img 
                          src={qrGenDataUrl} 
                          alt="Generated QR Code" 
                          style={{ width: `${Math.min(qrGenSize, 280)}px`, height: `${Math.min(qrGenSize, 280)}px`, display: 'block' }} 
                        />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          Scan this QR Code to open:
                        </p>
                        <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', wordBreak: 'break-all', maxWidth: '300px' }}>
                          {qrGenText}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '280px' }}>
                        <button
                          className="btn-download-success"
                          style={{ width: '100%', padding: '0.75rem' }}
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = qrGenDataUrl;
                            a.download = `qrcode_${Date.now()}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                        >
                          <Download size={18} /> Download PNG
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <QrCode size={72} style={{ opacity: 0.3 }} />
                      <p style={{ fontSize: '0.9rem' }}>Enter a URL or text in the right panel to generate your QR code</p>
                    </div>
                  )}
                </div>

                {/* Right: Controls Sidebar */}
                <div className="workspace-sidebar">
                  <div className="sidebar-section">
                    <h3>QR Content</h3>
                    <div className="form-group">
                      <label>URL or Text</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        placeholder="https://example.com or any text..."
                        value={qrGenText}
                        onChange={(e) => setQrGenText(e.target.value)}
                        style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div className="sidebar-section">
                    <h3>Appearance</h3>
                    <div className="form-group">
                      <label>QR Color (Foreground)</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={qrGenFgColor}
                          onChange={(e) => setQrGenFgColor(e.target.value)}
                          style={{ width: '44px', height: '36px', padding: '2px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)' }}
                        />
                        <input
                          className="form-control"
                          type="text"
                          value={qrGenFgColor}
                          onChange={(e) => setQrGenFgColor(e.target.value)}
                          style={{ flex: 1, fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Background Color</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={qrGenBgColor}
                          onChange={(e) => setQrGenBgColor(e.target.value)}
                          style={{ width: '44px', height: '36px', padding: '2px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)' }}
                        />
                        <input
                          className="form-control"
                          type="text"
                          value={qrGenBgColor}
                          onChange={(e) => setQrGenBgColor(e.target.value)}
                          style={{ flex: 1, fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Size: {qrGenSize}px</label>
                      <input
                        type="range"
                        min={128}
                        max={1024}
                        step={64}
                        value={qrGenSize}
                        onChange={(e) => setQrGenSize(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span>128px</span>
                        <span>1024px</span>
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-section">
                    <h3>Quick Presets</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[
                        { label: '🖤 Classic (B&W)', fg: '#000000', bg: '#ffffff' },
                        { label: '🔴 Red Accent', fg: '#e11d48', bg: '#ffffff' },
                        { label: '🌑 Dark Mode', fg: '#f1f5f9', bg: '#0f172a' },
                        { label: '💙 Corporate Blue', fg: '#1e40af', bg: '#eff6ff' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          className="option-select-btn"
                          onClick={() => { setQrGenFgColor(preset.fg); setQrGenBgColor(preset.bg); }}
                          style={{ textAlign: 'left', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '2px', background: preset.fg, border: '1px solid var(--border-color)' }}></span>
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Sub-View: 1-5 — All non-QR tool views */}
            {activeTool !== 'qr-generator' && (processing ? (
              <div className="workspace-main" style={{ minHeight: '380px' }}>
                <div className="progress-container">
                  <div className="spinner"></div>
                  <div style={{ fontWeight: '600', marginTop: '1rem' }}>{processingStatus}</div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{progress}% Complete</div>
                </div>
              </div>
            ) : (activeTool !== 'qr-generator' && resultBlob) ? (
              /* Sub-View: 2. Success screen */
              <div className="workspace-main" style={{ minHeight: '380px' }}>
                <div className="success-screen">
                  <div className="success-icon-wrapper">
                    <CheckCircle2 size={40} />
                  </div>
                  <div>
                    <h3>Your file is ready!</h3>
                    <p>The processing completed entirely in your browser. Click download to retrieve your file.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '400px' }}>
                    <button className="btn-download-success" onClick={triggerDownload} style={{ width: '100%', padding: '0.75rem' }}>
                      <Download size={18} /> Download {
                        currentTool.id === 'pdf-to-img' ? 'ZIP' : 
                        currentTool.id === 'pdf-to-docx' ? 'Word DOCX' : 
                        currentTool.id === 'pdf-to-pptx' ? 'PowerPoint PPTX' : 
                        currentTool.id === 'pdf-to-xlsx' ? 'Excel XLSX' : 
                        'PDF'
                      }
                    </button>
                  </div>
                  <button className="btn-reset" onClick={resetToolState} style={{ marginTop: '0.5rem' }}>
                    Perform Another Operation
                  </button>

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

                  {/* Cache rendering status indicator */}
                  {loadingPreviews && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Rendering page previews ({previewProgress}%)...</span>
                    </div>
                  )}

                  {/* Merge View or General File List */}
                  {activeTool === 'merge' ? (
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
                                    setPreviewModalImage(file.firstPagePreview);
                                    setPreviewModalTitle(file.name);
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
                            <div key={page.id} className="file-preview-card">
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
                                      setPreviewModalImage(previewObj.dataUrl);
                                      setPreviewModalTitle(`Page ${page.originalIndex + 1}`);
                                    }}
                                  >
                                    <Eye size={14} />
                                  </button>
                                )}
                              </div>
                              <div className="file-preview-info">
                                <div className="file-preview-name">Page {page.originalIndex + 1}</div>
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
                              style={{ cursor: 'pointer' }}
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
                                        setPreviewModalImage(previewObj.dataUrl);
                                        setPreviewModalTitle(`Page ${originalIdx + 1}`);
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
                        <div style={{ 
                          position: 'relative', 
                          border: '1px solid var(--border-color)', 
                          boxShadow: 'var(--shadow-md)', 
                          backgroundColor: 'var(--bg-primary)',
                          maxWidth: '100%',
                          maxHeight: '420px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden'
                        }}>
                          <img 
                            ref={pageImageRef}
                            src={pagePreviews.find(p => p.originalIndex === activePageToSign)?.dataUrl} 
                            onLoad={handlePageImageLoad}
                            style={{ display: 'block', maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', pointerEvents: 'none' }}
                            alt="page to stamp"
                          />
                          
                          {/* Draggable signature element */}
                          <div 
                            style={{
                              position: 'absolute',
                              left: `${sigPos.x}px`,
                              top: `${sigPos.y}px`,
                              width: `${sigPos.w}px`,
                              height: `${sigPos.h}px`,
                              border: '1.5px dashed var(--accent-color)',
                              cursor: 'move',
                              backgroundColor: 'rgba(254, 226, 226, 0.2)',
                              touchAction: 'none'
                            }}
                            onMouseDown={handleSignatureMouseDown}
                            onTouchStart={handleSignatureMouseDown}
                          >
                            <img src={signatureDataUrl} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} alt="stamp seal" />
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
                            return (
                              <div 
                                key={originalIdx} 
                                className="file-preview-card"
                                style={{ border: pageStampCount > 0 ? '1.5px solid var(--success-color)' : '1px solid var(--border-color)' }}
                              >
                                {pageStampCount > 0 && (
                                  <div style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: 'var(--success-color)', color: 'white', borderRadius: 'var(--radius-full)', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '800', zIndex: 10 }}>
                                    {pageStampCount}
                                  </div>
                                )}
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
                                          setPreviewModalImage(previewObj.dataUrl);
                                          setPreviewModalTitle(`Page ${originalIdx + 1}`);
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
                  ) : activeTool === 'img-to-pdf' ? (
                    /* Image list */
                    <div className="files-preview-container">
                      <div className="files-grid">
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} className="file-preview-card">
                            <div className="file-preview-thumbnail" style={{ position: 'relative' }}>
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
                                  setPreviewModalImage(file.firstPagePreview);
                                  setPreviewModalTitle(file.name);
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
                        ))}
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
                            <img src={uploadedFiles[0].firstPagePreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="File Preview" />
                            <button 
                              className="btn-preview-eye" 
                              title="Preview Page" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewModalImage(uploadedFiles[0].firstPagePreview);
                                setPreviewModalTitle(uploadedFiles[0].name);
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
                            onClick={() => setProtectOptions({...protectOptions, algorithm: 'AES-256'})}
                          >
                            AES-256 (Strong)
                          </button>
                          <button 
                            className={`option-select-btn ${protectOptions.algorithm === 'RC4' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                            onClick={() => setProtectOptions({...protectOptions, algorithm: 'RC4'})}
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
                              onChange={(e) => setProtectOptions({...protectOptions, allowPrinting: e.target.checked})}
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
                              onChange={(e) => setProtectOptions({...protectOptions, allowCopying: e.target.checked})}
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
                              onChange={(e) => setProtectOptions({...protectOptions, allowModifying: e.target.checked})}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
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
                          onChange={(e) => setImgToPdfOptions({...imgToPdfOptions, layout: e.target.value})}
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
                            onClick={() => setImgToPdfOptions({...imgToPdfOptions, orientation: 'portrait'})}
                          >
                            Portrait
                          </button>
                          <button 
                            className={`option-select-btn ${imgToPdfOptions.orientation === 'landscape' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                            onClick={() => setImgToPdfOptions({...imgToPdfOptions, orientation: 'landscape'})}
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
                            onClick={() => setImgToPdfOptions({...imgToPdfOptions, margin: 'none'})}
                          >
                            None
                          </button>
                          <button 
                            className={`option-select-btn ${imgToPdfOptions.margin === 'small' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                            onClick={() => setImgToPdfOptions({...imgToPdfOptions, margin: 'small'})}
                          >
                            Small
                          </button>
                          <button 
                            className={`option-select-btn ${imgToPdfOptions.margin === 'large' ? 'active' : ''}`}
                            style={{ flex: 1 }}
                            onClick={() => setImgToPdfOptions({...imgToPdfOptions, margin: 'large'})}
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
                              onClick={() => setPageNumberOptions({...pageNumberOptions, position: pos})}
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
                          onChange={(e) => setPageNumberOptions({...pageNumberOptions, style: e.target.value})}
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
                            onChange={(e) => setPageNumberOptions({...pageNumberOptions, startNumber: parseInt(e.target.value) || 1})}
                          />
                        </div>
                        <div className="form-group">
                          <label>Font Size</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={pageNumberOptions.fontSize} 
                            onChange={(e) => setPageNumberOptions({...pageNumberOptions, fontSize: parseInt(e.target.value) || 10})}
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
                          onChange={(e) => setPageNumberOptions({...pageNumberOptions, color: e.target.value})}
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
                          onChange={(e) => setWatermarkOptions({...watermarkOptions, text: e.target.value})}
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
                          onChange={(e) => setWatermarkOptions({...watermarkOptions, opacity: parseFloat(e.target.value)})}
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
                          onChange={(e) => setWatermarkOptions({...watermarkOptions, size: parseInt(e.target.value)})}
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
                          onChange={(e) => setWatermarkOptions({...watermarkOptions, rotation: parseInt(e.target.value)})}
                        />
                      </div>

                      <div className="form-group">
                        <label>Text Color</label>
                        <input 
                          type="color" 
                          className="form-control" 
                          style={{ height: '38px', padding: '2px', cursor: 'pointer' }}
                          value={watermarkOptions.color} 
                          onChange={(e) => setWatermarkOptions({...watermarkOptions, color: e.target.value})}
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
                          onChange={(e) => setMetadataOptions({...metadataOptions, title: e.target.value})}
                        />
                      </div>

                      <div className="form-group">
                        <label>Author / Owner</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="Author name"
                          value={metadataOptions.author}
                          onChange={(e) => setMetadataOptions({...metadataOptions, author: e.target.value})}
                        />
                      </div>

                      <div className="form-group">
                        <label>Subject</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="Brief description"
                          value={metadataOptions.subject}
                          onChange={(e) => setMetadataOptions({...metadataOptions, subject: e.target.value})}
                        />
                      </div>

                      <div className="form-group">
                        <label>Keywords (comma separated)</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="pdf, document, report"
                          value={metadataOptions.keywords}
                          onChange={(e) => setMetadataOptions({...metadataOptions, keywords: e.target.value})}
                        />
                      </div>

                      <div className="form-group">
                        <label>Creator Application</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={metadataOptions.creator}
                          onChange={(e) => setMetadataOptions({...metadataOptions, creator: e.target.value})}
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

                  {/* Primary Trigger Button */}
                  <button 
                    className="btn-action-primary"
                    onClick={runProcess}
                    disabled={
                      (activeTool === 'split' && !splitRanges.trim()) ||
                      ((activeTool === 'sign' || activeTool === 'qr') && placedSignatures.length === 0) ||
                      ((activeTool === 'sign' || activeTool === 'qr') && activePageToSign !== null) ||
                      (activeTool === 'protect' && !protectPassword.trim())
                    }
                  >
                    {
                      activeTool === 'extract-text' ? 'Extract Text' :
                      activeTool === 'pdf-to-docx' ? 'Convert to Word' :
                      activeTool === 'pdf-to-pptx' ? 'Convert to PowerPoint' :
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
                    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.457 3.473 1.328 4.982L2.03 22l5.182-1.36c1.464.798 3.11 1.218 4.793 1.218 5.507 0 9.988-4.482 9.988-9.988C22 6.482 17.52 2 12.012 2zm6.262 14.372c-.258.73-1.488 1.428-2.046 1.482-.5.05-1.155.08-3.328-.82-2.777-1.15-4.57-3.98-4.71-4.168-.14-.19-1.123-1.493-1.123-2.846 0-1.353.708-2.015.96-2.28.25-.268.55-.333.73-.333.18 0 .36 0 .52.01.17 0 .4.01.61.51.22.53.76 1.86.83 1.99.07.13.11.29.02.46-.08.17-.18.28-.35.48-.17.2-.36.45-.52.6-.18.17-.37.36-.16.73.21.36.93 1.54 2 2.49 1.38 1.23 2.54 1.62 2.9 1.8.36.18.57.15.79-.09.21-.24.93-1.08 1.18-1.45.25-.37.5-.31.84-.18.35.13 2.2 1.04 2.58 1.23.38.19.64.28.73.43.08.16.08.93-.18 1.66z"/>
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
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.6.15-.15 2.76-2.53 2.81-2.75.01-.03.01-.1-.04-.15-.05-.05-.12-.03-.17-.02-.07.02-1.29.83-3.64 2.42-.34.24-.66.35-.95.34-.32-.01-.94-.18-1.4-.33-.56-.18-1-.28-.96-.6.02-.17.25-.34.69-.53 2.7-1.17 4.5-1.95 5.4-2.33 2.56-1.09 3.09-1.28 3.44-1.28.08 0 .25.02.36.11.1.08.13.2.14.3-.01.06-.01.12-.02.18z"/>
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
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
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
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
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
        <div className="preview-lightbox-backdrop" onClick={() => setPreviewModalImage(null)}>
          <div className="preview-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-lightbox-header">
              <span className="preview-lightbox-title">{previewModalTitle || 'Page Preview'}</span>
              <button className="preview-lightbox-close" onClick={() => setPreviewModalImage(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="preview-lightbox-body">
              <img src={previewModalImage} alt="Page Preview" className="preview-lightbox-img" />
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
    </div>
  );
}

export default App;
