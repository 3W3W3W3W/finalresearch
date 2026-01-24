'use client';

import { useState, useEffect } from 'react';
import type { MousePosition } from './useMousePosition';

export type HoverZone = 'top' | 'bottom' | 'left' | 'right' | null;

function calculateZone(mousePosition: MousePosition): HoverZone {
  const { x, y } = mousePosition;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const topZoneHeight = vh * 0.25;
  const bottomZoneStart = vh * 0.75;
  const leftZoneWidth = vw * 0.25;
  const rightZoneStart = vw * 0.75;
  const verticalMiddleTop = vh * 0.25;
  const verticalMiddleBottom = vh * 0.75;

  if (y < topZoneHeight) {
    return 'top';
  }

  if (y >= bottomZoneStart) {
    return 'bottom';
  }

  const inVerticalMiddle = y >= verticalMiddleTop && y < verticalMiddleBottom;

  if (inVerticalMiddle) {
    if (x < leftZoneWidth) {
      return 'left';
    }

    if (x >= rightZoneStart) {
      return 'right';
    }

    if (y < vh * 0.5) {
      return 'top';
    } else {
      return 'bottom';
    }
  }

  return null;
}

export function useHoverZone(mousePosition: MousePosition): HoverZone {
  const [zone, setZone] = useState<HoverZone>(null);

  useEffect(() => {
    setZone(calculateZone(mousePosition));
  }, [mousePosition]);

  return zone;
}
