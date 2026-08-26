import { describe, expect, it } from 'vitest';
import { MASTER_VIDEO, VIDEO_FPS } from '../lib/videoManifest';

describe('master video manifest', () => {
  it('keeps duration, frame count, and fps consistent', () => {
    expect(MASTER_VIDEO.totalFrames).toBe(MASTER_VIDEO.duration * VIDEO_FPS);
  });

  it('uses short-GOP responsive masters', () => {
    expect(MASTER_VIDEO.gop).toBe(6);
    expect(MASTER_VIDEO.desktopSrc).toContain('master-gop6');
    expect(MASTER_VIDEO.mobileSrc).toContain('master-gop6');
  });
});
