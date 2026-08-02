import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import styles from './VideoLayer.module.css';

export interface VideoLayerRef {
  videoElement: HTMLVideoElement | null;
  setOpacity: (opacity: number) => void;
}

interface VideoLayerProps {
  id: string;
  src: string;
  posterSrc?: string;
  initialOpacity?: number;
  onSeeked?: () => void;
  onLoadedMetadata?: () => void;
  onError?: () => void;
  preload?: 'auto' | 'metadata' | 'none';
}

export const VideoLayer = forwardRef<VideoLayerRef, VideoLayerProps>(
  (
    {
      id,
      src,
      posterSrc,
      initialOpacity = 0,
      onSeeked,
      onLoadedMetadata,
      onError,
      preload = 'auto',
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasError, setHasError] = useState(false);

    useImperativeHandle(ref, () => ({
      get videoElement() {
        return videoRef.current;
      },
      setOpacity: (opacity: number) => {
        if (containerRef.current) {
          const clamped = Math.max(0, Math.min(1, opacity));
          containerRef.current.style.opacity = clamped.toFixed(4);
          containerRef.current.style.visibility = clamped > 0.001 ? 'visible' : 'hidden';
        }
      },
    }));

    const handleError = () => {
      setHasError(true);
      if (onError) onError();
    };

    return (
      <div
        ref={containerRef}
        className={styles.videoContainer}
        style={{
          opacity: initialOpacity,
          visibility: initialOpacity > 0.001 ? 'visible' : 'hidden',
        }}
        aria-hidden="true"
      >
        {!hasError ? (
          <video
            ref={videoRef}
            id={id}
            src={src}
            poster={posterSrc}
            muted
            playsInline
            preload={preload}
            aria-hidden="true"
            tabIndex={-1}
            className={styles.videoElement}
            onSeeked={onSeeked}
            onLoadedMetadata={onLoadedMetadata}
            onError={handleError}
          />
        ) : (
          posterSrc && (
            <img
              src={posterSrc}
              alt=""
              aria-hidden="true"
              className={styles.posterFallback}
            />
          )
        )}
      </div>
    );
  }
);

VideoLayer.displayName = 'VideoLayer';
