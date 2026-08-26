import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MASTER_VIDEO, POSTER_MANIFEST } from '../lib/videoManifest';
import { useSmoothedProgress } from '../hooks/useSmoothedProgress';
import { useVideoFrameController } from '../hooks/useVideoFrameController';
import { MasterVideo, MasterVideoRef } from './MasterVideo';
import { StoryCopy, StoryCopyRef } from './StoryCopy';
import { AudioToggle } from './AudioToggle';
import { ExperienceLoader } from './ExperienceLoader';
import styles from './PerfumeStage.module.css';

interface PerfumeStageProps {
  targetProgressRef: React.RefObject<number>;
  isMobile: boolean;
  replayKey?: number;
  onCtaClick?: () => void;
  onReady?: () => void;
}

export const PerfumeStage: React.FC<PerfumeStageProps> = ({
  targetProgressRef,
  isMobile,
  replayKey = 0,
  onCtaClick,
  onReady,
}) => {
  const masterVideoRef = useRef<MasterVideoRef>(null);
  const storyCopyRef = useRef<StoryCopyRef>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const controller = useVideoFrameController();

  const src = isMobile ? MASTER_VIDEO.mobileSrc : MASTER_VIDEO.desktopSrc;
  const markReady = useCallback(() => setIsReady(true), []);

  const handleFrameTick = useCallback(
    (renderedProgress: number, deltaSeconds: number) => {
      storyCopyRef.current?.updateProgress(renderedProgress);

      if (progressBarRef.current) {
        progressBarRef.current.style.height = `${(renderedProgress * 100).toFixed(2)}%`;
      }

      const video = masterVideoRef.current?.videoElement;
      if (isMobile) {
        // Mobile uses one native, hardware-decoded stream. The video's own final frame
        // remains visible after it ends; replay is reset once in the effect below.
        if (
          video &&
          video.readyState >= 1 &&
          video.paused &&
          !video.ended &&
          video.currentTime < MASTER_VIDEO.duration - 0.05
        ) {
          void video.play().catch(() => {});
        }
        return;
      }

      controller.updateVideoFrame(
        video ?? null,
        renderedProgress * MASTER_VIDEO.totalFrames,
        MASTER_VIDEO.duration,
        deltaSeconds
      );
    },
    [controller, isMobile]
  );

  useSmoothedProgress(targetProgressRef, handleFrameTick, true);

  // Reset readiness for the selected responsive source and handle metadata that may have
  // arrived before React attached the event handler.
  useEffect(() => {
    setIsReady(false);
    if ((masterVideoRef.current?.videoElement?.readyState ?? 0) >= 1) {
      setIsReady(true);
    }

    const timer = setTimeout(() => setIsReady(true), 8000);
    return () => clearTimeout(timer);
  }, [src]);

  useEffect(() => {
    if (isReady) onReady?.();
  }, [isReady, onReady]);

  // Reset exactly once per mobile replay. The old progress-threshold reset repeatedly
  // sought to zero during the opening frames and made the start feel sticky.
  useEffect(() => {
    if (!isMobile || !isReady) return;
    const video = masterVideoRef.current?.videoElement;
    if (!video) return;

    video.pause();
    video.currentTime = 0;
    void video.play().catch(() => {});
  }, [isMobile, isReady, replayKey, src]);

  useEffect(() => {
    if (!isMobile) return;

    const handleVisibilityChange = () => {
      const video = masterVideoRef.current?.videoElement;
      if (document.hidden && video && !video.paused) video.pause();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isMobile]);

  return (
    <>
      <ExperienceLoader isLoading={!isReady} progressPercent={isReady ? 100 : 0} />

      <section className={styles.stageContainer} aria-label="APKMASON Pure Form Stage">
        <AudioToggle />

        <MasterVideo
          ref={masterVideoRef}
          src={src}
          posterSrc={POSTER_MANIFEST.intro}
          onSeeked={() => controller.handleSeeked(masterVideoRef.current?.videoElement ?? null)}
          onLoadedMetadata={markReady}
          onError={markReady}
        />

        <StoryCopy ref={storyCopyRef} onCtaClick={onCtaClick} />

        <div className={styles.subtleProgressTrack} aria-hidden="true">
          <div ref={progressBarRef} className={styles.subtleProgressBar} />
        </div>
      </section>
    </>
  );
};
