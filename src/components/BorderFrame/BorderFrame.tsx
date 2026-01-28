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

// Threshold for distinguishing tap from drag (in pixels) - lower = more sensitive
const TAP_THRESHOLD = 2.25;
// Duration for cursor return animation (ms)
const CURSOR_RETURN_DURATION = 200;

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
  const [targetMobilePosition, setTargetMobilePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [mobileActiveZone, setMobileActiveZone] = useState<HoverZone>(null);
  const [viewportCenter, setViewportCenter] = useState<MousePosition>({ x: 0, y: 0 });
  const mobileAnimationRef = useRef<number | null>(null);
  const isAnimatingToCenter = useRef(false);
  const [touchHoveredElement, setTouchHoveredElement] = useState<HTMLElement | null>(null);

  // Inactivity dimming state
  const [isUIDimmed, setIsUIDimmed] = useState(true); // Start dimmed
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use refs for touch state to avoid re-running effects on every touch change
  const touchStartPosRef = useRef<MousePosition | null>(null);
  const isDraggingRef = useRef(false);
  const mobilePositionRef = useRef<MousePosition>({ x: 0, y: 0 });
  const mobileActiveZoneRef = useRef<HoverZone>(null);
  const viewportCenterRef = useRef<MousePosition>({ x: 0, y: 0 });
  const placedBlocksRef = useRef<PlacedBlocks>({});

  // Detect mobile and set initial center position
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
      const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      setViewportCenter(center);
      viewportCenterRef.current = center;
      setTargetMobilePosition(center);
      if (mobile) {
        setMobilePosition(center);
        mobilePositionRef.current = center;
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset inactivity timer - undim UI and start 2s countdown
  const resetInactivityTimer = useCallback(() => {
    setIsUIDimmed(false);

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      setIsUIDimmed(true);
    }, 2000);
  }, []);

  // Track mouse movement to reset inactivity timer
  useEffect(() => {
    if (isMobile) return; // Don't track on mobile

    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [mousePosition, isMobile, resetInactivityTimer]);

  // Smooth animation for mobile cursor returning to center
  const animateMobilePosition = useCallback((from: MousePosition, to: MousePosition, duration: number, onComplete?: () => void) => {
    if (mobileAnimationRef.current) {
      cancelAnimationFrame(mobileAnimationRef.current);
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const newX = from.x + (to.x - from.x) * eased;
      const newY = from.y + (to.y - from.y) * eased;
      const newPos = { x: newX, y: newY };

      // Update both ref and state
      mobilePositionRef.current = newPos;
      setMobilePosition(newPos);

      if (progress < 1) {
        mobileAnimationRef.current = requestAnimationFrame(animate);
      } else {
        mobileAnimationRef.current = null;
        if (onComplete) onComplete();
      }
    };

    mobileAnimationRef.current = requestAnimationFrame(animate);
  }, []);

  // Check if a point is within any placed block's bounds
  const isPointInPlacedBlock = useCallback((point: MousePosition): boolean => {
    for (const zone of Object.keys(placedBlockRefs.current)) {
      const ref = placedBlockRefs.current[zone];
      if (ref?.current) {
        const rect = ref.current.getBoundingClientRect();
        if (
          point.x >= rect.left &&
          point.x <= rect.right &&
          point.y >= rect.top &&
          point.y <= rect.bottom
        ) {
          return true;
        }
      }
    }
    return false;
  }, []);

  // Find interactive element (link or button) at a given point in placed blocks
  const getInteractiveElementAtPoint = useCallback((point: MousePosition): HTMLElement | null => {
    // Check each placed block for interactive elements
    for (const zone of Object.keys(placedBlocks)) {
      const ref = placedBlockRefs.current[zone];
      if (ref?.current) {
        const links = ref.current.querySelectorAll('a, button');
        for (const el of links) {
          if (el instanceof HTMLElement) {
            const rect = el.getBoundingClientRect();
            // Skip elements with zero size
            if (rect.width === 0 || rect.height === 0) continue;

            // Check if point is within bounds with tolerance
            const tolerance = 10;
            if (
              point.x >= rect.left - tolerance &&
              point.x <= rect.right + tolerance &&
              point.y >= rect.top - tolerance &&
              point.y <= rect.bottom + tolerance
            ) {
              return el;
            }
          }
        }
      }
    }
    return null;
  }, [placedBlocks]);

  // Update hover state for touch-hovered element
  const updateTouchHoverState = useCallback((point: MousePosition) => {
    const element = getInteractiveElementAtPoint(point);

    if (element) {
      setTouchHoveredElement(element);
      // Trigger the dimming effect by setting hoveredLinkRect
      const rect = element.getBoundingClientRect();
      setHoveredLinkRect(rect);
    } else {
      setTouchHoveredElement(null);
      setHoveredLinkRect(null);
    }
  }, [getInteractiveElementAtPoint]);

  // Handle link click on mobile - move cursor to link then back to center
  const handleMobileLinkClick = useCallback((linkRect: DOMRect) => {
    if (!isMobile) return;

    const linkCenter = {
      x: linkRect.left + linkRect.width / 2,
      y: linkRect.top + linkRect.height / 2,
    };

    // Cancel any ongoing animation
    if (mobileAnimationRef.current) {
      cancelAnimationFrame(mobileAnimationRef.current);
    }

    // Instantly move to link position
    setMobilePosition(linkCenter);

    // Then animate back to center after a brief pause
    setTimeout(() => {
      animateMobilePosition(linkCenter, viewportCenter, CURSOR_RETURN_DURATION);
    }, 100);
  }, [isMobile, viewportCenter, animateMobilePosition]);

  // Activate the touch-hovered element (click it)
  const activateTouchHoveredElement = useCallback((element: HTMLElement, point: MousePosition) => {
    if (element.tagName === 'A') {
      const link = element as HTMLAnchorElement;
      const href = link.href;
      if (href) {
        // Trigger mobile link click animation
        handleMobileLinkClick(element.getBoundingClientRect());
        // Open the link
        window.open(href, '_blank');
      }
    } else if (element.tagName === 'BUTTON') {
      // For buttons (like email copy), trigger click
      handleMobileLinkClick(element.getBoundingClientRect());
      element.click();
    }
  }, [handleMobileLinkClick]);

  // Use mobile position/zone when on mobile, otherwise use desktop
  const currentPosition = isMobile ? mobilePosition : mousePosition;
  let activeZone = isMobile ? mobileActiveZone : desktopActiveZone;

  // Deadzone: if cursor is over a placed block, don't trigger any zone
  const isOverPlacedBlock = useMemo(() => {
    return isPointInPlacedBlock(currentPosition);
  }, [currentPosition, isPointInPlacedBlock]);

  if (isOverPlacedBlock && !isMobile) {
    activeZone = null;
  }

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
    const newBlock = {
      position: adjustedPosition,
      content: blockContent,
      zone,
      placedAt: Date.now(),
    };
    // Clear all previous blocks and place only the new one
    setPlacedBlocks(() => {
      const updated = { [zone]: newBlock };
      placedBlocksRef.current = updated;
      return updated;
    });
    setJustPlacedZones((prev) => new Set(prev).add(zone));

    // Dim UI after placing
    setIsUIDimmed(true);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
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

  // Helper function to get content for a zone - moved before useEffect
  const getContentForZone = useCallback((zone: HoverZone): string | null => {
    if (!zone) return null;
    if (zone === 'top' || zone === 'bottom') return HOVER_CONTENT.topBottom;
    if (zone === 'left') return HOVER_CONTENT.left;
    if (zone === 'right') return HOVER_CONTENT.right;
    return null;
  }, []);

  // Set up event handlers - use refs to avoid stale closures and re-running effects
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

    // Mobile handlers - use refs for touch state to avoid stale closures
    const handleTouchStart = (e: TouchEvent) => {
      if (!isMobile) {
        setIsMouseDown(true);
        return;
      }
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const startPos = { x: touch.clientX, y: touch.clientY };

        // Cancel any ongoing animation
        if (mobileAnimationRef.current) {
          cancelAnimationFrame(mobileAnimationRef.current);
          mobileAnimationRef.current = null;
        }
        isAnimatingToCenter.current = false;

        // Clear any previous hover state
        setTouchHoveredElement(null);
        setHoveredLinkRect(null);

        // Check if touch started in a placed block - if so, mark as started in block
        // but still allow hover tracking
        if (isPointInPlacedBlock(startPos)) {
          touchStartPosRef.current = null; // Mark as not a drag candidate
          // Immediately check for hover state at start position
          updateTouchHoverState(startPos);
          return;
        }

        touchStartPosRef.current = startPos;
        isDraggingRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isMobile) return;
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const currentPos = { x: touch.clientX, y: touch.clientY };

        // If no touchStartPos, we started on a placed block - just track hover state using touch position
        if (!touchStartPosRef.current) {
          updateTouchHoverState(currentPos);
          return;
        }

        const deltaX = currentPos.x - touchStartPosRef.current.x;
        const deltaY = currentPos.y - touchStartPosRef.current.y;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (absDeltaX > TAP_THRESHOLD || absDeltaY > TAP_THRESHOLD) {
          isDraggingRef.current = true;

          // Determine zone based on drag direction
          const zone = getZoneFromDrag(touchStartPosRef.current, currentPos);
          mobileActiveZoneRef.current = zone;
          setMobileActiveZone(zone);

          // Calculate target based on drag distance from center
          const sensitivity = 1.2;
          const targetX = viewportCenterRef.current.x + deltaX * sensitivity;
          const targetY = viewportCenterRef.current.y + deltaY * sensitivity;

          // Clamp to viewport bounds with small padding
          const padding = 20;
          const clampedX = Math.max(padding, Math.min(window.innerWidth - padding, targetX));
          const clampedY = Math.max(padding, Math.min(window.innerHeight - padding, targetY));

          // Calculate new mobile position with smooth interpolation
          const currentMobilePos = mobilePositionRef.current;
          const newMobileX = currentMobilePos.x + (clampedX - currentMobilePos.x) * 0.4;
          const newMobileY = currentMobilePos.y + (clampedY - currentMobilePos.y) * 0.4;
          const newMobilePos = { x: newMobileX, y: newMobileY };

          // Update mobile position (both ref and state)
          mobilePositionRef.current = newMobilePos;
          setMobilePosition(newMobilePos);

          // Check for interactive elements at the cursor position
          updateTouchHoverState(newMobilePos);
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

      const touch = e.changedTouches[0];
      const endPos = { x: touch.clientX, y: touch.clientY };

      // Use current mobile position from ref to check for interactive elements
      const currentMobilePos = mobilePositionRef.current;
      const hoveredElementAtXCenter = getInteractiveElementAtPoint(currentMobilePos);

      // Clear hover state
      setTouchHoveredElement(null);
      setHoveredLinkRect(null);

      // If touchStartPos is null, this was a touch that started on a placed block
      if (!touchStartPosRef.current) {
        // If the cursor is over an interactive element, activate it
        if (hoveredElementAtXCenter) {
          activateTouchHoveredElement(hoveredElementAtXCenter, currentMobilePos);
        }
        return;
      }

      if (isDraggingRef.current) {
        // Check if the cursor is over an interactive element when drag ends
        if (hoveredElementAtXCenter) {
          // Activate the element the cursor is hovering over
          activateTouchHoveredElement(hoveredElementAtXCenter, currentMobilePos);
          // Animate back to center
          isAnimatingToCenter.current = true;
          animateMobilePosition(currentMobilePos, viewportCenterRef.current, CURSOR_RETURN_DURATION, () => {
            isAnimatingToCenter.current = false;
          });
          mobileActiveZoneRef.current = null;
          setMobileActiveZone(null);
        } else {
          // Was a drag - place the content if zone is active and not already placed
          const currentZone = mobileActiveZoneRef.current;
          if (currentZone && !checkZonePlaced(currentZone, placedBlocksRef.current)) {
            const zoneContent = getContentForZone(currentZone);
            if (zoneContent) {
              placeBlock(currentZone, zoneContent, currentMobilePos, textBlockRect);
            }
          }
          // Smoothly animate crosshair back to center
          isAnimatingToCenter.current = true;
          animateMobilePosition(currentMobilePos, viewportCenterRef.current, CURSOR_RETURN_DURATION, () => {
            isAnimatingToCenter.current = false;
          });
          mobileActiveZoneRef.current = null;
          setMobileActiveZone(null);
        }
      } else {
        // Was a tap - check if tapping edge area
        const tapZone = getZoneFromTapPosition(endPos);

        if (tapZone && !checkZonePlaced(tapZone, placedBlocksRef.current)) {
          // Tap on edge area - show and place content
          const zoneContent = getContentForZone(tapZone);
          if (zoneContent) {
            // Instantly move to tap position
            mobilePositionRef.current = endPos;
            setMobilePosition(endPos);
            mobileActiveZoneRef.current = tapZone;
            setMobileActiveZone(tapZone);
            placeBlock(tapZone, zoneContent, endPos, textBlockRect);
            // Smoothly return to center after placing
            setTimeout(() => {
              animateMobilePosition(endPos, viewportCenterRef.current, CURSOR_RETURN_DURATION, () => {
                mobileActiveZoneRef.current = null;
                setMobileActiveZone(null);
              });
            }, 50);
          }
        }
      }

      // Reset touch state
      touchStartPosRef.current = null;
      isDraggingRef.current = false;
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
  }, [isMobile, activeZone, content, mousePosition, placedBlocks, textBlockRect, placeBlock, getZoneFromDrag, getZoneFromTapPosition, getContentForZone, animateMobilePosition, isPointInPlacedBlock, updateTouchHoverState, getInteractiveElementAtPoint, activateTouchHoveredElement]);

  useEffect(() => {
    if (textBlockRef.current && showFloatingBlock) {
      // Use requestAnimationFrame to ensure the DOM has updated before measuring
      const measureId = requestAnimationFrame(() => {
        if (textBlockRef.current) {
          setTextBlockRect(textBlockRef.current.getBoundingClientRect());
        }
      });
      return () => cancelAnimationFrame(measureId);
    } else {
      setTextBlockRect(null);
    }
  }, [currentPosition, showFloatingBlock, content]);

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
      <BorderEdge position="top" isActive={activeZone === 'top'} isPlaced={!!placedBlocks.top || !!placedBlocks.bottom} isDimmed={isUIDimmed || isLinkHovered} />
      <BorderEdge position="bottom" isActive={activeZone === 'bottom'} isPlaced={!!placedBlocks.top || !!placedBlocks.bottom} isDimmed={isUIDimmed || isLinkHovered} />
      <BorderEdge position="left" isActive={activeZone === 'left'} isPlaced={!!placedBlocks.left} isDimmed={isUIDimmed || isLinkHovered} />
      <BorderEdge position="right" isActive={activeZone === 'right'} isPlaced={!!placedBlocks.right} isDimmed={isUIDimmed || isLinkHovered} />

      {/* Edge labels */}
      <EdgeLabel position="top" isDimmed={isUIDimmed || isLinkHovered} />
      <EdgeLabel position="left" isDimmed={isUIDimmed || isLinkHovered} />
      <EdgeLabel position="right" isDimmed={isUIDimmed || isLinkHovered} />

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
          onMobileLinkClick={handleMobileLinkClick}
          touchHoveredElement={touchHoveredElement}
        />
      ))}

      {/* Cursor-following text block - shows on hover, click to place */}
      {showFloatingBlock && activeZone && (
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
        isDimmed={isUIDimmed || isLinkHovered}
      />
    </div>
  );
}
