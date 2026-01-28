'use client';

import { useState, useEffect } from 'react';

export interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Initialize position to center of viewport on first render
    if (!hasInitialized) {
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setHasInitialized(true);
    }

    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        setPosition({ x: touch.clientX, y: touch.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [hasInitialized]);

  return position;
}
