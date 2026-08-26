export interface VideoManifestItem {
  id: 'master';
  desktopSrc: string;
  mobileSrc: string;
  duration: number; // in seconds
  fps: number;
  totalFrames: number;
  gop: number;
}

export interface PosterManifest {
  intro: string;
  finalDesktop: string;
  finalMobile: string;
}

export const VIDEO_FPS = 24;

export const MASTER_VIDEO: VideoManifestItem = {
  id: 'master',
  desktopSrc: './assets/video/desktop/pure-form-master-gop6-1080p.mp4',
  mobileSrc: './assets/video/mobile/pure-form-master-gop6-720x1280.mp4',
  duration: 19.0,
  fps: VIDEO_FPS,
  totalFrames: 456,
  gop: 6,
};

export const POSTER_MANIFEST: PosterManifest = {
  intro: './assets/posters/intro.webp',
  finalDesktop: './assets/posters/final.webp',
  finalMobile: './assets/posters/final-mobile.webp',
};
