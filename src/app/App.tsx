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
  const [reelKey, setReelKey] = useState<number>(0);
  const [isStageReady, setIsStageReady] = useState<boolean>(false);

  const [shouldReduceMotion, setShouldReduceMotion] = useState<boolean>(false);

  const handleStageReady = useCallback(() => {
    setIsStageReady(true);
  }, []);

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

  // Mobile Auto-Play Cinematic Reel (16s duration, holds at final packshot 1.0, restarts on reelKey change)
  // Starts only once the stage reports its videos are ready, so the reel is not already
  // running underneath the loading overlay on a slow connection.
  useEffect(() => {
    if (!isMobile || shouldReduceMotion || !isStageReady) return;

    let rafId: number | null = null;
    let lastTime: number | null = null;
    const DURATION_MS = 16000; // 16s cinematic reel

    const tick = (now: number) => {
      if (lastTime === null) lastTime = now;
      // Cap the delta so a stalled/backgrounded frame gap cannot jump the reel forward
      const deltaMs = Math.min(now - lastTime, 100);
      lastTime = now;

      const progress = Math.min(1, mobileProgressRef.current + deltaMs / DURATION_MS);
      mobileProgressRef.current = progress;

      rafId = progress < 1 ? requestAnimationFrame(tick) : null;
    };

    const startLoop = () => {
      if (rafId !== null || mobileProgressRef.current >= 1) return;
      lastTime = null;
      rafId = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastTime = null;
    };

    // The reel must resume when the tab comes back — otherwise it stays frozen forever
    const handleVisibilityChange = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    mobileProgressRef.current = 0;
    startLoop();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopLoop();
    };
  }, [isMobile, shouldReduceMotion, isStageReady, reelKey]);

  // Mobile CTA Replay Callback: Reset reel to 0.0 and launch fresh rAF animation cycle
  const handleMobileReplay = useCallback(() => {
    mobileProgressRef.current = 0;
    setReelKey((prev) => prev + 1);
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
          onReady={handleStageReady}
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
