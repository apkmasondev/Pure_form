import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  const startTimeRef = useRef<number>(performance.now());

  const [shouldReduceMotion, setShouldReduceMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check reduced motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const checkPreferences = () => {
      // Re-read network preference inside handler so it's always fresh
      const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
      const isSaveData = connection?.saveData === true;
      setShouldReduceMotion(mediaQuery.matches || isSaveData);
    };

    checkPreferences();

    const handleChange = () => {
      checkPreferences();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Mobile Auto-Play Cinematic Reel (16s duration, holds at final packshot 1.0)
  useEffect(() => {
    if (!isMobile || shouldReduceMotion) return;

    let rafId: number | null = null;
    startTimeRef.current = performance.now();
    const DURATION_MS = 16000; // 16s cinematic reel

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
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

  // Mobile CTA Replay Callback: Reset reel to 0.0 and play again
  const handleMobileReplay = useCallback(() => {
    startTimeRef.current = performance.now();
    mobileProgressRef.current = 0;
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

  // Use automated mobileProgressRef on mobile devices, and native scrollProgressRef on desktop
  const activeProgressRef = isMobile ? mobileProgressRef : scrollProgressRef;

  if (isMobile) {
    return (
      <main className="mobileContainer" aria-label="APKMASON Pure Form Mobile Cinematic Experience">
        <PerfumeStage
          targetProgressRef={activeProgressRef}
          isMobile={true}
          onCtaClick={handleMobileReplay}
        />
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
