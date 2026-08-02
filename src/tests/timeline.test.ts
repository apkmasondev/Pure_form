import { describe, it, expect } from 'vitest';
import {
  calculateVideoStates,
  calculateCopyState,
  calculateIntroHeaderState,
  calculateFinalStageState,
  calculateProgressChapter,
  STORY_COPIES,
} from '../lib/timeline';

describe('timeline calculations', () => {
  it('calculates progress chapter correctly from 0.00 to 1.00', () => {
    expect(calculateProgressChapter(0.00).current).toBe('01');
    expect(calculateProgressChapter(0.15).current).toBe('01');
    expect(calculateProgressChapter(0.30).current).toBe('02');
    expect(calculateProgressChapter(0.55).current).toBe('03');
    expect(calculateProgressChapter(0.75).current).toBe('04');
    expect(calculateProgressChapter(0.95).current).toBe('05');
  });

  it('calculates intro header state correctly from 0.00 to 0.045', () => {
    // At start (0.00): opacity = 1.0, translateY = 0
    const start = calculateIntroHeaderState(0.00);
    expect(start.opacity).toBe(1.0);
    expect(start.translateY).toBe(0);

    // Mid fade (0.0225): opacity = ~0.5
    const mid = calculateIntroHeaderState(0.0225);
    expect(mid.opacity).toBeCloseTo(0.5, 2);

    // After fade (0.05): opacity = 0.0
    const end = calculateIntroHeaderState(0.05);
    expect(end.opacity).toBe(0.0);
  });

  it('calculates final stage state correctly from 0.88 to 1.00', () => {
    // Before final stage (0.80): opacity = 0.0
    const start = calculateFinalStageState(0.80);
    expect(start.opacity).toBe(0.0);

    // Fade-in phase (0.91): opacity = ~0.5
    const mid = calculateFinalStageState(0.91);
    expect(mid.opacity).toBeCloseTo(0.5, 2);

    // Solid final state (0.95 -> 1.00): opacity = 1.0
    const solid = calculateFinalStageState(1.00);
    expect(solid.opacity).toBe(1.0);
    expect(solid.translateY).toBe(0);
  });

  it('calculates layer opacities correctly across progress ranges', () => {
    const start = calculateVideoStates(0.00);
    expect(start.layerA.opacity).toBe(1.0);
    expect(start.layerB.opacity).toBe(0.0);
    expect(start.layerC.opacity).toBe(0.0);

    const crossfadeAB = calculateVideoStates(0.45);
    expect(crossfadeAB.layerA.opacity).toBeCloseTo(0.5, 2);
    expect(crossfadeAB.layerB.opacity).toBeCloseTo(0.5, 2);
    expect(crossfadeAB.layerC.opacity).toBe(0.0);

    const midB = calculateVideoStates(0.70);
    expect(midB.layerA.opacity).toBe(0.0);
    expect(midB.layerB.opacity).toBe(1.0);
    expect(midB.layerC.opacity).toBe(0.0);

    const crossfadeBC = calculateVideoStates(0.875);
    expect(crossfadeBC.layerB.opacity).toBeCloseTo(0.5, 2);
    expect(crossfadeBC.layerC.opacity).toBeCloseTo(0.5, 2);

    const end = calculateVideoStates(1.00);
    expect(end.layerA.opacity).toBe(0.0);
    expect(end.layerB.opacity).toBe(0.0);
    expect(end.layerC.opacity).toBe(1.0);
  });

  it('calculates story copy entrance and exit opacities', () => {
    const item = STORY_COPIES[0];

    expect(calculateCopyState(item, 0.01).opacity).toBe(0);

    const midFadeIn = calculateCopyState(item, 0.05);
    expect(midFadeIn.opacity).toBeGreaterThan(0);
    expect(midFadeIn.opacity).toBeLessThan(1);

    const solid = calculateCopyState(item, 0.10);
    expect(solid.opacity).toBe(1.0);

    const midFadeOut = calculateCopyState(item, 0.16);
    expect(midFadeOut.opacity).toBeGreaterThan(0);
    expect(midFadeOut.opacity).toBeLessThan(1);

    expect(calculateCopyState(item, 0.20).opacity).toBe(0);
  });
});
