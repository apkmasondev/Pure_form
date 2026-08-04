import { useRef, useCallback } from 'react';
import { clamp } from '../lib/clamp';
import { VIDEO_FPS } from '../lib/videoManifest';

export const MAX_FRAME_STEP = 2.25;
export const MIN_FRAME_DIFFERENCE = 0.35;

/**
 * Calculates clamped frame stepping to avoid frame teleportation on rapid scroll.
 */
export function calculateNextRenderedFrame(
  currentRenderedFrame: number,
  targetFrame: number,
  maxStep: number = MAX_FRAME_STEP
): number {
  const diff = targetFrame - currentRenderedFrame;
  const step = clamp(diff, -maxStep, maxStep);
  return currentRenderedFrame + step;
}

export function useVideoFrameController() {
  const renderedFrameRef = useRef<number>(0);
  const lastAppliedTimeRef = useRef<number>(-1);
  const pendingTimeRef = useRef<number | null>(null);

  const updateVideoFrame = useCallback(
    (videoEl: HTMLVideoElement | null, targetFrame: number, maxDuration: number) => {
      if (!videoEl || videoEl.readyState < 1) return;

      const currentRendered = renderedFrameRef.current;
      const nextRendered = calculateNextRenderedFrame(currentRendered, targetFrame);
      renderedFrameRef.current = nextRendered;

      const targetTime = clamp(nextRendered / VIDEO_FPS, 0, maxDuration);

      // Skip redundant seeks if difference is below threshold
      const timeDiff = Math.abs(targetTime - lastAppliedTimeRef.current);
      if (timeDiff < MIN_FRAME_DIFFERENCE / VIDEO_FPS) {
        return;
      }

      // Defer and keep pendingTimeRef strictly updated to the freshest target frame if currently seeking
      if (videoEl.seeking) {
        pendingTimeRef.current = targetTime;
        return;
      }

      try {
        videoEl.currentTime = targetTime;
        lastAppliedTimeRef.current = targetTime;
        pendingTimeRef.current = null;
      } catch (err) {
        // Seeking interrupted by rapid scroll — non-critical, log for debugging
        if (import.meta.env.DEV) console.debug('Video seek interrupted:', err);
      }
    },
    []
  );

  const handleSeeked = useCallback((videoEl: HTMLVideoElement | null) => {
    if (!videoEl || pendingTimeRef.current === null) return;

    const timeToApply = pendingTimeRef.current;
    pendingTimeRef.current = null;

    // Check if pending target frame actually differs sufficiently from last applied time to avoid race condition jitter
    const timeDiff = Math.abs(timeToApply - lastAppliedTimeRef.current);
    if (timeDiff >= MIN_FRAME_DIFFERENCE / VIDEO_FPS) {
      try {
        videoEl.currentTime = timeToApply;
        lastAppliedTimeRef.current = timeToApply;
      } catch (err) {
        if (import.meta.env.DEV) console.debug('Pending video seek failed:', err);
      }
    }
  }, []);

  return { updateVideoFrame, handleSeeked, renderedFrameRef };
}
