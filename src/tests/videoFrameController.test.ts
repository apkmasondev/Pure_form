import { describe, it, expect } from 'vitest';
import { calculateNextRenderedFrame, MAX_FRAME_STEP } from '../hooks/useVideoFrameController';

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
