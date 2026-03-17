import { useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

type ViewportSize = {
  width: number;
  height: number;
  ready: boolean;
};

export function useEffectiveViewport(): ViewportSize {
  const { width, height } = useWindowDimensions();
  const [viewport, setViewport] = useState<ViewportSize>({ width, height, ready: Platform.OS !== 'web' });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      setViewport({ width, height, ready: true });
      return;
    }

    const readViewport = () => {
      const visualViewport = window.visualViewport;

      setViewport({
        width: visualViewport?.width ?? window.innerWidth,
        height: visualViewport?.height ?? window.innerHeight,
        ready: true,
      });
    };

    readViewport();

    window.addEventListener('resize', readViewport);
    window.visualViewport?.addEventListener('resize', readViewport);
    window.visualViewport?.addEventListener('scroll', readViewport);

    return () => {
      window.removeEventListener('resize', readViewport);
      window.visualViewport?.removeEventListener('resize', readViewport);
      window.visualViewport?.removeEventListener('scroll', readViewport);
    };
  }, [width, height]);

  return Platform.OS === 'web' ? viewport : { width, height, ready: true };
}
