import { describe, it, expect } from 'vitest';
import { mapRange } from '../lib/mapRange';

describe('mapRange utility', () => {
  it('maps linearly between input range and output range', () => {
    expect(mapRange(0.5, 0, 1, 0, 100)).toBe(50);
  });

  it('clamps output by default when value exceeds input range', () => {
    expect(mapRange(1.2, 0, 1, 0, 100)).toBe(100);
    expect(mapRange(-0.2, 0, 1, 0, 100)).toBe(0);
  });

  it('supports unclamped output when requested', () => {
    expect(mapRange(1.5, 0, 1, 0, 100, false)).toBe(150);
  });
});
