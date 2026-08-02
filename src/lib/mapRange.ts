import { clamp } from './clamp';

/**
 * Maps a number from one range to another.
 * Option to clamp the output to outMin and outMax.
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  shouldClamp: boolean = true
): number {
  if (inMin === inMax) return outMin;
  const progress = (value - inMin) / (inMax - inMin);
  const result = outMin + progress * (outMax - outMin);
  if (!shouldClamp) return result;
  
  const minBound = Math.min(outMin, outMax);
  const maxBound = Math.max(outMin, outMax);
  return clamp(result, minBound, maxBound);
}
