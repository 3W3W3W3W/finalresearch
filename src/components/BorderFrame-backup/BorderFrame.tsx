'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useMousePosition, MousePosition } from '@/hooks/useMousePosition';
import { useHoverZone } from '@/hooks/useHoverZone';
import { BorderEdge } from './BorderEdge';
import { EdgeLabel } from './EdgeLabel';
import { HoverTextBlock } from './HoverTextBlock';
import { CornerLines } from './CornerLines';
import { HOVER_CONTENT } from '@/lib/borderFrameContent';

interface PlacedBlock {
  position: MousePosition;
  content: string;
  zone: 'top' | 'bottom' | 'left' | 'right';
  placedAt?: number;
}

type PlacedBlocks = {
  [key in 'top' | 'bottom' | 'left' | 'right']?: PlacedBlock;
};

export function BorderFrame() {
  const mousePosition = useMousePosition();
  const activeZone = useHoverZone(mousePosition);
  const textBlockRef = useRef<HTMLDivElement>(null);
  const [textBlockRect, setTextBlockRect] = useState<DOMRect | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlocks>({});
  const [justPlacedZones, setJustPlacedZones] = useState<Set<string>>(new Set());

  const content = useMemo(() => {
    if (!activeZone) return null;
    if (activeZone === 'top' || activeZone === 'bottom') {
      return HOVER_CONTENT.topBottom;
    }
    if (activeZone === 'left') return HOVER_CONTENT.left;
    if (activeZone === 'right') return HOVER_CONTENT.right;
    return null;
  }, [activeZone]);

  // Helper to check if a zone's content is already placed
  // Top and bottom share the same content, so if either is placed, both are considered placed
  const checkZonePlaced = (zone: 'top' | 'bottom' | 'left' | 'right' | null, blocks: PlacedBlocks): boolean => {
    if (!zone) return false;
    if (zone === 'top' || zone === 'bottom') {
      return !!blocks.top || !!blocks.bottom;
    }
    return !!blocks[zone];
  };

  const isZonePlaced = useMemo(() => checkZonePlaced(activeZone, placedBlocks), [activeZone, placedBlocks]);

  // Should show the floating text block (mouse down, has content, zone not already placed)
  const showFloatingBlock = isMouseDown && activeZone && content && !isZonePlaced;

  useEffect(() => {
    const handleMouseDown = () => {
      setIsMouseDown(true);
    };

    const handleMouseUp = () => {
      // Place the block if we're in a zone that doesn't have one yet
      // Use the helper to check if content is already placed (top/bottom share content)
      if (activeZone && content && !checkZonePlaced(activeZone, placedBlocks)) {
        setPlacedBlocks((prev) => ({
          ...prev,
          [activeZone]: {
            position: { ...mousePosition },
            content,
            zone: activeZone,
            placedAt: Date.now(),
          },
        }));
        setJustPlacedZones((prev) => new Set(prev).add(activeZone));
      }
      setIsMouseDown(false);
    };

    const handleTouchStart = () => {
      setIsMouseDown(true);
    };

    const handleTouchEnd = () => {
      if (activeZone && content && !checkZonePlaced(activeZone, placedBlocks)) {
        setPlacedBlocks((prev) => ({
          ...prev,
          [activeZone]: {
            position: { ...mousePosition },
            content,
            zone: activeZone,
            placedAt: Date.now(),
          },
        }));
        setJustPlacedZones((prev) => new Set(prev).add(activeZone));
      }
      setIsMouseDown(false);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeZone, content, mousePosition, placedBlocks]);

  useEffect(() => {
    if (textBlockRef.current && showFloatingBlock) {
      setTextBlockRect(textBlockRef.current.getBoundingClientRect());
    } else {
      setTextBlockRect(null);
    }
  }, [mousePosition, showFloatingBlock]);

  // Clear "just placed" state after a delay to allow interactions
  useEffect(() => {
    if (justPlacedZones.size > 0) {
      const timer = setTimeout(() => {
        setJustPlacedZones(new Set());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [justPlacedZones]);

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 40,
        userSelect: isMouseDown ? 'none' : 'auto',
        WebkitUserSelect: isMouseDown ? 'none' : 'auto',
      }}
    >
      {/* Border edges */}
      <BorderEdge position="top" isActive={activeZone === 'top'} />
      <BorderEdge position="bottom" isActive={activeZone === 'bottom'} />
      <BorderEdge position="left" isActive={activeZone === 'left'} />
      <BorderEdge position="right" isActive={activeZone === 'right'} />

      {/* Edge labels */}
      <EdgeLabel position="top" />
      <EdgeLabel position="left" />
      <EdgeLabel position="right" />

      {/* Placed text blocks - permanently visible after release */}
      {Object.values(placedBlocks).map((block) => (
        <HoverTextBlock
          key={block.zone}
          position={block.position}
          content={block.content}
          zone={block.zone}
          isJustPlaced={justPlacedZones.has(block.zone)}
          isDragging={false}
        />
      ))}

      {/* Cursor-following text block - only when mouse down and zone not placed */}
      {showFloatingBlock && (
        <HoverTextBlock
          ref={textBlockRef}
          position={mousePosition}
          content={content}
          zone={activeZone}
          isDragging={true}
        />
      )}

      {/* Corner lines - draw to text block if zone not placed, or to cursor if placed */}
      <CornerLines
        textBlockRect={textBlockRect}
        cursorPoint={isMouseDown && isZonePlaced ? mousePosition : null}
        isVisible={!!activeZone && isMouseDown}
      />
    </div>
  );
}
