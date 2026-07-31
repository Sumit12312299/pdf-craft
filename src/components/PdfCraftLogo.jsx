import React from 'react';

/**
 * PdfCraftLogo Component
 * Premium vector SVG logo icon for PDFCraft.
 * 
 * Props:
 * - size: number | string (default: 40)
 * - variant: 'icon' | 'full' | 'favicon' | 'white-icon' | 'white-full' (default: 'icon')
 * - theme: 'color' | 'white' (default: 'color')
 * - className: string (optional extra CSS classes)
 * - showTagline: boolean (only for full variants, default: true)
 */
export const PdfCraftLogo = ({
  size = 40,
  variant = 'icon',
  theme = 'color',
  className = '',
  showTagline = true,
  ...props
}) => {
  const isWhite = theme === 'white' || variant.startsWith('white');
  const baseVariant = variant.replace('white-', '');

  if (baseVariant === 'favicon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pdfcraft-logo-icon ${className}`}
        {...props}
      >
        <defs>
          <linearGradient id="reactFavRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF385C" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>
          <linearGradient id="reactFavCraft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <filter id="reactFavShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#E11D48" floodOpacity="0.4" />
          </filter>
        </defs>

        <g filter="url(#reactFavShadow)">
          <rect x="36" y="16" width="60" height="84" rx="10" fill="url(#reactFavCraft)" transform="rotate(-6 66 58)" opacity="0.8" />
          <path d="M 34 16 C 34 11.58 37.58 8 42 8 L 76 8 L 96 28 L 96 104 C 96 108.42 92.42 112 88 112 L 42 112 C 37.58 112 34 108.42 34 104 Z" fill="url(#reactFavRed)" />
          <path d="M 76 8 L 96 28 L 82 28 C 78.69 28 76 25.31 76 22 Z" fill="#FFFFFF" opacity="0.35" />
          <path d="M 48 38 L 65 38 C 72 38 77 42 77 48 C 77 54 72 58 65 58 L 57 58 L 57 76 L 48 76 Z M 57 46 L 57 50 L 64 50 C 67 50 69 49 69 48 C 69 47 67 46 64 46 Z" fill="#FFFFFF" />
          <path d="M 72 82 Q 72 88 78 88 Q 72 88 72 94 Q 72 88 66 88 Q 72 88 72 82 Z" fill="#FFD166" />
        </g>
      </svg>
    );
  }

  if (baseVariant === 'full') {
    const calculatedHeight = typeof size === 'number' ? size : 48;
    const calculatedWidth = typeof size === 'number' ? size * 3.75 : '100%';

    if (isWhite) {
      return (
        <svg
          width={calculatedWidth}
          height={calculatedHeight}
          viewBox="0 0 600 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`pdfcraft-logo-full-white ${className}`}
          {...props}
        >
          <g transform="translate(20, 10)">
            <rect x="36" y="20" width="70" height="96" rx="12" fill="#FFFFFF" transform="rotate(-6 71 68)" opacity="0.4" />
            <path d="M 32 20 C 32 14.48 36.48 10 42 10 L 80 10 L 102 32 L 102 118 C 102 123.52 97.52 128 92 128 L 42 128 C 36.48 128 32 123.52 32 118 Z" fill="#FFFFFF" />
            <path d="M 80 10 L 102 32 L 86 32 C 82.69 32 80 29.31 80 26 Z" fill="#CBD5E1" />
            <rect x="44" y="30" width="24" height="4" rx="2" fill="#0F172A" opacity="0.8" />
            <rect x="44" y="38" width="40" height="3" rx="1.5" fill="#64748B" opacity="0.4" />
            <rect x="44" y="44" width="32" height="3" rx="1.5" fill="#64748B" opacity="0.4" />
            <g transform="translate(42, 54)">
              <rect x="0" y="0" width="50" height="56" rx="8" fill="#0F172A" />
              <text x="25" y="20" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" fontWeight="900" fontSize="13" letterSpacing="1" fill="#EF4444" textAnchor="middle">PDF</text>
              <rect x="8" y="26" width="34" height="1.5" rx="0.75" fill="#334155" />
              <circle cx="16" cy="38" r="3" stroke="#FFFFFF" strokeWidth="1" fill="none" />
              <circle cx="34" cy="38" r="3" stroke="#FFFFFF" strokeWidth="1" fill="none" />
              <path d="M 18 40 L 32 48 M 32 40 L 18 48" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
            </g>
            <path d="M 104 56 Q 104 62 110 62 Q 104 62 104 68 Q 104 62 98 62 Q 104 62 104 56 Z" fill="#FFFFFF" />
          </g>
          <g transform="translate(160, 104)">
            <text x="0" y="0" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" fontWeight="900" fontSize="64" letterSpacing="-1.5" fill="#FFFFFF">PDF</text>
            <text x="135" y="0" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" fontWeight="400" fontSize="64" letterSpacing="-1" fill="#FFFFFF" opacity="0.9">Craft</text>
            <path d="M 312 -54 Q 312 -46 320 -46 Q 312 -46 312 -38 Q 312 -46 304 -46 Q 312 -46 312 -54 Z" fill="#FFFFFF" />
            {showTagline && (
              <text x="4" y="26" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" fontWeight="600" fontSize="16" letterSpacing="3" fill="#FFFFFF" opacity="0.75">CLIENT-SIDE PDF STUDIO</text>
            )}
          </g>
        </svg>
      );
    }

    return (
      <svg
        width={calculatedWidth}
        height={calculatedHeight}
        viewBox="0 0 600 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pdfcraft-logo-full ${className}`}
        {...props}
      >
        <defs>
          <linearGradient id="reactFullRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF385C" />
            <stop offset="50%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>

          <linearGradient id="reactFullCraftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>

          <linearGradient id="reactFullGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
          </linearGradient>

          <filter id="reactFullShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#E11D48" floodOpacity="0.25" />
          </filter>
        </defs>

        <g transform="translate(20, 10)" filter="url(#reactFullShadow)">
          <rect x="36" y="20" width="70" height="96" rx="12" fill="url(#reactFullCraftGrad)" transform="rotate(-6 71 68)" opacity="0.75" />
          <path d="M 32 20 C 32 14.48 36.48 10 42 10 L 80 10 L 102 32 L 102 118 C 102 123.52 97.52 128 92 128 L 42 128 C 36.48 128 32 123.52 32 118 Z" fill="url(#reactFullRedGrad)" />
          <path d="M 80 10 L 102 32 L 86 32 C 82.69 32 80 29.31 80 26 Z" fill="url(#reactFullGlassGrad)" />
          <rect x="44" y="32" width="26" height="4" rx="2" fill="#FFFFFF" opacity="0.9" />
          <rect x="44" y="42" width="42" height="3" rx="1.5" fill="#FFFFFF" opacity="0.4" />
          <rect x="44" y="49" width="34" height="3" rx="1.5" fill="#FFFFFF" opacity="0.4" />
          <path d="M 44 64 L 62 64 C 70 64 75 68 75 74 C 75 80 70 84 62 84 L 53 84 L 53 104 L 44 104 Z M 53 72 L 53 76 L 61 76 C 64 76 66 75 66 74 C 66 73 64 72 61 72 Z" fill="#FFFFFF" />
          <circle cx="86" cy="74" r="5" stroke="#FFD166" strokeWidth="2" fill="none" />
          <path d="M 82 82 L 94 94 M 82 94 L 94 82" stroke="#FFD166" strokeWidth="2" strokeLinecap="round" />
          <path d="M 104 56 Q 104 62 110 62 Q 104 62 104 68 Q 104 62 98 62 Q 104 62 104 56 Z" fill="#FFD166" />
        </g>

        <g transform="translate(160, 104)">
          <text x="0" y="0" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" fontWeight="900" fontSize="64" letterSpacing="-1.5" fill="url(#reactFullRedGrad)">PDF</text>
          <text x="135" y="0" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" fontWeight="400" fontSize="64" letterSpacing="-1" fill="currentColor">Craft</text>
          <path d="M 312 -54 Q 312 -46 320 -46 Q 312 -46 312 -38 Q 312 -46 304 -46 Q 312 -46 312 -54 Z" fill="#FFD166" />
          {showTagline && (
            <text x="4" y="26" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" fontWeight="600" fontSize="16" letterSpacing="3" fill="currentColor" opacity="0.6">CLIENT-SIDE PDF STUDIO</text>
          )}
        </g>
      </svg>
    );
  }

  // Classic White Icon Mode
  if (isWhite) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pdfcraft-logo-icon-white ${className}`}
        {...props}
      >
        <g>
          <rect x="145" y="65" width="240" height="340" rx="24" fill="#FFFFFF" transform="rotate(-6 265 235)" opacity="0.3" />
          <rect x="140" y="70" width="240" height="340" rx="24" fill="#FFFFFF" transform="rotate(-3 260 240)" opacity="0.6" />
          <path d="M 136 72 C 136 56.5 148.5 44 164 44 L 300 44 L 380 124 L 380 420 C 380 435.5 367.5 448 352 448 L 164 448 C 148.5 448 136 435.5 136 420 Z" fill="#FFFFFF" />
          <path d="M 300 44 L 380 124 L 324 124 C 310.75 124 300 113.25 300 100 Z" fill="#CBD5E1" />

          <rect x="180" y="125" width="100" height="12" rx="6" fill="#0F172A" opacity="0.85" />
          <rect x="180" y="155" width="160" height="10" rx="5" fill="#64748B" opacity="0.4" />
          <rect x="180" y="177" width="130" height="10" rx="5" fill="#64748B" opacity="0.4" />

          <g transform="translate(176, 215)">
            <rect x="0" y="0" width="164" height="175" rx="20" fill="#0F172A" />
            <text x="82" y="52" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" fontWeight="900" fontSize="34" letterSpacing="2" fill="#EF4444" textAnchor="middle">PDF</text>
            <rect x="24" y="68" width="116" height="3" rx="1.5" fill="#334155" />
            <g transform="translate(42, 82)">
              <circle cx="20" cy="20" r="8" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
              <circle cx="60" cy="20" r="8" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
              <path d="M 26 25 L 54 50 M 54 25 L 26 50" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
              <circle cx="40" cy="37.5" r="3" fill="#EF4444" />
            </g>
          </g>

          <path d="M 395 190 Q 395 208 413 208 Q 395 208 395 226 Q 395 208 377 208 Q 395 208 395 190 Z" fill="#FFFFFF" />
          <path d="M 104 350 Q 104 362 116 362 Q 104 362 104 374 Q 104 362 92 362 Q 104 362 104 350 Z" fill="#FFFFFF" opacity="0.8" />
        </g>
      </svg>
    );
  }

  // Default: Colored Icon mode
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pdfcraft-logo-icon ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="reactPdfRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF385C" />
          <stop offset="50%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>

        <linearGradient id="reactCraftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>

        <linearGradient id="reactGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
        </linearGradient>

        <linearGradient id="reactFoldShadowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#450A0A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#991B1B" stopOpacity="0.1" />
        </linearGradient>

        <filter id="reactMainShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#E11D48" floodOpacity="0.3" />
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.25" />
        </filter>

        <filter id="reactStarGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g filter="url(#reactMainShadow)">
        <rect x="145" y="70" width="240" height="340" rx="24" fill="url(#reactCraftGrad)" transform="rotate(-7 265 240)" opacity="0.7" />
        <rect x="140" y="75" width="240" height="340" rx="24" fill="#FFFFFF" transform="rotate(-3.5 260 245)" opacity="0.2" />
        
        <path d="M 136 72 C 136 56.5 148.5 44 164 44 L 300 44 L 380 124 L 380 420 C 380 435.5 367.5 448 352 448 L 164 448 C 148.5 448 136 435.5 136 420 Z" fill="url(#reactPdfRedGrad)" />
        <path d="M 300 44 L 380 124 L 324 124 C 310.75 124 300 113.25 300 100 Z" fill="url(#reactGlassGrad)" />
        <path d="M 300 44 L 380 124 L 324 124 C 310.75 124 300 113.25 300 100 Z" fill="url(#reactFoldShadowGrad)" />

        <rect x="180" y="130" width="90" height="12" rx="6" fill="#FFFFFF" opacity="0.95" />
        <rect x="180" y="160" width="160" height="10" rx="5" fill="#FFFFFF" opacity="0.4" />
        <rect x="180" y="182" width="130" height="10" rx="5" fill="#FFFFFF" opacity="0.4" />

        <g transform="translate(176, 220)">
          <rect x="0" y="0" width="164" height="170" rx="20" fill="rgba(15, 23, 42, 0.4)" stroke="url(#reactGlassGrad)" strokeWidth="1.5" />
          <path d="M 28 32 L 56 32 C 68 32 76 39 76 50 C 76 61 68 68 56 68 L 44 68 L 44 96 L 28 96 Z M 44 46 L 44 54 L 54 54 C 60 54 62 52 62 50 C 62 48 60 46 54 46 Z" fill="#FFFFFF" />
          <circle cx="96" cy="38" r="6" stroke="#FFD166" strokeWidth="3" fill="none" />
          <circle cx="96" cy="82" r="6" stroke="#FFD166" strokeWidth="3" fill="none" />
          <path d="M 106 43 L 136 77 M 106 77 L 136 43" stroke="#FFD166" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="28" y="120" width="108" height="8" rx="4" fill="url(#reactCraftGrad)" />
          <rect x="28" y="136" width="70" height="6" rx="3" fill="#FFFFFF" opacity="0.6" />
        </g>

        <path d="M 400 200 Q 400 220 420 220 Q 400 220 400 240 Q 400 220 380 220 Q 400 220 400 200 Z" fill="#FFD166" filter="url(#reactStarGlow)" />
        <path d="M 104 360 Q 104 372 116 372 Q 104 372 104 384 Q 104 372 92 372 Q 104 372 104 360 Z" fill="#FF8A00" filter="url(#reactStarGlow)" />
      </g>
    </svg>
  );
};

export default PdfCraftLogo;
