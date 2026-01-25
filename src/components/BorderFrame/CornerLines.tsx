'use client';

import { useEffect, useState, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface CornerLinesProps {
  textBlockRect?: DOMRect | null;
  cursorPoint: Point | null;
  snapPoint?: Point | null; // When set, use this as center for block corners instead of cursorPoint (for link snapping)
  isVisible: boolean;
  isDimmed?: boolean;
  isMobile?: boolean;
}

const ANIMATION_DURATION = 150;

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function CornerLines({ textBlockRect, cursorPoint, snapPoint, isVisible, isDimmed = false, isMobile = false }: CornerLinesProps) {
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

  const screenCorners = [
    { x: 0, y: 0 },
    { x: viewport.width, y: 0 },
    { x: 0, y: viewport.height },
    { x: viewport.width, y: viewport.height },
  ];

  // Use snapPoint (link center) if available, otherwise use cursorPoint for block corners
  const centerPoint = snapPoint || cursorPoint;

  // Calculate corners based on center point + animated dimensions
  const blockCorners = [
    { x: centerPoint.x - animatedHalfWidth, y: centerPoint.y - animatedHalfHeight }, // top-left
    { x: centerPoint.x + animatedHalfWidth, y: centerPoint.y - animatedHalfHeight }, // top-right
    { x: centerPoint.x - animatedHalfWidth, y: centerPoint.y + animatedHalfHeight }, // bottom-left
    { x: centerPoint.x + animatedHalfWidth, y: centerPoint.y + animatedHalfHeight }, // bottom-right
  ];

  // Crosshair size for mobile
  const crosshairSize = 10;

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
      {/* Corner lines from screen corners to block corners */}
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
      {/* Mobile crosshair cursor at the cursor point (not snap point) */}
      {isMobile && cursorPoint && (
        <>
          {/* Horizontal line of crosshair */}
          <line
            x1={cursorPoint.x - crosshairSize}
            y1={cursorPoint.y}
            x2={cursorPoint.x + crosshairSize}
            y2={cursorPoint.y}
            stroke="var(--foreground)"
            strokeWidth="1"
            style={{
              opacity: isDimmed ? 0.7 : 1,
              transition: 'opacity 150ms ease-out',
            }}
          />
          {/* Vertical line of crosshair */}
          <line
            x1={cursorPoint.x}
            y1={cursorPoint.y - crosshairSize}
            x2={cursorPoint.x}
            y2={cursorPoint.y + crosshairSize}
            stroke="var(--foreground)"
            strokeWidth="1"
            style={{
              opacity: isDimmed ? 0.7 : 1,
              transition: 'opacity 150ms ease-out',
            }}
          />
        </>
      )}
    </svg>
  );
}
