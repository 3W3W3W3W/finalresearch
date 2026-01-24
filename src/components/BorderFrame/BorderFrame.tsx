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
  const [hoveredLinkRect, setHoveredLinkRect] = useState<DOMRect | null>(null);
  const placedBlockRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({});

  const handleLinkHover = (rect: DOMRect | null) => {
    setHoveredLinkRect(rect);
  };

  const isLinkHovered = hoveredLinkRect !== null;

  // Create or get ref for a placed block
  const getPlacedBlockRef = (zone: string): React.RefObject<HTMLDivElement> => {
    if (!placedBlockRefs.current[zone]) {
      placedBlockRefs.current[zone] = { current: null } as React.RefObject<HTMLDivElement>;
    }
    return placedBlockRefs.current[zone];
  };

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

  // Should show the floating text block on hover (no click required), zone not already placed
  const showFloatingBlock = activeZone && content && !isZonePlaced;

  useEffect(() => {
    const handleMouseDown = () => {
      setIsMouseDown(true);
    };

    const handleMouseUp = () => {
      // Place the block if we're in a zone that doesn't have one yet
      // Use the helper to check if content is already placed (top/bottom share content)
      if (activeZone && content && !checkZonePlaced(activeZone, placedBlocks)) {
        let adjustedPosition = { ...mousePosition };

        // If we have a text block rect, check if it would be outside viewport
        if (textBlockRect) {
          const halfWidth = textBlockRect.width / 2;
          const halfHeight = textBlockRect.height / 2;
          const offset = 5; // 5px offset from viewport edges

          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // Calculate bounds if placed at mouse position
          const left = mousePosition.x - halfWidth;
          const right = mousePosition.x + halfWidth;
          const top = mousePosition.y - halfHeight;
          const bottom = mousePosition.y + halfHeight;

          // Adjust position if outside viewport (with 5px offset)
          if (left < offset) {
            adjustedPosition.x = halfWidth + offset;
          } else if (right > viewportWidth - offset) {
            adjustedPosition.x = viewportWidth - halfWidth - offset;
          }

          if (top < offset) {
            adjustedPosition.y = halfHeight + offset;
          } else if (bottom > viewportHeight - offset) {
            adjustedPosition.y = viewportHeight - halfHeight - offset;
          }
        }

        setPlacedBlocks((prev) => ({
          ...prev,
          [activeZone]: {
            position: adjustedPosition,
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
        let adjustedPosition = { ...mousePosition };

        // If we have a text block rect, check if it would be outside viewport
        if (textBlockRect) {
          const halfWidth = textBlockRect.width / 2;
          const halfHeight = textBlockRect.height / 2;
          const offset = 5; // 5px offset from viewport edges

          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // Calculate bounds if placed at mouse position
          const left = mousePosition.x - halfWidth;
          const right = mousePosition.x + halfWidth;
          const top = mousePosition.y - halfHeight;
          const bottom = mousePosition.y + halfHeight;

          // Adjust position if outside viewport (with 5px offset)
          if (left < offset) {
            adjustedPosition.x = halfWidth + offset;
          } else if (right > viewportWidth - offset) {
            adjustedPosition.x = viewportWidth - halfWidth - offset;
          }

          if (top < offset) {
            adjustedPosition.y = halfHeight + offset;
          } else if (bottom > viewportHeight - offset) {
            adjustedPosition.y = viewportHeight - halfHeight - offset;
          }
        }

        setPlacedBlocks((prev) => ({
          ...prev,
          [activeZone]: {
            position: adjustedPosition,
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

  // Hide the default cursor globally
  useEffect(() => {
    document.body.style.cursor = 'none';
    document.documentElement.style.cursor = 'none';

    // Add style to hide cursor on all elements
    const style = document.createElement('style');
    style.id = 'hide-cursor-style';
    style.textContent = '* { cursor: none !important; }';
    document.head.appendChild(style);

    return () => {
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
      const existingStyle = document.getElementById('hide-cursor-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Dynamically adjust placed block positions based on their actual rendered size
  useEffect(() => {
    if (justPlacedZones.size === 0) return;

    const adjustPlacedBlockPositions = () => {
      const offset = 5;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      setPlacedBlocks((prev) => {
        const updated = { ...prev };
        let hasChanges = false;

        justPlacedZones.forEach((zone) => {
          const block = prev[zone as 'top' | 'bottom' | 'left' | 'right'];
          if (!block) return;

          const ref = placedBlockRefs.current[zone];
          if (ref?.current) {
            const rect = ref.current.getBoundingClientRect();
            const halfWidth = rect.width / 2;
            const halfHeight = rect.height / 2;

            let newPosition = { ...block.position };

            // Calculate bounds
            const left = block.position.x - halfWidth;
            const right = block.position.x + halfWidth;
            const top = block.position.y - halfHeight;
            const bottom = block.position.y + halfHeight;

            // Adjust if outside viewport
            if (left < offset) {
              newPosition.x = halfWidth + offset;
              hasChanges = true;
            } else if (right > viewportWidth - offset) {
              newPosition.x = viewportWidth - halfWidth - offset;
              hasChanges = true;
            }

            if (top < offset) {
              newPosition.y = halfHeight + offset;
              hasChanges = true;
            } else if (bottom > viewportHeight - offset) {
              newPosition.y = viewportHeight - halfHeight - offset;
              hasChanges = true;
            }

            if (hasChanges) {
              updated[zone as 'top' | 'bottom' | 'left' | 'right'] = {
                ...block,
                position: newPosition,
              };
            }
          }
        });

        return hasChanges ? updated : prev;
      });
    };

    // Run adjustment after render
    const timeoutId = setTimeout(adjustPlacedBlockPositions, 50);

    return () => clearTimeout(timeoutId);
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
      <BorderEdge position="top" isActive={activeZone === 'top'} isPlaced={!!placedBlocks.top || !!placedBlocks.bottom} isDimmed={isLinkHovered} />
      <BorderEdge position="bottom" isActive={activeZone === 'bottom'} isPlaced={!!placedBlocks.top || !!placedBlocks.bottom} isDimmed={isLinkHovered} />
      <BorderEdge position="left" isActive={activeZone === 'left'} isPlaced={!!placedBlocks.left} isDimmed={isLinkHovered} />
      <BorderEdge position="right" isActive={activeZone === 'right'} isPlaced={!!placedBlocks.right} isDimmed={isLinkHovered} />

      {/* Edge labels */}
      <EdgeLabel position="top" />
      <EdgeLabel position="left" />
      <EdgeLabel position="right" />

      {/* Placed text blocks - permanently visible after release */}
      {Object.values(placedBlocks).map((block) => (
        <HoverTextBlock
          key={block.zone}
          ref={getPlacedBlockRef(block.zone)}
          position={block.position}
          content={block.content}
          zone={block.zone}
          isJustPlaced={justPlacedZones.has(block.zone)}
          isDragging={false}
          onLinkHover={handleLinkHover}
        />
      ))}

      {/* Cursor-following text block - shows on hover, click to place */}
      {showFloatingBlock && (
        <HoverTextBlock
          ref={textBlockRef}
          position={mousePosition}
          content={content}
          zone={activeZone}
          isDragging={true}
        />
      )}

      {/* Corner lines - always track cursor */}
      <CornerLines
        textBlockRect={textBlockRect}
        cursorPoint={mousePosition}
        isVisible={true}
        isDimmed={isLinkHovered}
      />
    </div>
  );
}
