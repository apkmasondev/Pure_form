import { useEffect, useRef, useState } from 'react';
import styles from './AudioToggle.module.css';

export const AudioToggle = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  const clearFade = () => {
    if (fadeIntervalRef.current !== null) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const fadeIn = (audio: HTMLAudioElement, targetVolume = 0.35) => {
    clearFade();
    audio.volume = 0;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          const step = targetVolume / 15;
          fadeIntervalRef.current = window.setInterval(() => {
            if (audio.volume + step >= targetVolume) {
              audio.volume = targetVolume;
              clearFade();
            } else {
              audio.volume += step;
            }
          }, 50);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  const fadeOut = (audio: HTMLAudioElement) => {
    clearFade();
    const step = audio.volume / 10;
    fadeIntervalRef.current = window.setInterval(() => {
      if (audio.volume - step <= 0.01) {
        audio.volume = 0;
        audio.pause();
        setIsPlaying(false);
        clearFade();
      } else {
        audio.volume -= step;
      }
    }, 40);
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      fadeOut(audio);
    } else {
      fadeIn(audio);
    }
  };

  useEffect(() => {
    return () => {
      clearFade();
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} loop preload="none">
        <source src="./assets/audio/ambiance.webm" type="audio/webm" />
        <source src="./assets/audio/ambiance.mp3" type="audio/mpeg" />
      </audio>

      <button
        type="button"
        className={styles.audioButton}
        onClick={toggleAudio}
        aria-label={isPlaying ? 'Mute ambient sound' : 'Unmute ambient sound'}
      >
        <div className={styles.iconWrapper} aria-hidden="true">
          {isPlaying ? (
            <svg
              className={`${styles.iconSvg} ${styles.iconSvgActive}`}
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" className={styles.wave1} />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" className={styles.wave2} />
            </svg>
          ) : (
            <svg
              className={`${styles.iconSvg} ${styles.iconSvgMuted}`}
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path d="M11 5L6 9H2v6h4l5 4V5z" fill="none" stroke="currentColor" />
              <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" />
              <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" />
            </svg>
          )}
        </div>
      </button>
    </>
  );
};
