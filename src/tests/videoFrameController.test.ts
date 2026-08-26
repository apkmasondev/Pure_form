import { describe, it, expect } from 'vitest';
import {
  calculateNextRenderedFrame,
  MAX_FRAME_DELTA_SECONDS,
  MAX_FRAME_RATE,
} from '../hooks/useVideoFrameController';

describe('video frame controller stepping', () => {
  it('preserves the original 2.25-frame step at 60 Hz', () => {
    const nextFrame = calculateNextRenderedFrame(10, 100, 1 / 60);
    expect(nextFrame).toBeCloseTo(12.25, 8);
  });

  it('uses the same frame velocity at 60 Hz and 120 Hz', () => {
    const at60Hz = calculateNextRenderedFrame(0, 100, 1 / 60);
    const first120Hz = calculateNextRenderedFrame(0, 100, 1 / 120);
    const second120Hz = calculateNextRenderedFrame(first120Hz, 100, 1 / 120);

    expect(second120Hz).toBeCloseTo(at60Hz, 8);
  });

  it('keeps very large scroll jumps on the smoothed path', () => {
    const nextFrame = calculateNextRenderedFrame(0, 456, 1 / 60);
    expect(nextFrame).toBeCloseTo(MAX_FRAME_RATE / 60, 8);
    expect(nextFrame).toBeLessThan(456);
  });

  it('limits backwards movement using the same velocity', () => {
    const nextFrame = calculateNextRenderedFrame(100, 10, 1 / 60);
    expect(nextFrame).toBeCloseTo(100 - MAX_FRAME_RATE / 60, 8);
  });

  it('caps long frame gaps so a stalled tab cannot teleport the video', () => {
    const nextFrame = calculateNextRenderedFrame(0, 456, 2);
    expect(nextFrame).toBe(MAX_FRAME_RATE * MAX_FRAME_DELTA_SECONDS);
  });

  it('moves directly to a nearby target and ignores negative deltas', () => {
    expect(calculateNextRenderedFrame(50, 51.5, 1 / 60)).toBe(51.5);
    expect(calculateNextRenderedFrame(50, 100, -1)).toBe(50);
  });
});
