import { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  STORY_COPIES,
  calculateCopyState,
  calculateIntroHeaderState,
  calculateFinalStageState,
  calculateProgressChapter,
} from '../lib/timeline';
import styles from './StoryCopy.module.css';

export interface StoryCopyRef {
  updateProgress: (progress: number) => void;
}

export const StoryCopy = forwardRef<StoryCopyRef, object>((_, ref) => {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const introHeaderRef = useRef<HTMLDivElement>(null);
  const finalStageRef = useRef<HTMLDivElement>(null);
  const counterCurrentRef = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    updateProgress: (progress: number) => {
      // Update luxury progress chapter counter (01 / 05)
      if (counterCurrentRef.current) {
        const { current } = calculateProgressChapter(progress);
        if (counterCurrentRef.current.textContent !== current) {
          counterCurrentRef.current.textContent = current;
        }
      }

      // Update initial luxury intro header (0.00 -> 0.045)
      if (introHeaderRef.current) {
        const { opacity, translateY } = calculateIntroHeaderState(progress);
        introHeaderRef.current.style.opacity = opacity.toFixed(4);
        introHeaderRef.current.style.setProperty('--ty', `${translateY.toFixed(2)}px`);
        introHeaderRef.current.style.visibility = opacity > 0.001 ? 'visible' : 'hidden';
      }

      // Update final packshot luxury specs & CTA stage (0.88 -> 1.00)
      if (finalStageRef.current) {
        const { opacity, translateY } = calculateFinalStageState(progress);
        finalStageRef.current.style.opacity = opacity.toFixed(4);
        finalStageRef.current.style.setProperty('--ty', `${translateY.toFixed(2)}px`);
        finalStageRef.current.style.visibility = opacity > 0.001 ? 'visible' : 'hidden';
      }

      // Update story copy text items
      STORY_COPIES.forEach((item) => {
        const el = itemRefs.current[item.id];
        if (!el) return;

        const { opacity, translateY } = calculateCopyState(item, progress);
        el.style.opacity = opacity.toFixed(4);
        el.style.setProperty('--ty', `${translateY.toFixed(2)}px`);
        el.style.visibility = opacity > 0.001 ? 'visible' : 'hidden';
      });
    },
  }));

  return (
    <div className={styles.overlayContainer} aria-live="polite">
      {/* Minimalist Luxury Progress Chapter Counter (01 / 05) */}
      <div className={styles.progressCounterWrapper} aria-label="Progress chapter">
        <span ref={counterCurrentRef} className={styles.counterCurrent}>
          01
        </span>
        <span className={styles.counterDivider}>/</span>
        <span className={styles.counterTotal}>05</span>
      </div>

      {/* Initial Luxury Intro Header (Progress 0.00 -> 0.045) */}
      <div
        ref={introHeaderRef}
        className={styles.introHeaderWrapper}
        style={{
          opacity: 1,
          visibility: 'visible',
        }}
      >
        <h1 className={styles.introTitle}>
          APKMASON<span className={styles.accentDot}>.</span>
        </h1>
        <p className={styles.introSubtitle}>PURE FORM</p>
        <div className={styles.introPrompt} aria-hidden="true">
          <span>EXPLORE</span>
          <div className={styles.introLine} />
        </div>
      </div>

      {/* Story Copy Sequence */}
      {STORY_COPIES.map((item) => {
        const posClass = styles[`pos_${item.positionDesktop.replace('-', '_')}`];

        return (
          <div
            key={item.id}
            ref={(node) => {
              itemRefs.current[item.id] = node;
            }}
            className={`${styles.textWrapper} ${posClass}`}
            style={{
              opacity: 0,
              visibility: 'hidden',
            }}
          >
            {item.isHeading ? (
              <h2 className={styles.brandTitle}>
                {item.text}
                <span className={styles.accentDot}>.</span>
              </h2>
            ) : (
              <p className={styles.subtitle}>
                {item.text}
                <span className={styles.accentDot}>.</span>
              </p>
            )}
          </div>
        );
      })}

      {/* Final Packshot Luxury Stage Overlay (Progress 0.88 -> 1.00) */}
      <div
        ref={finalStageRef}
        className={styles.finalStageContainer}
        style={{
          opacity: 0,
          visibility: 'hidden',
        }}
      >
        {/* Left Side: Olfactory Pyramid Specs */}
        <div className={styles.finalLeftPyramid}>
          <span className={styles.pyramidHeading}>OLFACTORY PYRAMID</span>
          <div className={styles.pyramidRow}>
            <span className={styles.noteLabel}>TOP</span>
            <span className={styles.noteValue}>Bergamot · Mineral Amber</span>
          </div>
          <div className={styles.pyramidRow}>
            <span className={styles.noteLabel}>HEART</span>
            <span className={styles.noteValue}>Pure Light Accord · Iris</span>
          </div>
          <div className={styles.pyramidRow}>
            <span className={styles.noteLabel}>BASE</span>
            <span className={styles.noteValue}>White Musk · Liquid Crystal</span>
          </div>
        </div>

        {/* Right Side: Luxury CTA & Volume Specs */}
        <div className={styles.finalRightCta}>
          <span className={styles.ctaCategory}>EXTRAIT DE PARFUM</span>
          <span className={styles.ctaVolume}>100 ML / 3.4 FL. OZ.</span>
          <button
            className={styles.ctaButton}
            type="button"
            onClick={() => {
              // Smooth scroll to top or interactive discovery feedback
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            DISCOVER THE SCENT
          </button>
        </div>
      </div>
    </div>
  );
});

StoryCopy.displayName = 'StoryCopy';
