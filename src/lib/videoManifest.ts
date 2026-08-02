export interface VideoManifestItem {
  id: 'layerA' | 'layerB' | 'layerC';
  desktopSrc: string;
  mobileSrc: string;
  duration: number; // in seconds
  fps: number;
  totalFrames: number;
}

export interface PosterManifest {
  intro: string;
  finalDesktop: string;
  finalMobile: string;
}

export const VIDEO_FPS = 24;

export const VIDEO_MANIFEST: Record<'layerA' | 'layerB' | 'layerC', VideoManifestItem> = {
  layerA: {
    id: 'layerA',
    desktopSrc: './assets/video/desktop/01-formed-from-light-gop1-1080p.mp4',
    mobileSrc: './assets/video/mobile/01-formed-from-light-gop1-720x1280.mp4',
    duration: 10.0,
    fps: VIDEO_FPS,
    totalFrames: 240,
  },
  layerB: {
    id: 'layerB',
    desktopSrc: './assets/video/desktop/02-pure-form-reveal-gop1-1080p.mp4',
    mobileSrc: './assets/video/mobile/02-pure-form-reveal-gop1-720x1280.mp4',
    duration: 10.0,
    fps: VIDEO_FPS,
    totalFrames: 240,
  },
  layerC: {
    id: 'layerC',
    desktopSrc: './assets/video/desktop/03-final-packshot-gop1-1080p.mp4',
    mobileSrc: './assets/video/mobile/03-final-packshot-gop1-720x1280.mp4',
    duration: 2.5,
    fps: VIDEO_FPS,
    totalFrames: 60,
  },
};

export const POSTER_MANIFEST: PosterManifest = {
  intro: './assets/posters/intro.webp',
  finalDesktop: './assets/posters/final.webp',
  finalMobile: './assets/posters/final-mobile.webp',
};
