import { describe, it, expect } from 'vitest';
import {
  calculateNextRenderedFrame,
  shouldSnapToTarget,
  MAX_FRAME_STEP,
  SNAP_FRAME_THRESHOLD,
} from '../hooks/useVideoFrameController';

describe('video frame controller stepping', () => {
  it('limits frame step to MAX_FRAME_STEP when target is far ahead', () => {
    const currentFrame = 10;
    const targetFrame = 100; // Large step from rapid scroll

    const nextFrame = calculateNextRenderedFrame(currentFrame, targetFrame);
    expect(nextFrame).toBe(currentFrame + MAX_FRAME_STEP);
  });

  it('limits backwards frame step to -MAX_FRAME_STEP when scrolling backwards fast', () => {
    const currentFrame = 100;
    const targetFrame = 10;

    const nextFrame = calculateNextRenderedFrame(currentFrame, targetFrame);
    expect(nextFrame).toBe(currentFrame - MAX_FRAME_STEP);
  });

  it('moves directly to target frame if difference is smaller than MAX_FRAME_STEP', () => {
    const currentFrame = 50;
    const targetFrame = 51.5;

    const nextFrame = calculateNextRenderedFrame(currentFrame, targetFrame);
    expect(nextFrame).toBe(targetFrame);
  });
});

describe('stale frame snapping', () => {
  it('steps through gaps a viewer would read as scrubbing', () => {
    expect(shouldSnapToTarget(50, 60)).toBe(false);
    expect(shouldSnapToTarget(100, 100 - SNAP_FRAME_THRESHOLD)).toBe(false);
  });

  it('snaps when a layer carries a stale frame from a previous pass', () => {
    // Layer B parked at its last frame, scrolled back to the start of its own range
    expect(shouldSnapToTarget(240, 0)).toBe(true);
    // Layer A still visible while the viewer jumps back to the top of the runway
    expect(shouldSnapToTarget(240, 12)).toBe(true);
  });
});
