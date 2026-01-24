'use client';

import { useEffect, useState } from 'react';

interface CornerLinesProps {
  textBlockRect: DOMRect | null;
  cursorPoint: { x: number; y: number } | null;
  isVisible: boolean;
}

export function CornerLines({ textBlockRect, cursorPoint, isVisible }: CornerLinesProps) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  if (!isVisible || viewport.width === 0) return null;
  if (!textBlockRect && !cursorPoint) return null;

  const screenCorners = [
    { x: 0, y: 0 },
    { x: viewport.width, y: 0 },
    { x: 0, y: viewport.height },
    { x: viewport.width, y: viewport.height },
  ];

  // If we have a text block rect, use its corners; otherwise use cursor point for all corners
  const blockCorners = textBlockRect
    ? [
        { x: textBlockRect.left, y: textBlockRect.top },
        { x: textBlockRect.right, y: textBlockRect.top },
        { x: textBlockRect.left, y: textBlockRect.bottom },
        { x: textBlockRect.right, y: textBlockRect.bottom },
      ]
    : [cursorPoint!, cursorPoint!, cursorPoint!, cursorPoint!];

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
      aria-hidden="true"
      viewBox={`0 0 ${viewport.width} ${viewport.height}`}
      preserveAspectRatio="none"
      style={{
        overflow: 'visible',
      }}
    >
      {screenCorners.map((screenCorner, i) => (
        <line
          key={i}
          x1={screenCorner.x}
          y1={screenCorner.y}
          x2={blockCorners[i].x}
          y2={blockCorners[i].y}
          stroke="var(--foreground)"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
