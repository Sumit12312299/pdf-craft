# 📄 PDFCraft

PDFCraft is a high-performance, client-side PDF manipulation and utility suite built with **React**, **Vite**, and **Tailwind-like Vanilla CSS**. Designed with security and privacy in mind, PDFCraft processes all files **locally in the browser**—ensuring your sensitive documents never upload to a third-party server.

---

## ✨ Features

### 🛠️ Organize PDFs
*   **Merge PDF:** Combine multiple PDF documents into a single file in any custom order.
*   **Split PDF:** Extract specific pages or range strings (e.g., `1-3, 5, 8-10`) into a new PDF.
*   **Organize PDF:** Visually sort, drag-and-drop to reorder, rotate, or delete individual pages.
*   **Rotate PDF:** Apply global rotation (90, 180, or 270 degrees) to all pages in a document.

### ✍️ Edits & Enhancements
*   **Sign PDF:** Draw a custom signature or upload an image, then visually place and resize it on any page.
*   **Stamp QR Code:** Generate a QR code from text or URLs with custom labels and colors, then stamp it on pages.
*   **Add Page Numbers:** Insert styled headers or footers (e.g., "Page X of Y") in various layouts and color options.
*   **Add Watermark:** Overlay text watermarks with customizable opacity, rotation angle, font size, and color.
*   **Crop PDF:** Visually define margins (top, bottom, left, right percentages) to crop page sizes.

### 🔒 Security
*   **Protect PDF:** Secure documents with password encryption utilizing robust algorithms like AES-256.
*   **Unlock PDF:** Strip password protection from encrypted PDFs (requires the current password).

### ⚡ Optimization
*   **Compress PDF:** Reduce file sizes using smart client-side rasterization settings (high, recommended, low) while preserving visual clarity.
*   **Grayscale Conversion:** Convert color documents to grayscale (ink-saver mode) using hardware-accelerated canvas rendering.
*   **Metadata Editor:** Easily modify document details like Title, Author, Subject, Keywords, and Creator.
*   **Extract Text:** Scan and extract text contents from any PDF entirely client-side.

### 🔄 Document Conversions
*   **To PDF:**
    *   **JPG / PNG to PDF:** Convert images into a clean, paginated PDF with adjustable orientation (portrait/landscape) and margins.
    *   **Word (DOCX) to PDF:** Render Word documents into PDFs locally using Mammoth.js.
    *   **PowerPoint (PPTX) to PDF:** Convert slides into PDFs using XML zip parsing.
    *   **Excel (XLSX) to PDF:** Convert spreadsheets to PDFs using SheetJS.
    *   **HTML to PDF:** Render HTML files directly to PDF layout.
*   **From PDF:**
    *   **PDF to Word (DOCX):** Reconstruct editable DOCX files by extracting structural text layouts.
    *   **PDF to PowerPoint (PPTX):** Convert PDF pages into slide layouts.
    *   **PDF to Excel (XLSX):** Extract tabular data into structured spreadsheet formats.
    *   **PDF to PDF/A:** Standardize files to the PDF/A format for long-term archiving.

---

## 🚀 Technology Stack

*   **Framework:** React 19 + Vite 8
*   **Styling:** Vanilla CSS (Modern premium variables, Dark/Light theme, glassmorphism)
*   **Core Libraries:**
    *   [`pdf-lib`](https://github.com/Hopding/pdf-lib): Document creation, merging, splitting, watermarking, metadata edits, and signatures.
    *   [`pdf.js`](https://mozilla.github.io/pdf.js/): Client-side document page rendering, preview thumbnails, and text extraction.
    *   [`mammoth.js`](https://github.com/mwilliamson/mammoth.js): Client-side DOCX parser and HTML compiler.
    *   [`SheetJS (xlsx)`](https://sheetjs.com/): Reading and writing Excel spreadsheets.
    *   [`html2pdf.js`](https://github.com/eKoopmans/html2pdf.js): Converting HTML containers to pdf-lib buffers.
    *   [`@pdfsmaller/pdf-encrypt`](https://github.com/pdfsmaller/pdf-encrypt): AES-256 PDF encryption client-side.
    *   [`jszip`](https://stuk.github.io/jszip/): Unzipping and parsing slide structure in PPTX files.
    *   [`qrcode`](https://github.com/soldair/node-qrcode): Live QR Code generator.
    *   [`lucide-react`](https://lucide.dev/): Premium modern iconography.

---

## 📦 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sumit12312299/pdf-craft.git
   cd pdf-craft
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser and navigate to the local address displayed (usually `http://localhost:5173`).

### Production Build

To build the static assets for production:
```bash
npm run build
```
To test and preview the production build locally:
```bash
npm run preview
```

---

## 📂 Project Structure

```text
├── public/                 # Static assets, icons, manifest, and service worker
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker for offline asset caching
├── src/
│   ├── assets/             # Images and local styles
│   ├── utils/
│   │   └── pdfProcessor.js # Core client-side processing algorithms
│   ├── App.css             # Component-specific styles
│   ├── App.jsx             # Main application and interactive UI components
│   ├── index.css           # Global theme variables, dark mode, animations
│   └── main.jsx            # React mounting setup
├── index.html              # Entry HTML with CDN scripts for heavy processors
├── package.json            # Scripts & dependencies configuration
└── vite.config.js          # Vite plugins and configuration settings
```

---

## 🔒 Privacy & Security First

Unlike online PDF utilities that process documents on remote servers, **PDFCraft processes everything in your browser**.
*   No document bytes are ever sent over the network.
*   Encryption and decryption keys are handled strictly within local memory.
*   Works fully offline when registered as a Progressive Web App (PWA).

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
