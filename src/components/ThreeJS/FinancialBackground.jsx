import React, { Suspense, useMemo, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Candlesticks from './Candlesticks';
import TrendLines from './TrendLines';
import FinancialGrid from './FinancialGrid';
import DataParticles from './DataParticles';
import BackgroundWaveSvg from './BackgroundWaveSvg';

export default function FinancialBackground({ variant = 'auth', theme = 'light', style = {} }) {
  const isDashboard = variant === 'dashboard' || variant === 'dashboard-threejs-theme';
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Controlled density and subtle background opacity
  const config = useMemo(() => {
    let pCount = isDashboard ? 130 : 160;
    let cCount = isDashboard ? 8 : 12;

    if (isMobile) {
      pCount = Math.floor(pCount * 0.5);
      cCount = Math.floor(cCount * 0.5);
    }

    return {
      particleCount: pCount,
      candleCount: cCount,
      // Subtle multipliers so background elements remain strictly ambient
      opacityMult: isDashboard ? 0.6 : 0.75,
      cameraPosition: isDashboard ? [0, 1.8, 12] : [0, 1.0, 10],
    };
  }, [isDashboard, isMobile]);

  // Colors based on theme
  const fogColor = theme === 'light' ? '#F4F7F6' : '#0a0e17';
  const ambientIntensity = theme === 'light' ? 1.8 : 0.7;
  const dirIntensity = theme === 'light' ? 1.8 : 1.1;

  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <div
      className={`financial-bg-wrapper ${variant}`}
      style={{
        position: 'fixed',
        top: isDashboard ? 'var(--header-height, 50px)' : 0,
        left: 0,
        right: 0,
        width: '100vw',
        height: isDashboard ? 'calc(100vh - var(--header-height, 50px))' : '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        transition: 'opacity 0.4s ease',
        ...style,
      }}
      aria-hidden="true"
    >
      {/* Dynamic Background SVG Ribbon Wave on top of section */}
      <BackgroundWaveSvg theme={theme} isDashboard={isDashboard} />

      <Canvas
        camera={{ position: config.cameraPosition, fov: 45 }}
        dpr={Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={(state) => {
          state.gl.domElement.addEventListener('webglcontextlost', () => {
            setHasError(true);
          });
        }}
      >
        <fog attach="fog" args={[fogColor, 10, 38]} />

        <ambientLight intensity={ambientIntensity} />
        <directionalLight position={[6, 10, 6]} intensity={dirIntensity} color="#ffffff" />
        <directionalLight position={[-6, 4, -4]} intensity={0.5} color={theme === 'light' ? '#0D5C53' : '#00d4aa'} />

        <Suspense fallback={null}>
          <FinancialGrid opacityMult={config.opacityMult} theme={theme} />
          <TrendLines opacityMult={config.opacityMult} theme={theme} isMobile={isMobile} />
          <Candlesticks count={config.candleCount} opacityMult={config.opacityMult} theme={theme} isDashboard={isDashboard} />
          <DataParticles count={config.particleCount} opacityMult={config.opacityMult} theme={theme} />
        </Suspense>
      </Canvas>
    </div>
  );
}
