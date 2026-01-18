'use client';

import { forwardRef } from 'react';
import type { MousePosition } from '@/hooks/useMousePosition';

interface HoverTextBlockProps {
  position: MousePosition;
  content: string;
  zone: 'top' | 'bottom' | 'left' | 'right';
}

export const HoverTextBlock = forwardRef<HTMLDivElement, HoverTextBlockProps>(
  function HoverTextBlock({ position, content, zone }, ref) {
    const isHorizontalZone = zone === 'top' || zone === 'bottom';

    return (
      <div
        ref={ref}
        className={`fixed text-foreground text-xs pointer-events-none ${
          isHorizontalZone ? 'max-w-[215px]' : 'whitespace-nowrap'
        }`}
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          zIndex: 45,
        }}
      >
        {content}
      </div>
    );
  }
);
