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
  // Ensure dt is capped to avoid wild jumps on frame drop
  const clampedDt = Math.min(deltaSeconds, 0.1);
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
      const nextRendered = calculateSmoothedProgress(
        renderedProgressRef.current,
        target,
        deltaSeconds
      );
      renderedProgressRef.current = nextRendered;

      onFrameTick(nextRendered, deltaSeconds);

      if (!document.hidden) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      } else {
        lastTimeRef.current = performance.now();
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [targetProgressRef, onFrameTick, enabled]);

  return { renderedProgressRef };
}
