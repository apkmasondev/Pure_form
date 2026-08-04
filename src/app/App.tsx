import React, { useRef, useState, useEffect } from 'react';
import { useStableViewport } from '../hooks/useStableViewport';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { PerfumeStage } from '../components/PerfumeStage';
import { POSTER_MANIFEST } from '../lib/videoManifest';
import './app.css';

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewportHeight, isMobile } = useStableViewport();
  const { targetProgressRef: scrollProgressRef } = useScrollProgress(containerRef);
  const mobileProgressRef = useRef<number>(0);

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

  // Mobile Auto-Play Cinematic Reel Loop (16 seconds automated playback)
  useEffect(() => {
    if (!isMobile || shouldReduceMotion) return;

    let rafId: number | null = null;
    const startTime = performance.now();
    const DURATION_MS = 16000; // 16s cinematic reel loop

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, Math.max(0, elapsed / DURATION_MS));
      mobileProgressRef.current = progress;

      if (progress < 1 && !document.hidden) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isMobile, shouldReduceMotion]);

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

  // Use automated mobileProgressRef on mobile devices, and native scrollProgressRef on desktop
  const activeProgressRef = isMobile ? mobileProgressRef : scrollProgressRef;

  if (isMobile) {
    return (
      <main className="mobileContainer" aria-label="APKMASON Pure Form Mobile Cinematic Experience">
        <PerfumeStage targetProgressRef={activeProgressRef} isMobile={true} />
      </main>
    );
  }

  // Calculate stable 10.4x runway height for desktop native scroll scrubbing
  const runwayHeightPx = Math.round(viewportHeight * 10.4);

  return (
    <main
      ref={containerRef}
      className="runwayContainer"
      style={{ height: `${runwayHeightPx}px` }}
    >
      <PerfumeStage targetProgressRef={activeProgressRef} isMobile={false} />
    </main>
  );
};

export default App;
