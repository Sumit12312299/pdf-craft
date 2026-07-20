import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pdf-lib')) return 'vendor-pdf-lib';
            if (id.includes('pdfjs-dist')) return 'vendor-pdfjs';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('tesseract')) return 'vendor-ocr';
            if (id.includes('xlsx') || id.includes('docx') || id.includes('pptxgen') || id.includes('jspdf')) {
              return 'vendor-converters';
            }
            return 'vendor-core';
          }
        }
      }
    }
  }
});
