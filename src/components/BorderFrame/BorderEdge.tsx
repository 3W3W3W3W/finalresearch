'use client';

interface BorderEdgeProps {
  position: 'top' | 'bottom' | 'left' | 'right';
  isActive: boolean;
  isPlaced?: boolean;
  isDimmed?: boolean;
}

export function BorderEdge({ position, isActive, isPlaced = false, isDimmed = false }: BorderEdgeProps) {
  // Don't animate if content for this zone is already placed
  const shouldAnimate = isActive && !isPlaced;
  const thickness = shouldAnimate ? 1.5 : 1;

  const isHorizontal = position === 'top' || position === 'bottom';

  const baseClasses = shouldAnimate ? 'fixed bg-foreground z-40' : 'fixed bg-foreground transition-all duration-150 ease-out z-40';

  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      top: 0,
      left: 0,
      right: 0,
      height: `${thickness}px`,
      opacity: isDimmed ? 0.7 : 1,
      transition: 'opacity 150ms ease-out',
    },
    bottom: {
      bottom: 0,
      left: 0,
      right: 0,
      height: `${thickness}px`,
      opacity: isDimmed ? 0.7 : 1,
      transition: 'opacity 150ms ease-out',
    },
    left: {
      top: 0,
      bottom: 0,
      left: 0,
      width: `${thickness}px`,
      opacity: isDimmed ? 0.7 : 1,
      transition: 'opacity 150ms ease-out',
    },
    right: {
      top: 0,
      bottom: 0,
      right: 0,
      width: `${thickness}px`,
      opacity: isDimmed ? 0.7 : 1,
      transition: 'opacity 150ms ease-out',
    },
  };

  // Gradient styles for each position
  const gradientStyles: Record<string, React.CSSProperties> = {
    top: {
      top: 0,
      left: 0,
      right: 0,
      height: '5vh',
      background: 'linear-gradient(to bottom, rgba(70, 72, 97, 0.15), transparent)',
      opacity: shouldAnimate ? 1 : 0,
      pointerEvents: 'none',
    },
    bottom: {
      bottom: 0,
      left: 0,
      right: 0,
      height: '5vh',
      background: 'linear-gradient(to top, rgba(70, 72, 97, 0.15), transparent)',
      opacity: shouldAnimate ? 1 : 0,
      pointerEvents: 'none',
    },
    left: {
      top: 0,
      bottom: 0,
      left: 0,
      width: '5vw',
      background: 'linear-gradient(to right, rgba(70, 72, 97, 0.15), transparent)',
      opacity: shouldAnimate ? 1 : 0,
      pointerEvents: 'none',
    },
    right: {
      top: 0,
      bottom: 0,
      right: 0,
      width: '5vw',
      background: 'linear-gradient(to left, rgba(70, 72, 97, 0.15), transparent)',
      opacity: shouldAnimate ? 1 : 0,
      pointerEvents: 'none',
    },
  };

  return (
    <>
      {/* Gradient overlay */}
      <div
        className={shouldAnimate ? 'fixed z-30' : 'fixed transition-opacity duration-150 ease-out z-30'}
        style={gradientStyles[position]}
        aria-hidden="true"
      />
      {/* Border edge */}
      <div
        className={baseClasses}
        style={positionStyles[position]}
        aria-hidden="true"
      />
    </>
  );
}
