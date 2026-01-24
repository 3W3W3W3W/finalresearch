'use client';

import { forwardRef, ReactNode, useState, useEffect } from 'react';
import type { MousePosition } from '@/hooks/useMousePosition';

interface HoverTextBlockProps {
  position: MousePosition;
  content: string;
  zone: 'top' | 'bottom' | 'left' | 'right';
  isJustPlaced?: boolean;
  isDragging?: boolean;
}

interface TextSegment {
  type: 'text' | 'link' | 'email' | 'call';
  content: string;
  url?: string;
}

function parseContent(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const pattern = /\[([^\]|]+)\|([^\]|]+)\|([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    const [, displayText, type, url] = match;
    segments.push({
      type: type as 'link' | 'email' | 'call',
      content: displayText,
      url,
    });

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }];
}

function renderSegment(
  segment: TextSegment,
  idx: number,
  isJustPlaced: boolean,
  isDragging: boolean,
  onEmailCopied?: () => void,
  copiedIdx?: number
): ReactNode {
  const handleCopyEmail = (e: React.MouseEvent) => {
    if (isJustPlaced) return;
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(segment.content);
    onEmailCopied?.();
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isJustPlaced) return;
    e.preventDefault();
    e.stopPropagation();
    if (segment.url) {
      window.open(segment.url, '_blank');
    }
  };

  switch (segment.type) {
    case 'link':
      return (
        <a
          key={idx}
          href={segment.url}
          onClick={handleLinkClick}
          className={`${!isDragging ? 'hover:opacity-70' : ''} transition-opacity ${
            isJustPlaced || isDragging ? 'pointer-events-none' : 'cursor-pointer'
          }`}
          style={{ pointerEvents: isJustPlaced || isDragging ? 'none' : 'auto' }}
        >
          {segment.content}
        </a>
      );

    case 'call':
      return (
        <a
          key={idx}
          href={segment.url}
          onClick={handleLinkClick}
          className={`${!isDragging ? 'hover:opacity-70' : ''} transition-opacity ${
            isJustPlaced || isDragging ? 'pointer-events-none' : 'cursor-pointer'
          }`}
          style={{ pointerEvents: isJustPlaced || isDragging ? 'none' : 'auto' }}
        >
          {segment.content}
        </a>
      );

    case 'email':
      return (
        <span key={idx} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={handleCopyEmail}
            className={`${!isDragging ? 'hover:opacity-70' : ''} ${
              isJustPlaced || isDragging ? 'pointer-events-none' : 'cursor-pointer'
            }`}
            style={{
              pointerEvents: isJustPlaced || isDragging ? 'none' : 'auto',
              font: 'inherit',
              color: 'inherit',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
          >
            {segment.content}
          </button>
          {copiedIdx === idx && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.65rem',
                opacity: 0.7,
                whiteSpace: 'nowrap',
                marginTop: '2px',
              }}
            >
              COPIED
            </div>
          )}
        </span>
      );

    default:
      return <span key={idx}>{segment.content}</span>;
  }
}

export const HoverTextBlock = forwardRef<HTMLDivElement, HoverTextBlockProps>(
  function HoverTextBlock({ position, content, zone, isJustPlaced = false, isDragging = false }, ref) {
    const isHorizontalZone = zone === 'top' || zone === 'bottom';
    const segments = parseContent(content);
    const [copiedIdx, setCopiedIdx] = useState<number | undefined>(undefined);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 640);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
      if (copiedIdx !== undefined) {
        const timer = setTimeout(() => {
          setCopiedIdx(undefined);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }, [copiedIdx]);

    const handleEmailCopied = () => {
      // Find the email segment index
      const emailIdx = segments.findIndex((seg) => seg.type === 'email');
      if (emailIdx !== -1) {
        setCopiedIdx(emailIdx);
      }
    };

    const blockWidth = isHorizontalZone ? (isMobile ? 215 : 215) : undefined;

    return (
      <div
        ref={ref}
        className="fixed text-foreground"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          zIndex: 45,
          pointerEvents: isJustPlaced ? 'none' : 'auto',
          userSelect: isDragging ? 'none' : 'auto',
          WebkitUserSelect: isDragging ? 'none' : 'auto',
          whiteSpace: isHorizontalZone ? 'normal' : 'nowrap',
          wordWrap: isHorizontalZone ? 'break-word' : 'normal',
          width: blockWidth,
          minWidth: blockWidth,
          maxWidth: blockWidth,
          boxSizing: 'border-box',
        }}
      >
        {segments.map((segment, idx) =>
          renderSegment(segment, idx, isJustPlaced, isDragging, handleEmailCopied, copiedIdx)
        )}
      </div>
    );
  }
);
