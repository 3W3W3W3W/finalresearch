'use client';

import { useState, useEffect } from 'react';
import type { MousePosition } from './useMousePosition';

export type HoverZone = 'top' | 'bottom' | 'left' | 'right' | null;

export function useHoverZone(mousePosition: MousePosition): HoverZone {
  const [zone, setZone] = useState<HoverZone>(null);

  useEffect(() => {
    const { x, y } = mousePosition;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Zone boundaries:
    // Top zone: full width × 25% height from top
    // Bottom zone: full width × 25% height from bottom
    // Left zone: square (50% vh × 50% vh) vertically centered
    // Right zone: square (50% vh × 50% vh) vertically centered
    // Center (not in left/right squares) splits to top/bottom

    const topZoneHeight = vh * 0.25;
    const bottomZoneStart = vh * 0.75;
    const squareSize = vh * 0.5;
    const squareTop = vh * 0.25;
    const squareBottom = vh * 0.75;

    // Check if in top zone (top 25%)
    if (y < topZoneHeight) {
      setZone('top');
      return;
    }

    // Check if in bottom zone (bottom 25%)
    if (y >= bottomZoneStart) {
      setZone('bottom');
      return;
    }

    // Middle 50% of screen - check for left/right squares
    const inVerticalMiddle = y >= squareTop && y < squareBottom;

    if (inVerticalMiddle) {
      // Left square zone: from left edge, width = 50% of viewport height
      if (x < squareSize) {
        setZone('left');
        return;
      }

      // Right square zone: from right edge, width = 50% of viewport height
      if (x >= vw - squareSize) {
        setZone('right');
        return;
      }

      // Center area - split between top and bottom based on vertical position
      if (y < vh * 0.5) {
        setZone('top');
      } else {
        setZone('bottom');
      }
    }
  }, [mousePosition]);

  return zone;
}
