import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
    cssCodeSplit: true,
    target: 'es2022',
    rollupOptions: {
      output: {
        // NOTE: manualChunks removed — it was causing circular dependency
        // issues between vendor chunks, leading to a TDZ ReferenceError
        // ("Cannot access 'X' before initialization") and a blank white screen.
      }
    }
  }
});

