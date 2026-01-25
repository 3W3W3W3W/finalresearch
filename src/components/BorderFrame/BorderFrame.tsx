'use client';

import { useRef, useMemo, useState, useEffect, createRef, useCallback } from 'react';
import { useMousePosition, MousePosition } from '@/hooks/useMousePosition';
import { useHoverZone, HoverZone } from '@/hooks/useHoverZone';
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

// Threshold for distinguishing tap from drag (in pixels)
const TAP_THRESHOLD = 10;

export function BorderFrame() {
  const mousePosition = useMousePosition();
  const desktopActiveZone = useHoverZone(mousePosition);
  const textBlockRef = useRef<HTMLDivElement>(null);
  const [textBlockRect, setTextBlockRect] = useState<DOMRect | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlocks>({});
  const [justPlacedZones, setJustPlacedZones] = useState<Set<string>>(new Set());
  const [hoveredLinkRect, setHoveredLinkRect] = useState<DOMRect | null>(null);
  const placedBlockRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePosition, setMobilePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [mobileActiveZone, setMobileActiveZone] = useState<HoverZone>(null);
  const [touchStartPos, setTouchStartPos] = useState<MousePosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportCenter, setViewportCenter] = useState<MousePosition>({ x: 0, y: 0 });

  // Detect mobile and set initial center position
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
      const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      setViewportCenter(center);
      if (mobile) {
        setMobilePosition(center);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use mobile position/zone when on mobile, otherwise use desktop
  const currentPosition = isMobile ? mobilePosition : mousePosition;
  const activeZone = isMobile ? mobileActiveZone : desktopActiveZone;

  const handleLinkHover = (rect: DOMRect | null) => {
    setHoveredLinkRect(rect);
  };

  const isLinkHovered = hoveredLinkRect !== null;

  // Create or get ref for a placed block
  const getPlacedBlockRef = (zone: string): React.RefObject<HTMLDivElement | null> => {
    if (!placedBlockRefs.current[zone]) {
      placedBlockRefs.current[zone] = createRef<HTMLDivElement>();
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

  // Helper to calculate adjusted position within viewport bounds
  const calculateAdjustedPosition = useCallback((pos: MousePosition, rect: DOMRect | null): MousePosition => {
    let adjustedPosition = { ...pos };
    if (rect) {
      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;
      const offset = 5;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const left = pos.x - halfWidth;
      const right = pos.x + halfWidth;
      const top = pos.y - halfHeight;
      const bottom = pos.y + halfHeight;

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
    return adjustedPosition;
  }, []);

  // Helper to place a block
  const placeBlock = useCallback((zone: HoverZone, blockContent: string, position: MousePosition, rect: DOMRect | null) => {
    if (!zone || !blockContent) return;
    const adjustedPosition = calculateAdjustedPosition(position, rect);
    setPlacedBlocks((prev) => ({
      ...prev,
      [zone]: {
        position: adjustedPosition,
        content: blockContent,
        zone,
        placedAt: Date.now(),
      },
    }));
    setJustPlacedZones((prev) => new Set(prev).add(zone));
  }, [calculateAdjustedPosition]);

  // Determine zone from drag direction (mobile)
  const getZoneFromDrag = useCallback((startPos: MousePosition, currentPos: MousePosition): HoverZone => {
    const deltaX = currentPos.x - startPos.x;
    const deltaY = currentPos.y - startPos.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Need minimum movement to register a direction
    if (absDeltaX < TAP_THRESHOLD && absDeltaY < TAP_THRESHOLD) {
      return null;
    }

    // Determine primary direction
    if (absDeltaY > absDeltaX) {
      return deltaY < 0 ? 'top' : 'bottom';
    } else {
      return deltaX < 0 ? 'left' : 'right';
    }
  }, []);

  // Determine zone from tap position (mobile) - for tapping edge areas
  const getZoneFromTapPosition = useCallback((pos: MousePosition): HoverZone => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const edgeThreshold = 0.25; // 25% from edge

    if (pos.y < vh * edgeThreshold) return 'top';
    if (pos.y > vh * (1 - edgeThreshold)) return 'bottom';
    if (pos.x < vw * edgeThreshold) return 'left';
    if (pos.x > vw * (1 - edgeThreshold)) return 'right';
    return null; // Center deadzone
  }, []);

  useEffect(() => {
    // Desktop handlers
    const handleMouseDown = () => {
      if (isMobile) return;
      setIsMouseDown(true);
    };

    const handleMouseUp = () => {
      if (isMobile) return;
      if (activeZone && content && !checkZonePlaced(activeZone, placedBlocks)) {
        placeBlock(activeZone, content, mousePosition, textBlockRect);
      }
      setIsMouseDown(false);
    };

    // Mobile handlers
    const handleTouchStart = (e: TouchEvent) => {
      if (!isMobile) {
        setIsMouseDown(true);
        return;
      }
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const startPos = { x: touch.clientX, y: touch.clientY };
        setTouchStartPos(startPos);
        setIsDragging(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isMobile || !touchStartPos) return;
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const currentPos = { x: touch.clientX, y: touch.clientY };

        const deltaX = Math.abs(currentPos.x - touchStartPos.x);
        const deltaY = Math.abs(currentPos.y - touchStartPos.y);

        if (deltaX > TAP_THRESHOLD || deltaY > TAP_THRESHOLD) {
          setIsDragging(true);

          // Determine zone based on drag direction
          const zone = getZoneFromDrag(touchStartPos, currentPos);
          setMobileActiveZone(zone);

          // Move crosshair in the drag direction but keep it somewhat centered
          // Move proportionally to drag distance
          const maxOffset = Math.min(window.innerWidth, window.innerHeight) * 0.3;
          const offsetX = Math.max(-maxOffset, Math.min(maxOffset, (currentPos.x - touchStartPos.x) * 0.5));
          const offsetY = Math.max(-maxOffset, Math.min(maxOffset, (currentPos.y - touchStartPos.y) * 0.5));

          setMobilePosition({
            x: viewportCenter.x + offsetX,
            y: viewportCenter.y + offsetY,
          });
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isMobile) {
        // Desktop touch behavior
        if (activeZone && content && !checkZonePlaced(activeZone, placedBlocks)) {
          placeBlock(activeZone, content, mousePosition, textBlockRect);
        }
        setIsMouseDown(false);
        return;
      }

      if (!touchStartPos) return;

      const touch = e.changedTouches[0];
      const endPos = { x: touch.clientX, y: touch.clientY };

      if (isDragging) {
        // Was a drag - place the content if zone is active and not already placed
        if (mobileActiveZone && !checkZonePlaced(mobileActiveZone, placedBlocks)) {
          const zoneContent = getContentForZone(mobileActiveZone);
          if (zoneContent) {
            placeBlock(mobileActiveZone, zoneContent, mobilePosition, textBlockRect);
          }
        }
        // Return crosshair to center
        setMobilePosition(viewportCenter);
        setMobileActiveZone(null);
      } else {
        // Was a tap - check if tapping edge area or placed block
        const tapZone = getZoneFromTapPosition(endPos);

        if (tapZone && !checkZonePlaced(tapZone, placedBlocks)) {
          // Tap on edge area - show and place content
          const zoneContent = getContentForZone(tapZone);
          if (zoneContent) {
            // Briefly show the content at tap position then place it
            setMobilePosition(endPos);
            setMobileActiveZone(tapZone);
            placeBlock(tapZone, zoneContent, endPos, textBlockRect);
            // Return to center after placing
            setTimeout(() => {
              setMobilePosition(viewportCenter);
              setMobileActiveZone(null);
            }, 50);
          }
        }
        // If tapping on a placed block, the link click is handled by the HoverTextBlock component
      }

      setTouchStartPos(null);
      setIsDragging(false);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeZone, content, mousePosition, placedBlocks, isMobile, touchStartPos, isDragging, mobileActiveZone, mobilePosition, viewportCenter, textBlockRect, placeBlock, getZoneFromDrag, getZoneFromTapPosition]);

  // Helper function to get content for a zone
  const getContentForZone = (zone: HoverZone): string | null => {
    if (!zone) return null;
    if (zone === 'top' || zone === 'bottom') return HOVER_CONTENT.topBottom;
    if (zone === 'left') return HOVER_CONTENT.left;
    if (zone === 'right') return HOVER_CONTENT.right;
    return null;
  };

  useEffect(() => {
    if (textBlockRef.current && showFloatingBlock) {
      setTextBlockRect(textBlockRef.current.getBoundingClientRect());
    } else {
      setTextBlockRect(null);
    }
  }, [currentPosition, showFloatingBlock]);

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
          position={currentPosition}
          content={content}
          zone={activeZone}
          isDragging={true}
        />
      )}

      {/* Corner lines - always track cursor */}
      <CornerLines
        textBlockRect={textBlockRect}
        cursorPoint={currentPosition}
        isVisible={true}
        isDimmed={isLinkHovered}
      />
    </div>
  );
}
