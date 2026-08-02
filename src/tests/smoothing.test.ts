import { describe, it, expect } from 'vitest';
import { calculateSmoothedProgress } from '../hooks/useSmoothedProgress';

describe('exponential smoothing calculations', () => {
  it('smoothly moves rendered progress toward target progress', () => {
    const current = 0.0;
    const target = 1.0;
    const dt60hz = 1 / 60; // 0.0166s

    const step1 = calculateSmoothedProgress(current, target, dt60hz);
    expect(step1).toBeGreaterThan(current);
    expect(step1).toBeLessThan(target);
  });

  it('behaves consistently regardless of frame delta dt', () => {
    const current = 0.0;
    const target = 1.0;

    // Simulate 2 frames at 120Hz (dt = 1/120s each) vs 1 frame at 60Hz (dt = 1/60s)
    const dt120hz = 1 / 120;
    const step120_1 = calculateSmoothedProgress(current, target, dt120hz);
    const step120_2 = calculateSmoothedProgress(step120_1, target, dt120hz);

    const dt60hz = 1 / 60;
    const step60 = calculateSmoothedProgress(current, target, dt60hz);

    // Math exp property guarantees step120_2 === step60
    expect(step120_2).toBeCloseTo(step60, 5);
  });
});
