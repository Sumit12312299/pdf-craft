import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
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
  FileText
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
  extractTextFromPdf 
} from './utils/pdfProcessor';

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

  // File States
  const [uploadedFiles, setUploadedFiles] = useState([]); // { file, buffer, pageCount, name, size, type, previewUrl, firstPagePreview }
  const [dragActive, setDragActive] = useState(false);

  // Pre-rendered Page Cache for Organize & Split tools
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
      icon: <ImageIcon size={24} />,
      category: 'Convert to PDF',
      multiple: true,
      accept: '.jpg,.jpeg,.png'
    },
    {
      id: 'pdf-to-img',
      title: 'PDF to JPG',
      description: 'Convert and extract every page of a PDF document into standard JPG images.',
      icon: <FileImage size={24} />,
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
        } else {
          // It is an image file
          firstPagePreview = URL.createObjectURL(file);
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
    }
  };

  const resetToolState = () => {
    uploadedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setUploadedFiles([]);
    setPagePreviews([]);
    setOrganizePages([]);
    setSelectedPagesForSplit(new Set());
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
  };

  const backToHome = () => {
    resetToolState();
    setActiveTool(null);
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
    
    // Attempt to parse range and select pages visually
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

  // Perform Operations (Highly optimized processing routines)
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

      else if (activeTool === 'extract-text') {
        setProcessingStatus('Extracting text content...');
        const file = uploadedFiles[0];
        const text = await extractTextFromPdf(file.buffer, (prog) => {
          setProgress(20 + Math.round(prog * 0.7)); // scale progress from 20% to 90%
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
        }, 150); // fast completion feedback
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

  const categorizedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  return (
    <div className="app-container">
      {/* Header */}
      <header className="navbar">
        <a href="/" className="nav-brand" onClick={(e) => { e.preventDefault(); backToHome(); }}>
          <span>pdf</span><span className="accent">Craft</span>
        </a>
        
        <div className="nav-links">
          <a href="#tools" className="nav-link" onClick={(e) => { e.preventDefault(); backToHome(); }}>All Tools</a>
          <button onClick={toggleTheme} className="btn-icon" title="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
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
              {Object.keys(categorizedTools).map((category) => (
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

            {/* Sub-View: 1. Processing Screen */}
            {processing ? (
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
            ) : resultBlob ? (
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
                  <button className="btn-download-success" onClick={triggerDownload}>
                    <Download size={18} /> Download {currentTool.id === 'pdf-to-img' ? 'ZIP' : 'PDF'}
                  </button>
                  <button className="btn-reset" onClick={resetToolState}>
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
            ) : uploadedFiles.length === 0 ? (
              /* Sub-View: 4. Empty state Dropzone */
              <div 
                className={`workspace-main dropzone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('workspace-file-input').click()}
              >
                <UploadCloud size={48} className="dropzone-icon" />
                <div>
                  <h3>Drag & Drop files here</h3>
                  <p>or click to browse from your computer</p>
                </div>
                <button className="btn-upload" onClick={(e) => { e.stopPropagation(); document.getElementById('workspace-file-input').click(); }}>
                  Select Files
                </button>
                <input 
                  id="workspace-file-input" 
                  type="file" 
                  className="file-input" 
                  multiple={currentTool.multiple}
                  accept={currentTool.accept}
                  onChange={handleFileInput}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Supported formats: {currentTool.accept.toUpperCase().replace(/\./g, ' ')}
                </span>
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
                              <div style={{ width: '32px', height: '40px', flexShrink: 0, border: '1px solid var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                                <img src={file.firstPagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="pdf first page" />
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
                              <div className="file-preview-thumbnail">
                                {previewObj ? (
                                  <img 
                                    src={previewObj.dataUrl} 
                                    className="file-preview-img"
                                    alt={`Page ${originalIdx + 1}`}
                                  />
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
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} className="file-preview-card">
                            <div className="file-preview-thumbnail">
                              <img src={file.firstPagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="uploaded" />
                              <div className="card-actions">
                                <button className="btn-card-action" title="Delete Image" onClick={() => removeFile(idx)}>
                                  <Trash2 size={12} />
                                </button>
                              </div>
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
                      <div style={{ width: '120px', height: '160px', boxShadow: 'var(--shadow-md)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                        <img src={uploadedFiles[0].firstPagePreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="PDF Preview" />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '1rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadedFiles[0].name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {(uploadedFiles[0].size / 1024 / 1024).toFixed(2)} MB • {uploadedFiles[0].pageCount} pages
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

                  {activeTool === 'compress' && (
                    <div className="sidebar-section">
                      <h3>Compression Level</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button 
                          className={`option-select-btn ${compressLevel === 'high' ? 'active' : ''}`}
                          onClick={() => setCompressLevel('high')}
                        >
                          Extreme Compression
                          <div style={{ fontSize: '0.7rem', fontWeight: '400', opacity: 0.8 }}>Less quality, smallest file</div>
                        </button>
                        <button 
                          className={`option-select-btn ${compressLevel === 'recommended' ? 'active' : ''}`}
                          onClick={() => setCompressLevel('recommended')}
                        >
                          Recommended Compression
                          <div style={{ fontSize: '0.7rem', fontWeight: '400', opacity: 0.8 }}>Good quality and size</div>
                        </button>
                        <button 
                          className={`option-select-btn ${compressLevel === 'low' ? 'active' : ''}`}
                          onClick={() => setCompressLevel('low')}
                        >
                          Less Compression
                          <div style={{ fontSize: '0.7rem', fontWeight: '400', opacity: 0.8 }}>High quality, larger file</div>
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

                  {/* Primary Trigger Button */}
                  <button 
                    className="btn-action-primary"
                    onClick={runProcess}
                    disabled={activeTool === 'split' && !splitRanges.trim()}
                  >
                    {activeTool === 'extract-text' ? 'Extract Text' : `Convert to ${currentTool.id === 'pdf-to-img' ? 'Images' : 'PDF'}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

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
