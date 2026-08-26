import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from './MasterVideo.module.css';

export interface MasterVideoRef {
  videoElement: HTMLVideoElement | null;
}

interface MasterVideoProps {
  src: string;
  posterSrc: string;
  onSeeked?: () => void;
  onLoadedMetadata?: () => void;
  onError?: () => void;
}

export const MasterVideo = forwardRef<MasterVideoRef, MasterVideoProps>(
  ({ src, posterSrc, onSeeked, onLoadedMetadata, onError }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasError, setHasError] = useState(false);

    useImperativeHandle(ref, () => ({
      get videoElement() {
        return videoRef.current;
      },
    }));

    useEffect(() => {
      setHasError(false);
    }, [src]);

    const handleError = () => {
      setHasError(true);
      onError?.();
    };

    return (
      <div className={styles.masterContainer} aria-hidden="true">
        {!hasError ? (
          <video
            ref={videoRef}
            id="pure-form-master-video"
            src={src}
            poster={posterSrc}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            className={styles.masterElement}
            onSeeked={onSeeked}
            onLoadedMetadata={onLoadedMetadata}
            onError={handleError}
          />
        ) : (
          <img
            src={posterSrc}
            alt=""
            aria-hidden="true"
            className={styles.posterFallback}
          />
        )}
      </div>
    );
  }
);

MasterVideo.displayName = 'MasterVideo';
