import React, { useRef, useState, useCallback, useEffect } from 'react';
import { VIDEO_MANIFEST, POSTER_MANIFEST } from '../lib/videoManifest';
import { calculateVideoStates } from '../lib/timeline';
import { useSmoothedProgress } from '../hooks/useSmoothedProgress';
import { useVideoFrameController } from '../hooks/useVideoFrameController';
import { VideoLayer, VideoLayerRef } from './VideoLayer';
import { StoryCopy, StoryCopyRef } from './StoryCopy';
import { AudioToggle } from './AudioToggle';
import { ExperienceLoader } from './ExperienceLoader';
import styles from './PerfumeStage.module.css';

interface PerfumeStageProps {
  targetProgressRef: React.RefObject<number>;
  isMobile: boolean;
}

export const PerfumeStage: React.FC<PerfumeStageProps> = ({
  targetProgressRef,
  isMobile,
}) => {
  const layerARef = useRef<VideoLayerRef>(null);
  const layerBRef = useRef<VideoLayerRef>(null);
  const layerCRef = useRef<VideoLayerRef>(null);
  const storyCopyRef = useRef<StoryCopyRef>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadedCount, setLoadedCount] = useState<number>(0);

  const controllerA = useVideoFrameController();
  const controllerB = useVideoFrameController();
  const controllerC = useVideoFrameController();

  const srcA = isMobile ? VIDEO_MANIFEST.layerA.mobileSrc : VIDEO_MANIFEST.layerA.desktopSrc;
  const srcB = isMobile ? VIDEO_MANIFEST.layerB.mobileSrc : VIDEO_MANIFEST.layerB.desktopSrc;
  const srcC = isMobile ? VIDEO_MANIFEST.layerC.mobileSrc : VIDEO_MANIFEST.layerC.desktopSrc;

  const finalPoster = isMobile ? POSTER_MANIFEST.finalMobile : POSTER_MANIFEST.finalDesktop;

  const handleMetadataLoaded = useCallback(() => {
    setLoadedCount((prev) => {
      const next = prev + 1;
      if (next >= 2) {
        setIsLoading(false);
      }
      return next;
    });
  }, []);

  const handleFrameTick = useCallback(
    (renderedProgress: number) => {
      const states = calculateVideoStates(renderedProgress);

      // Update layer opacities via direct DOM refs
      layerARef.current?.setOpacity(states.layerA.opacity);
      layerBRef.current?.setOpacity(states.layerB.opacity);
      layerCRef.current?.setOpacity(states.layerC.opacity);

      // Update story copy text elements via direct DOM refs
      storyCopyRef.current?.updateProgress(renderedProgress);

      // Update subtle progress bar height
      if (progressBarRef.current) {
        progressBarRef.current.style.height = `${(renderedProgress * 100).toFixed(2)}%`;
      }

      // Scrub videos only when layer is visible or active
      const videoA = layerARef.current?.videoElement;
      const videoB = layerBRef.current?.videoElement;
      const videoC = layerCRef.current?.videoElement;

      if (states.layerA.opacity > 0.001) {
        controllerA.updateVideoFrame(videoA ?? null, states.layerA.targetFrame, VIDEO_MANIFEST.layerA.duration);
      }
      if (states.layerB.opacity > 0.001) {
        controllerB.updateVideoFrame(videoB ?? null, states.layerB.targetFrame, VIDEO_MANIFEST.layerB.duration);
      }
      if (states.layerC.opacity > 0.001) {
        controllerC.updateVideoFrame(videoC ?? null, states.layerC.targetFrame, VIDEO_MANIFEST.layerC.duration);
      }
    },
    [controllerA, controllerB, controllerC]
  );

  useSmoothedProgress(targetProgressRef, handleFrameTick, true);

  // Initial video preparation and safety timeout
  useEffect(() => {
    const videos = [
      layerARef.current?.videoElement,
      layerBRef.current?.videoElement,
      layerCRef.current?.videoElement,
    ];
    videos.forEach((v) => {
      if (v) {
        v.load();
        if (v.readyState >= 1) {
          handleMetadataLoaded();
        }
      }
    });

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [srcA, srcB, srcC, handleMetadataLoaded]);

  return (
    <>
      <ExperienceLoader isLoading={isLoading} progressPercent={(loadedCount / 2) * 100} />

      <section className={styles.stageContainer} aria-label="APKMASON Pure Form Stage">
        {/* Luxury Ambiance Audio Toggle Button */}
        <AudioToggle />

        {/* Layer A */}
        <VideoLayer
          ref={layerARef}
          id="video-layer-a"
          src={srcA}
          posterSrc={POSTER_MANIFEST.intro}
          initialOpacity={1.0}
          onSeeked={() => controllerA.handleSeeked(layerARef.current?.videoElement ?? null)}
          onLoadedMetadata={handleMetadataLoaded}
        />

        {/* Layer B */}
        <VideoLayer
          ref={layerBRef}
          id="video-layer-b"
          src={srcB}
          posterSrc={POSTER_MANIFEST.intro}
          initialOpacity={0.0}
          onSeeked={() => controllerB.handleSeeked(layerBRef.current?.videoElement ?? null)}
          onLoadedMetadata={handleMetadataLoaded}
        />

        {/* Layer C (Packshot) */}
        <VideoLayer
          ref={layerCRef}
          id="video-layer-c"
          src={srcC}
          posterSrc={finalPoster}
          initialOpacity={0.0}
          onSeeked={() => controllerC.handleSeeked(layerCRef.current?.videoElement ?? null)}
          onLoadedMetadata={handleMetadataLoaded}
          preload="auto"
        />

        {/* Story Overlay */}
        <StoryCopy ref={storyCopyRef} />

        {/* Subtle Luxury Scroll Progress Indicator */}
        <div className={styles.subtleProgressTrack} aria-hidden="true">
          <div ref={progressBarRef} className={styles.subtleProgressBar} />
        </div>
      </section>
    </>
  );
};
