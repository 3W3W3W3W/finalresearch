'use client';

import { useEffect, useState, useRef } from 'react';

export function useIdleDetection(timeoutMs: number = 10000): boolean {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const resetTimer = () => {
      setIsIdle(false);
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, timeoutMs);
    };

    if (typeof window !== 'undefined') {
      const events = ['mousedown', 'touchstart', 'keydown', 'scroll', 'mousemove'];
      events.forEach((e) => window.addEventListener(e, resetTimer));

      resetTimer();

      return () => {
        events.forEach((e) => window.removeEventListener(e, resetTimer));
        clearTimeout(timeoutRef.current);
      };
    }
  }, [timeoutMs]);

  return isIdle;
}
