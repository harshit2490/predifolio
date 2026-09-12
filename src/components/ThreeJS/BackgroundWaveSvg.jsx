import React from 'react';

/**
 * BackgroundWaveSvg
 * Reproduces the user's reference image with:
 * - A deep, elegant header curve spanning the top of the section
 * - A smooth dome/hill arch (rising gently toward the center)
 * - A series of delicate, harmonious light contour lines cascading below the dark arch
 * - A subtle secondary translucent wave layer overlapping along the right flank with echo lines
 * - A soft, radiant ambient glow underneath that fades smoothly from top to bottom with lower opacity
 * - Two tailored themes for Light (Vestor deep teal/emerald) and Dark (obsidian & neon teal)
 */
export default function BackgroundWaveSvg({ theme = 'light', isDashboard = true }) {
  const isLight = theme === 'light';

  // Harmonic light contour lines cascading below the dark dome arch
  const contourCount = 10;
  const lightContourLines = Array.from({ length: contourCount }).map((_, i) => {
    const step = (i + 1) * 9.5;
    const yLeft = 118 + step + Math.sin(i * 0.4) * 4;
    const yCenter = 62 + step + Math.cos(i * 0.3) * 3;
    const yRight = 118 + step * 1.15 + Math.sin(i * 0.5) * 5;
    return {
      d: `M -20,${yLeft} C 200,${yLeft - 20} 420,${yCenter - 6} 720,${yCenter} C 1020,${yCenter + 6} 1240,${yRight - 10} 1460,${yRight}`,
      width: Math.max(0.55, (isLight ? 1.2 : 0.9) - i * 0.04),
      opacity: Math.max(0.08, (isLight ? 0.52 : 0.32) - i * (isLight ? 0.038 : 0.024)),
    };
  });

  // Secondary accent echo lines cascading below the full-width translucent wave
  const accentEchoCount = 5;
  const accentEchoLines = Array.from({ length: accentEchoCount }).map((_, i) => {
    const step = (i + 1) * 7.5;
    return {
      d: `M -20,${156 + step} C 230,${120 + step * 0.95} 480,${84 + step * 0.9} 720,${92 + step * 0.95} C 960,${100 + step * 1.05} 1210,${142 + step * 1.15} 1460,${168 + step * 1.25}`,
      width: Math.max(0.55, (isLight ? 1.0 : 0.8) - i * 0.05),
      opacity: Math.max(0.06, (isLight ? 0.38 : 0.22) - i * (isLight ? 0.045 : 0.03)),
    };
  });

  return (
    <div
      className="bg-wave-svg-wrapper"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: isDashboard ? '430px' : '470px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        // Smooth top-to-bottom opacity fade so the background seamlessly dissolves downward
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 32%, rgba(0,0,0,0.48) 68%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 32%, rgba(0,0,0,0.48) 68%, rgba(0,0,0,0) 100%)',
        transition: 'opacity 0.4s ease',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <defs>
          {/* Top-to-Bottom internal SVG opacity falloff mask */}
          <linearGradient id="headerWaveFadeGrad" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="68%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="90%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <mask id="headerWaveFadeMask">
            <rect x="-20" y="0" width="1480" height="470" fill="url(#headerWaveFadeGrad)" />
          </mask>

          {/* ========================================================= */}
          {/* LIGHT THEME GRADIENTS (Vestor Deep Teal & Emerald)        */}
          {/* ========================================================= */}
          {isLight ? (
            <>
              {/* 1. Main Top Teal Banner Fill */}
              <linearGradient id="topTealBannerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#033833" />
                <stop offset="45%" stopColor="#064e47" />
                <stop offset="85%" stopColor="#095a52" />
                <stop offset="100%" stopColor="#0D5C53" />
              </linearGradient>

              {/* 2. Secondary Translucent Overlapping Wave across Full Screen Width */}
              <linearGradient id="fullAccentWaveGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#0D5C53" stopOpacity="0.18" />
                <stop offset="25%" stopColor="#147A6E" stopOpacity="0.38" />
                <stop offset="50%" stopColor="#20B2AA" stopOpacity="0.45" />
                <stop offset="75%" stopColor="#147A6E" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.22" />
              </linearGradient>
              <linearGradient id="rightAccentWaveGrad" href="#fullAccentWaveGrad">
                <stop offset="0%" stopColor="#0D5C53" stopOpacity="0.18" />
                <stop offset="25%" stopColor="#147A6E" stopOpacity="0.38" />
                <stop offset="50%" stopColor="#20B2AA" stopOpacity="0.45" />
                <stop offset="75%" stopColor="#147A6E" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.22" />
              </linearGradient>

              {/* 3. Soft Crest Highlight Line along the Arch */}
              <linearGradient id="crestHighlightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#147A6E" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#2dd4bf" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#147A6E" stopOpacity="0.25" />
              </linearGradient>

              {/* 4. Light Contour Lines below the dark arch */}
              <linearGradient id="lightLinesGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#147A6E" stopOpacity="0.25" />
                <stop offset="30%" stopColor="#0D5C53" stopOpacity="0.55" />
                <stop offset="65%" stopColor="#20B2AA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
              </linearGradient>

              {/* 5. Soft Illuminated Glow Below the Arch */}
              <radialGradient id="bottomGlowGrad" cx="50%" cy="18%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#f0f9f7" stopOpacity="0.55" />
                <stop offset="70%" stopColor="#d8f3ee" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#F4F7F6" stopOpacity="0" />
              </radialGradient>
            </>
          ) : (
            /* ========================================================= */
            /* DARK THEME GRADIENTS (Deep Obsidian & Subtle Midnight Teal) */
            /* ========================================================= */
            <>
              {/* 1. Main Top Dark Midnight Obsidian Banner Fill */}
              <linearGradient id="topTealBannerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#010408" />
                <stop offset="40%" stopColor="#030a12" />
                <stop offset="75%" stopColor="#041217" />
                <stop offset="100%" stopColor="#06181d" />
              </linearGradient>

              {/* 2. Secondary Translucent Overlapping Wave across Full Screen Width */}
              <linearGradient id="fullAccentWaveGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#003847" stopOpacity="0.10" />
                <stop offset="25%" stopColor="#004d47" stopOpacity="0.18" />
                <stop offset="50%" stopColor="#006359" stopOpacity="0.22" />
                <stop offset="75%" stopColor="#004d47" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#002b28" stopOpacity="0.10" />
              </linearGradient>
              <linearGradient id="rightAccentWaveGrad" href="#fullAccentWaveGrad">
                <stop offset="0%" stopColor="#003847" stopOpacity="0.10" />
                <stop offset="25%" stopColor="#004d47" stopOpacity="0.18" />
                <stop offset="50%" stopColor="#006359" stopOpacity="0.22" />
                <stop offset="75%" stopColor="#004d47" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#002b28" stopOpacity="0.10" />
              </linearGradient>

              {/* 3. Soft Crest Highlight Line along the Arch */}
              <linearGradient id="crestHighlightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#00eabb" stopOpacity="0.50" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
              </linearGradient>

              {/* 4. Light Contour Lines below the dark arch */}
              <linearGradient id="lightLinesGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#007cf0" stopOpacity="0.2" />
                <stop offset="35%" stopColor="#00d4aa" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#00e676" stopOpacity="0.25" />
              </linearGradient>

              {/* 5. Soft Illuminated Glow Below the Arch */}
              <radialGradient id="bottomGlowGrad" cx="50%" cy="18%" r="65%">
                <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.09" />
                <stop offset="35%" stopColor="#007cf0" stopOpacity="0.05" />
                <stop offset="70%" stopColor="#061a24" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#0a0e17" stopOpacity="0" />
              </radialGradient>
            </>
          )}
        </defs>

        {/* Masked Content that fades smoothly downward */}
        <g mask="url(#headerWaveFadeMask)">
          {/* --- Layer 1: Soft Ambient Glow underneath the arch --- */}
          <rect x="-20" y="50" width="1480" height="400" fill="url(#bottomGlowGrad)" />

          {/* --- Layer 2: Main Top Curved Teal Banner (matches attached image) --- */}
          <path
            d="M -20,0 L 1460,0 L 1460,118 C 1240,108 1020,68 720,62 C 420,56 200,98 -20,118 Z"
            fill="url(#topTealBannerGrad)"
          />

          {/* --- Layer 3: Secondary Translucent Accent Wave spanning Full Screen Width --- */}
          <path
            d="M -20,102 C 220,76 460,48 720,56 C 980,64 1220,98 1460,116 L 1460,168 C 1210,142 960,100 720,92 C 480,84 230,120 -20,156 Z"
            fill="url(#fullAccentWaveGrad)"
          />

          {/* --- Layer 4: Delicate Highlight Stroke along the Main Arch Boundary --- */}
          <path
            d="M -20,118 C 200,98 420,56 720,62 C 1020,68 1240,108 1460,118"
            stroke="url(#crestHighlightGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* --- Layer 5: Highlight Stroke along the Full-Width Secondary Wave --- */}
          <path
            d="M -20,156 C 230,120 480,84 720,92 C 960,100 1210,142 1460,168"
            stroke="url(#fullAccentWaveGrad)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* --- Layer 6: Light Harmonic Contour Lines cascading below the Dark Arch --- */}
          <g stroke="url(#lightLinesGrad)">
            {lightContourLines.map((l, idx) => (
              <path
                key={idx}
                d={l.d}
                strokeWidth={l.width}
                strokeOpacity={l.opacity}
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </g>

          {/* --- Layer 7: Secondary Light Echo Lines spanning Full Width --- */}
          <g stroke="url(#fullAccentWaveGrad)">
            {accentEchoLines.map((r, idx) => (
              <path
                key={idx}
                d={r.d}
                strokeWidth={r.width}
                strokeOpacity={r.opacity}
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
