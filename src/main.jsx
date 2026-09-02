import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'

import { ErrorBoundary } from './components/ErrorBoundary.jsx'

/**
 * Entry point for PDFCraft React Application
 * Mounts root component with StrictMode, ErrorBoundary, and Vercel Analytics tracking.
 */
const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
        <Analytics />
      </ErrorBoundary>
    </StrictMode>,
  )
}

