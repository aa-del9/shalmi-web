import { useEffect, useRef } from 'react';

/**
 * Runs an effect exactly once, even in React 18 Strict Mode.
 * Useful for initialization logic that should only happen once.
 */
export const useEffectOnce = (effect: () => void | (() => void)) => {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
