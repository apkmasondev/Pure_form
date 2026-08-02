import { describe, it, expect } from 'vitest';
import { clamp } from '../lib/clamp';

describe('clamp utility', () => {
  it('clamps values below minimum to min', () => {
    expect(clamp(-0.5, 0, 1)).toBe(0);
  });

  it('clamps values above maximum to max', () => {
    expect(clamp(1.5, 0, 1)).toBe(1);
  });

  it('returns exact value within range', () => {
    expect(clamp(0.42, 0, 1)).toBe(0.42);
  });
});
