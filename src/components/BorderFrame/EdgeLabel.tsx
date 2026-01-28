'use client';

import { forwardRef } from 'react';
import { EDGE_LABELS } from '@/lib/borderFrameContent';

interface EdgeLabelProps {
  position: 'top' | 'bottom' | 'left' | 'right';
  isDimmed?: boolean;
  isHidden?: boolean;
}

export const EdgeLabel = forwardRef<HTMLSpanElement, EdgeLabelProps>(
  function EdgeLabel({ position, isDimmed = false, isHidden = false }, ref) {
  const text = EDGE_LABELS[position];

  if (!text) return null;

  const baseClasses = 'fixed text-foreground text-xs pointer-events-none transition-opacity duration-300 ease-out';

  if (position === 'top') {
    return (
      <span
        ref={ref}
        className={baseClasses}
        style={{
          top: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 35,
          opacity: isHidden ? 0 : (isDimmed ? 0.5 : 1),
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
        ref={ref}
        className={baseClasses}
        style={{
          left: '4px',
          top: '50%',
          writingMode: 'vertical-rl',
          transform: 'translateY(-50%) rotate(180deg)',
          zIndex: 35,
          opacity: isHidden ? 0 : (isDimmed ? 0.5 : 1),
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
        ref={ref}
        className={baseClasses}
        style={{
          right: '4px',
          top: '50%',
          writingMode: 'vertical-rl',
          transform: 'translateY(-50%)',
          zIndex: 35,
          opacity: isHidden ? 0 : (isDimmed ? 0.5 : 1),
        }}
        aria-hidden="true"
      >
        {text}
      </span>
    );
  }

  return null;
  }
);
