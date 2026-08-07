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
  onCtaClick?: () => void;
  onReady?: () => void;
}

const LAYER_IDS = ['a', 'b', 'c'] as const;
type LayerId = (typeof LAYER_IDS)[number];

export const PerfumeStage: React.FC<PerfumeStageProps> = ({
  targetProgressRef,
  isMobile,
  onCtaClick,
  onReady,
}) => {
  const layerARef = useRef<VideoLayerRef>(null);
  const layerBRef = useRef<VideoLayerRef>(null);
  const layerCRef = useRef<VideoLayerRef>(null);
  const storyCopyRef = useRef<StoryCopyRef>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const readyLayersRef = useRef<Set<LayerId>>(new Set());
  const [readyCount, setReadyCount] = useState<number>(0);
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);

  const isReady = readyCount >= LAYER_IDS.length || hasTimedOut;
  const isLoading = !isReady;

  const controllerA = useVideoFrameController();
  const controllerB = useVideoFrameController();
  const controllerC = useVideoFrameController();

  const srcA = isMobile ? VIDEO_MANIFEST.layerA.mobileSrc : VIDEO_MANIFEST.layerA.desktopSrc;
  const srcB = isMobile ? VIDEO_MANIFEST.layerB.mobileSrc : VIDEO_MANIFEST.layerB.desktopSrc;
  const srcC = isMobile ? VIDEO_MANIFEST.layerC.mobileSrc : VIDEO_MANIFEST.layerC.desktopSrc;

  const finalPoster = isMobile ? POSTER_MANIFEST.finalMobile : POSTER_MANIFEST.finalDesktop;

  // Tracked per layer (not as a bare counter) so a layer that both reports readyState
  // synchronously and later fires loadedmetadata cannot dismiss the loader early.
  const markLayerReady = useCallback((layerId: LayerId) => {
    if (readyLayersRef.current.has(layerId)) return;
    readyLayersRef.current.add(layerId);
    setReadyCount(readyLayersRef.current.size);
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

      // Odtwarzanie wideo: Na Mobile używamy natywnej akceleracji sprzętowej GPU (.play()), a na Desktopie scroll-scrubbing
      const videoA = layerARef.current?.videoElement;
      const videoB = layerBRef.current?.videoElement;
      const videoC = layerCRef.current?.videoElement;

      if (isMobile) {
        // Reset video layer positions to 0 when restarting mobile sequence from 0.0
        if (renderedProgress < 0.02) {
          if (videoA && videoA.currentTime > 0.1) videoA.currentTime = 0;
          if (videoB && videoB.currentTime > 0.1) {
            videoB.currentTime = 0;
            if (!videoB.paused) videoB.pause();
          }
          if (videoC && videoC.currentTime > 0.1) {
            videoC.currentTime = 0;
            if (!videoC.paused) videoC.pause();
          }
        }

        // Native hardware-accelerated video streaming on Mobile (0 seek lag)
        if (states.layerA.opacity > 0.001) {
          if (videoA && videoA.paused) videoA.play().catch(() => {});
        } else if (videoA && !videoA.paused) {
          videoA.pause();
        }

        if (states.layerB.opacity > 0.001) {
          if (videoB && videoB.paused) videoB.play().catch(() => {});
        } else if (videoB && !videoB.paused) {
          videoB.pause();
        }

        if (states.layerC.opacity > 0.001) {
          if (videoC && videoC.paused && (videoC.currentTime < (videoC.duration || 2.5) - 0.1)) {
            videoC.play().catch(() => {});
          }
        } else if (videoC && !videoC.paused) {
          videoC.pause();
        }
      } else {
        // Desktop mouse scroll scrubbing. Hidden layers are parked on their target frame
        // instead of being left untouched, so they never fade in on a frame left over from
        // a previous pass (scroll back to the top, "Discover the scent").
        if (states.layerA.opacity > 0.001) {
          controllerA.updateVideoFrame(videoA ?? null, states.layerA.targetFrame, VIDEO_MANIFEST.layerA.duration);
        } else {
          controllerA.syncToFrame(videoA ?? null, states.layerA.targetFrame, VIDEO_MANIFEST.layerA.duration);
        }
        if (states.layerB.opacity > 0.001) {
          controllerB.updateVideoFrame(videoB ?? null, states.layerB.targetFrame, VIDEO_MANIFEST.layerB.duration);
        } else {
          controllerB.syncToFrame(videoB ?? null, states.layerB.targetFrame, VIDEO_MANIFEST.layerB.duration);
        }
        if (states.layerC.opacity > 0.001) {
          controllerC.updateVideoFrame(videoC ?? null, states.layerC.targetFrame, VIDEO_MANIFEST.layerC.duration);
        } else {
          controllerC.syncToFrame(videoC ?? null, states.layerC.targetFrame, VIDEO_MANIFEST.layerC.duration);
        }
      }
    },
    [controllerA, controllerB, controllerC, isMobile]
  );

  useSmoothedProgress(targetProgressRef, handleFrameTick, true);

  // Initial readiness sweep and safety timeout.
  // No load() call here: it aborts the request the browser already started and resets
  // readyState to 0, which is exactly what the check below is trying to observe.
  useEffect(() => {
    const layers: Array<[LayerId, React.RefObject<VideoLayerRef>]> = [
      ['a', layerARef],
      ['b', layerBRef],
      ['c', layerCRef],
    ];

    // Metadata that arrived before React attached the handler never fires loadedmetadata
    layers.forEach(([id, layerRef]) => {
      if ((layerRef.current?.videoElement?.readyState ?? 0) >= 1) {
        markLayerReady(id);
      }
    });

    const timer = setTimeout(() => setHasTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [markLayerReady]);

  // Notify the parent once, so the mobile reel starts against loaded video
  useEffect(() => {
    if (isReady) onReady?.();
  }, [isReady, onReady]);

  // Mobile videos play natively, so a backgrounded tab would let them drift ahead of the
  // reel clock (which pauses). Park them while hidden; the frame tick resumes them.
  useEffect(() => {
    if (!isMobile) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) return;
      [
        layerARef.current?.videoElement,
        layerBRef.current?.videoElement,
        layerCRef.current?.videoElement,
      ].forEach((v) => {
        if (v && !v.paused) v.pause();
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isMobile]);

  return (
    <>
      <ExperienceLoader
        isLoading={isLoading}
        progressPercent={(readyCount / LAYER_IDS.length) * 100}
      />

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
          onLoadedMetadata={() => markLayerReady('a')}
          onError={() => markLayerReady('a')}
        />

        {/* Layer B */}
        <VideoLayer
          ref={layerBRef}
          id="video-layer-b"
          src={srcB}
          posterSrc={POSTER_MANIFEST.intro}
          initialOpacity={0.0}
          onSeeked={() => controllerB.handleSeeked(layerBRef.current?.videoElement ?? null)}
          onLoadedMetadata={() => markLayerReady('b')}
          onError={() => markLayerReady('b')}
        />

        {/* Layer C (Packshot) */}
        <VideoLayer
          ref={layerCRef}
          id="video-layer-c"
          src={srcC}
          posterSrc={finalPoster}
          initialOpacity={0.0}
          onSeeked={() => controllerC.handleSeeked(layerCRef.current?.videoElement ?? null)}
          onLoadedMetadata={() => markLayerReady('c')}
          onError={() => markLayerReady('c')}
          preload="auto"
        />

        {/* Story Overlay */}
        <StoryCopy ref={storyCopyRef} onCtaClick={onCtaClick} />

        {/* Subtle Luxury Scroll Progress Indicator */}
        <div className={styles.subtleProgressTrack} aria-hidden="true">
          <div ref={progressBarRef} className={styles.subtleProgressBar} />
        </div>
      </section>
    </>
  );
};
