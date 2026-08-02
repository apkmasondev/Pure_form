import { useEffect, useState } from 'react';

export function useStableViewport(): { viewportHeight: number; isMobile: boolean } {
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    let lastHeight = window.innerHeight;
    let lastWidth = window.innerWidth;

    const checkViewport = () => {
      const currentHeight = window.innerHeight;
      const currentWidth = window.innerWidth;
      const heightDelta = Math.abs(currentHeight - lastHeight);
      const widthChanged = currentWidth !== lastWidth;

      setIsMobile(currentWidth < 768);

      // Only update height on orientation change or large resize (not mobile URL bar toggle)
      if (widthChanged || heightDelta > 150) {
        lastHeight = currentHeight;
        lastWidth = currentWidth;
        setViewportHeight(currentHeight);
      }
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        setViewportHeight(window.innerHeight);
        setIsMobile(window.innerWidth < 768);
      }, 100);
    };

    window.addEventListener('resize', checkViewport, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return { viewportHeight, isMobile };
}
