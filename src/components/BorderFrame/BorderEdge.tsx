'use client';

interface BorderEdgeProps {
  position: 'top' | 'bottom' | 'left' | 'right';
  isActive: boolean;
}

export function BorderEdge({ position, isActive }: BorderEdgeProps) {
  const isHorizontal = position === 'top' || position === 'bottom';
  const thickness = isActive ? 2 : 1;

  const baseClasses = 'fixed bg-foreground transition-all duration-150 ease-out z-40';

  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      top: 0,
      left: 0,
      right: 0,
      height: `${thickness}px`,
    },
    bottom: {
      bottom: 0,
      left: 0,
      right: 0,
      height: `${thickness}px`,
    },
    left: {
      top: 0,
      bottom: 0,
      left: 0,
      width: `${thickness}px`,
    },
    right: {
      top: 0,
      bottom: 0,
      right: 0,
      width: `${thickness}px`,
    },
  };

  return (
    <div
      className={baseClasses}
      style={positionStyles[position]}
      aria-hidden="true"
    />
  );
}
