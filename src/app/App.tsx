import React, { useRef, useState, useEffect } from 'react';
import { useStableViewport } from '../hooks/useStableViewport';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { PerfumeStage } from '../components/PerfumeStage';
import { POSTER_MANIFEST } from '../lib/videoManifest';
import './app.css';

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewportHeight, isMobile } = useStableViewport();
  const { targetProgressRef } = useScrollProgress(containerRef);

  const [shouldReduceMotion, setShouldReduceMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check reduced motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Check network save-data header preference
    const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    const isSaveData = connection?.saveData === true;

    const checkPreferences = () => {
      setShouldReduceMotion(mediaQuery.matches || isSaveData);
    };

    checkPreferences();

    const handleChange = () => {
      checkPreferences();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (shouldReduceMotion) {
    const poster = isMobile ? POSTER_MANIFEST.finalMobile : POSTER_MANIFEST.finalDesktop;

    return (
      <main className="reducedMotionContainer" aria-label="APKMASON Pure Form">
        <img src={poster} alt="APKMASON Pure Form Bottle" className="reducedMotionPoster" />
        <div className="reducedMotionContent">
          <h1 className="reducedMotionTitle">APKMASON</h1>
          <p className="reducedMotionSubtitle">PURE FORM — FORMED FROM LIGHT</p>
        </div>
      </main>
    );
  }

  // Calculate stable 10.4x runway height using stableViewportHeight
  const runwayHeightPx = Math.round(viewportHeight * 10.4);

  return (
    <main
      ref={containerRef}
      className="runwayContainer"
      style={{ height: `${runwayHeightPx}px` }}
    >
      <PerfumeStage targetProgressRef={targetProgressRef} isMobile={isMobile} />
    </main>
  );
};

export default App;
