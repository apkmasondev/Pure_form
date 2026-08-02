import { mapRange } from './mapRange';
import { VIDEO_MANIFEST } from './videoManifest';

export interface LayerState {
  opacity: number;
  targetTime: number;
  targetFrame: number;
}

export interface VideoTimelineState {
  layerA: LayerState;
  layerB: LayerState;
  layerC: LayerState;
}

export interface StoryCopyItem {
  id: string;
  text: string;
  start: number;
  end: number;
  positionDesktop: 'top-left' | 'bottom-right' | 'mid-left' | 'top-right' | 'bottom-left';
  positionMobile: 'top-center' | 'bottom-center';
  isHeading?: boolean;
}

export const STORY_COPIES: StoryCopyItem[] = [
  {
    id: 'formed-from-light',
    text: 'FORMED FROM LIGHT',
    start: 0.04,
    end: 0.17,
    positionDesktop: 'top-left',
    positionMobile: 'top-center',
  },
  {
    id: 'crafted-in-silence',
    text: 'CRAFTED IN SILENCE',
    start: 0.21,
    end: 0.38,
    positionDesktop: 'bottom-right',
    positionMobile: 'bottom-center',
  },
  {
    id: 'scent-of-precision',
    text: 'A SCENT OF PRECISION',
    start: 0.47,
    end: 0.63,
    positionDesktop: 'mid-left',
    positionMobile: 'top-center',
  },
  {
    id: 'apkmason',
    text: 'APKMASON',
    start: 0.67,
    end: 0.78,
    positionDesktop: 'top-right',
    positionMobile: 'top-center',
    isHeading: true,
  },
  {
    id: 'pure-form',
    text: 'PURE FORM',
    start: 0.79,
    end: 0.87,
    positionDesktop: 'bottom-left',
    positionMobile: 'bottom-center',
    isHeading: true,
  },
];

/**
 * Calculates current progress chapter index (1 to 5) for the luxury counter indicator.
 */
export function calculateProgressChapter(progress: number): { current: string; total: string } {
  const total = '05';
  let current = '01';

  if (progress < 0.20) {
    current = '01';
  } else if (progress < 0.44) {
    current = '02';
  } else if (progress < 0.66) {
    current = '03';
  } else if (progress < 0.88) {
    current = '04';
  } else {
    current = '05';
  }

  return { current, total };
}

/**
 * Calculates opacity and y-offset translation for the initial luxury intro header (progress 0.00 -> 0.045).
 */
export function calculateIntroHeaderState(progress: number): { opacity: number; translateY: number } {
  if (progress <= 0.0) {
    return { opacity: 1.0, translateY: 0 };
  }
  if (progress >= 0.045) {
    return { opacity: 0.0, translateY: -15 };
  }
  const opacity = mapRange(progress, 0.0, 0.045, 1.0, 0.0);
  const translateY = mapRange(progress, 0.0, 0.045, 0, -15);
  return { opacity, translateY };
}

/**
 * Calculates opacity and y-offset translation for the final packshot luxury specs & CTA stage (progress 0.88 -> 1.00).
 */
export function calculateFinalStageState(progress: number): { opacity: number; translateY: number } {
  if (progress < 0.88) {
    return { opacity: 0.0, translateY: 20 };
  }
  if (progress >= 0.94) {
    return { opacity: 1.0, translateY: 0 };
  }
  const opacity = mapRange(progress, 0.88, 0.94, 0.0, 1.0);
  const translateY = mapRange(progress, 0.88, 0.94, 20, 0);
  return { opacity, translateY };
}

/**
 * Calculates video target opacities, times, and frame indices for all 3 layers based on progress [0.0 - 1.0].
 */
export function calculateVideoStates(progress: number): VideoTimelineState {
  // Layer A
  let opacityA = 1.0;
  if (progress > 0.40 && progress < 0.50) {
    opacityA = mapRange(progress, 0.40, 0.50, 1.0, 0.0);
  } else if (progress >= 0.50) {
    opacityA = 0.0;
  }
  const targetTimeA = mapRange(progress, 0.00, 0.46, 0.0, VIDEO_MANIFEST.layerA.duration);
  const targetFrameA = targetTimeA * VIDEO_MANIFEST.layerA.fps;

  // Layer B
  let opacityB = 0.0;
  if (progress >= 0.40 && progress < 0.50) {
    opacityB = mapRange(progress, 0.40, 0.50, 0.0, 1.0);
  } else if (progress >= 0.50 && progress <= 0.84) {
    opacityB = 1.0;
  } else if (progress > 0.84 && progress < 0.91) {
    opacityB = mapRange(progress, 0.84, 0.91, 1.0, 0.0);
  }
  const targetTimeB = mapRange(progress, 0.42, 0.88, 0.0, VIDEO_MANIFEST.layerB.duration);
  const targetFrameB = targetTimeB * VIDEO_MANIFEST.layerB.fps;

  // Layer C
  let opacityC = 0.0;
  if (progress > 0.84 && progress < 0.91) {
    opacityC = mapRange(progress, 0.84, 0.91, 0.0, 1.0);
  } else if (progress >= 0.91) {
    opacityC = 1.0;
  }
  const targetTimeC = mapRange(progress, 0.84, 1.00, 0.0, VIDEO_MANIFEST.layerC.duration);
  const targetFrameC = targetTimeC * VIDEO_MANIFEST.layerC.fps;

  return {
    layerA: { opacity: opacityA, targetTime: targetTimeA, targetFrame: targetFrameA },
    layerB: { opacity: opacityB, targetTime: targetTimeB, targetFrame: targetFrameB },
    layerC: { opacity: opacityC, targetTime: targetTimeC, targetFrame: targetFrameC },
  };
}

/**
 * Calculates opacity and y-offset translation for story copy text items based on progress.
 */
export function calculateCopyState(
  item: StoryCopyItem,
  progress: number
): { opacity: number; translateY: number } {
  if (progress < item.start || progress > item.end) {
    return { opacity: 0, translateY: 15 };
  }

  const range = item.end - item.start;
  const fadeInWindow = range * 0.22;
  const fadeOutWindow = range * 0.22;

  const fadeInEnd = item.start + fadeInWindow;
  const fadeOutStart = item.end - fadeOutWindow;

  let opacity = 1.0;
  let translateY = 0;

  if (progress < fadeInEnd) {
    opacity = mapRange(progress, item.start, fadeInEnd, 0.0, 1.0);
    translateY = mapRange(progress, item.start, fadeInEnd, 15, 0);
  } else if (progress > fadeOutStart) {
    opacity = mapRange(progress, fadeOutStart, item.end, 1.0, 0.0);
    translateY = mapRange(progress, fadeOutStart, item.end, 0, -10);
  }

  return { opacity, translateY };
}
