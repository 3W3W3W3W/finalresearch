'use client';

import { EDGE_LABELS } from '@/lib/borderFrameContent';

interface EdgeLabelProps {
  position: 'top' | 'bottom' | 'left' | 'right';
  isDimmed?: boolean;
}

export function EdgeLabel({ position, isDimmed = false }: EdgeLabelProps) {
  const text = EDGE_LABELS[position];

  if (!text) return null;

  const baseClasses = 'fixed text-foreground text-xs pointer-events-none transition-opacity duration-300 ease-out';

  if (position === 'top') {
    return (
      <span
        className={baseClasses}
        style={{
          top: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 35,
          opacity: isDimmed ? 0.5 : 1,
        }}
        aria-hidden="true"
      >
        {text}
      </span>
    );
  }

  if (position === 'left') {
    return (
      <span
        className={baseClasses}
        style={{
          left: '4px',
          top: '50%',
          writingMode: 'vertical-rl',
          transform: 'translateY(-50%) rotate(180deg)',
          zIndex: 35,
          opacity: isDimmed ? 0.5 : 1,
        }}
        aria-hidden="true"
      >
        {text}
      </span>
    );
  }

  if (position === 'right') {
    return (
      <span
        className={baseClasses}
        style={{
          right: '4px',
          top: '50%',
          writingMode: 'vertical-rl',
          transform: 'translateY(-50%)',
          zIndex: 35,
          opacity: isDimmed ? 0.5 : 1,
        }}
        aria-hidden="true"
      >
        {text}
      </span>
    );
  }

  return null;
}
