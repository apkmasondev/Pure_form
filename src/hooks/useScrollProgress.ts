import { useEffect, useRef, useCallback } from 'react';
import { clamp } from '../lib/clamp';

export function useScrollProgress(containerRef: React.RefObject<HTMLElement | null>) {
  const targetProgressRef = useRef<number>(0);

  const updateTargetProgress = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const totalScrollableHeight = rect.height - viewportHeight;

    if (totalScrollableHeight <= 0) {
      targetProgressRef.current = 0;
      return;
    }

    // rect.top is negative when scrolled down
    const scrolledPx = -rect.top;
    const progress = clamp(scrolledPx / totalScrollableHeight, 0, 1);
    targetProgressRef.current = progress;
  }, [containerRef]);

  useEffect(() => {
    updateTargetProgress();

    const handleScroll = () => {
      updateTargetProgress();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [updateTargetProgress]);

  return { targetProgressRef };
}
