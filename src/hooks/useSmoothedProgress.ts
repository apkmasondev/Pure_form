import { useEffect, useRef } from 'react';
import { clamp } from '../lib/clamp';

const SMOOTHING_SECONDS = 0.145;

/**
 * Exponential smoothing function independent of screen refresh rate (60Hz vs 120Hz).
 */
export function calculateSmoothedProgress(
  current: number,
  target: number,
  deltaSeconds: number
): number {
  if (Math.abs(target - current) < 0.00001) return target;
  // Cap dt to avoid wild jumps on frame drop, and floor it at 0 — a negative delta
  // would invert alpha and push rendered progress *away* from the target.
  const clampedDt = clamp(deltaSeconds, 0, 0.1);
  const alpha = 1 - Math.exp(-clampedDt / SMOOTHING_SECONDS);
  const next = current + (target - current) * alpha;
  return clamp(next, 0, 1);
}

export function useSmoothedProgress(
  targetProgressRef: React.RefObject<number>,
  onFrameTick: (renderedProgress: number, dt: number) => void,
  enabled: boolean = true
) {
  const renderedProgressRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const onFrameTickRef = useRef(onFrameTick);

  // Keep callback ref fresh without restarting the effect
  onFrameTickRef.current = onFrameTick;

  useEffect(() => {
    if (!enabled) return;

    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }

      const deltaMs = now - lastTimeRef.current;
      lastTimeRef.current = now;
      const deltaSeconds = deltaMs / 1000;

      const target = targetProgressRef.current ?? 0;
      let nextRendered = 0;

      // Instantly hard-reset rendered progress when target drops from end (1.0) to start (0.0)
      // to eliminate backward sequence flashing (Layer C -> B -> A) on mobile replay
      if (target === 0 && renderedProgressRef.current > 0.8) {
        nextRendered = 0;
      } else {
        nextRendered = calculateSmoothedProgress(
          renderedProgressRef.current,
          target,
          deltaSeconds
        );
      }

      renderedProgressRef.current = nextRendered;

      onFrameTickRef.current(nextRendered, deltaSeconds);

      if (document.hidden) {
        rafIdRef.current = null;
        return;
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };

    // Guarded so the loop can never be started twice. Without the guard, mounting while
    // the page is hidden leaves a queued frame that fires on unhide *alongside* the frame
    // scheduled by the visibility handler — two loops sharing lastTimeRef, one of which
    // always sees dt≈0, halving the effective smoothing rate and orphaning a raf id.
    const startLoop = () => {
      if (rafIdRef.current !== null || document.hidden) return;
      lastTimeRef.current = performance.now();
      rafIdRef.current = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startLoop();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopLoop();
    };
  }, [targetProgressRef, enabled]);

  return { renderedProgressRef };
}
