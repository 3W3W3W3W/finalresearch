'use client';

import { useEffect, useState, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface CornerLinesProps {
  textBlockRect?: DOMRect | null;
  cursorPoint: Point | null;
  isVisible: boolean;
  isDimmed?: boolean;
}

const ANIMATION_DURATION = 150;

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function CornerLines({ textBlockRect, cursorPoint, isVisible, isDimmed = false }: CornerLinesProps) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  // Animated half-dimensions (from center to edge)
  const [animatedHalfWidth, setAnimatedHalfWidth] = useState(0);
  const [animatedHalfHeight, setAnimatedHalfHeight] = useState(0);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startDimsRef = useRef({ halfWidth: 0, halfHeight: 0 });
  const targetDimsRef = useRef({ halfWidth: 0, halfHeight: 0 });
  const currentDimsRef = useRef({ halfWidth: 0, halfHeight: 0 });

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

  // Animate dimensions when text block size changes
  useEffect(() => {
    let targetHalfWidth = 0;
    let targetHalfHeight = 0;

    if (textBlockRect) {
      targetHalfWidth = textBlockRect.width / 2;
      targetHalfHeight = textBlockRect.height / 2;
    }

    // Check if dimensions actually changed
    const hasChanged =
      Math.abs(targetHalfWidth - targetDimsRef.current.halfWidth) > 1 ||
      Math.abs(targetHalfHeight - targetDimsRef.current.halfHeight) > 1;

    if (hasChanged) {
      // Store current dimensions as start
      startDimsRef.current = { ...currentDimsRef.current };
      targetDimsRef.current = { halfWidth: targetHalfWidth, halfHeight: targetHalfHeight };
      startTimeRef.current = null;

      // Cancel existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Animation loop
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
        const easedProgress = easeOut(progress);

        const newHalfWidth = lerp(
          startDimsRef.current.halfWidth,
          targetDimsRef.current.halfWidth,
          easedProgress
        );
        const newHalfHeight = lerp(
          startDimsRef.current.halfHeight,
          targetDimsRef.current.halfHeight,
          easedProgress
        );

        currentDimsRef.current = { halfWidth: newHalfWidth, halfHeight: newHalfHeight };
        setAnimatedHalfWidth(newHalfWidth);
        setAnimatedHalfHeight(newHalfHeight);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          animationRef.current = null;
          startTimeRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [textBlockRect?.width, textBlockRect?.height]);

  if (!isVisible || viewport.width === 0) return null;
  if (!cursorPoint) return null;
  
  // Don't render if there's no text block (dimensions are 0) - this prevents the "+" crosshair at the center
  if (animatedHalfWidth === 0 && animatedHalfHeight === 0 && !textBlockRect) return null;

  const screenCorners = [
    { x: 0, y: 0 },
    { x: viewport.width, y: 0 },
    { x: 0, y: viewport.height },
    { x: viewport.width, y: viewport.height },
  ];

  // Calculate corners based on cursor position + animated dimensions
  const blockCorners = [
    { x: cursorPoint.x - animatedHalfWidth, y: cursorPoint.y - animatedHalfHeight }, // top-left
    { x: cursorPoint.x + animatedHalfWidth, y: cursorPoint.y - animatedHalfHeight }, // top-right
    { x: cursorPoint.x - animatedHalfWidth, y: cursorPoint.y + animatedHalfHeight }, // bottom-left
    { x: cursorPoint.x + animatedHalfWidth, y: cursorPoint.y + animatedHalfHeight }, // bottom-right
  ];

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
          style={{
            opacity: isDimmed ? 0.7 : 1,
            transition: 'opacity 150ms ease-out',
          }}
        />
      ))}
    </svg>
  );
}
