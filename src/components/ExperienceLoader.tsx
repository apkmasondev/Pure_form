import React from 'react';
import { POSTER_MANIFEST } from '../lib/videoManifest';
import styles from './ExperienceLoader.module.css';

interface ExperienceLoaderProps {
  isLoading: boolean;
  progressPercent?: number;
}

export const ExperienceLoader: React.FC<ExperienceLoaderProps> = ({
  isLoading,
  progressPercent = 0,
}) => {
  return (
    <div
      className={`${styles.loaderOverlay} ${!isLoading ? styles.hidden : ''}`}
      aria-hidden={!isLoading}
    >
      <img
        src={POSTER_MANIFEST.intro}
        alt=""
        aria-hidden="true"
        className={styles.posterBg}
      />
      <div className={styles.content}>
        <h2 className={styles.brandName}>APKMASON</h2>
        <span className={styles.statusText}>PURE FORM</span>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressBar}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
