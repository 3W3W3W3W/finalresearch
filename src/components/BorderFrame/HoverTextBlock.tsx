'use client';

import { forwardRef, ReactNode, useState, useEffect, useRef } from 'react';
import type { MousePosition } from '@/hooks/useMousePosition';

interface HoverTextBlockProps {
  position: MousePosition;
  content: string;
  zone: 'top' | 'bottom' | 'left' | 'right';
  isJustPlaced?: boolean;
  isDragging?: boolean;
  onLinkHover?: (rect: DOMRect | null) => void;
  onMobileLinkClick?: (rect: DOMRect) => void;
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

interface RenderSegmentProps {
  segment: TextSegment;
  idx: number;
  isJustPlaced: boolean;
  isDragging: boolean;
  onEmailCopied?: () => void;
  copiedIdx?: number;
  onLinkHover?: (rect: DOMRect | null) => void;
  onMobileLinkClick?: (rect: DOMRect) => void;
}

function LinkSegment({ segment, idx, isJustPlaced, isDragging, onLinkHover, onMobileLinkClick }: RenderSegmentProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isJustPlaced) return;
    e.preventDefault();
    e.stopPropagation();

    // Trigger mobile cursor movement if callback provided
    if (linkRef.current && onMobileLinkClick) {
      onMobileLinkClick(linkRef.current.getBoundingClientRect());
    }

    if (segment.url) {
      window.open(segment.url, '_blank');
    }
  };

  const handleMouseEnter = () => {
    if (linkRef.current && onLinkHover) {
      onLinkHover(linkRef.current.getBoundingClientRect());
    }
  };

  const handleMouseLeave = () => {
    if (onLinkHover) {
      onLinkHover(null);
    }
  };

  return (
    <a
      ref={linkRef}
      key={idx}
      href={segment.url}
      onClick={handleLinkClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${!isDragging ? 'hover:opacity-70' : ''} transition-opacity ${
        isJustPlaced || isDragging ? 'pointer-events-none' : 'cursor-pointer'
      }`}
      style={{
        pointerEvents: isJustPlaced || isDragging ? 'none' : 'auto',
        textDecoration: !isDragging ? 'underline' : 'none',
      }}
    >
      {segment.content}
    </a>
  );
}

function CallSegment({ segment, idx, isJustPlaced, isDragging, onLinkHover, onMobileLinkClick }: RenderSegmentProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isJustPlaced) return;
    e.preventDefault();
    e.stopPropagation();

    // Trigger mobile cursor movement if callback provided
    if (linkRef.current && onMobileLinkClick) {
      onMobileLinkClick(linkRef.current.getBoundingClientRect());
    }

    if (segment.url) {
      window.open(segment.url, '_blank');
    }
  };

  const handleMouseEnter = () => {
    if (linkRef.current && onLinkHover) {
      onLinkHover(linkRef.current.getBoundingClientRect());
    }
  };

  const handleMouseLeave = () => {
    if (onLinkHover) {
      onLinkHover(null);
    }
  };

  return (
    <a
      ref={linkRef}
      key={idx}
      href={segment.url}
      onClick={handleLinkClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${!isDragging ? 'hover:opacity-70' : ''} transition-opacity ${
        isJustPlaced || isDragging ? 'pointer-events-none' : 'cursor-pointer'
      }`}
      style={{ pointerEvents: isJustPlaced || isDragging ? 'none' : 'auto' }}
    >
      {segment.content}
    </a>
  );
}

function EmailSegment({ segment, idx, isJustPlaced, isDragging, onEmailCopied, copiedIdx, onLinkHover, onMobileLinkClick }: RenderSegmentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleCopyEmail = (e: React.MouseEvent) => {
    if (isJustPlaced) return;
    e.preventDefault();
    e.stopPropagation();

    // Trigger mobile cursor movement if callback provided
    if (buttonRef.current && onMobileLinkClick) {
      onMobileLinkClick(buttonRef.current.getBoundingClientRect());
    }

    navigator.clipboard.writeText(segment.content);
    onEmailCopied?.();
  };

  const handleMouseEnter = () => {
    if (buttonRef.current && onLinkHover) {
      onLinkHover(buttonRef.current.getBoundingClientRect());
    }
  };

  const handleMouseLeave = () => {
    if (onLinkHover) {
      onLinkHover(null);
    }
  };

  return (
    <span key={idx} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        onClick={handleCopyEmail}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
}

function renderSegment(props: RenderSegmentProps): ReactNode {
  const { segment, idx } = props;

  switch (segment.type) {
    case 'link':
      return <LinkSegment key={idx} {...props} />;
    case 'call':
      return <CallSegment key={idx} {...props} />;
    case 'email':
      return <EmailSegment key={idx} {...props} />;
    default:
      return <span key={idx}>{segment.content}</span>;
  }
}

interface ResourceLinkProps {
  href: string;
  children: React.ReactNode;
  onLinkHover?: (rect: DOMRect | null) => void;
  onMobileLinkClick?: (rect: DOMRect) => void;
}

function ResourceLink({ href, children, onLinkHover, onMobileLinkClick }: ResourceLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    // Trigger mobile cursor movement if callback provided
    if (linkRef.current && onMobileLinkClick) {
      onMobileLinkClick(linkRef.current.getBoundingClientRect());
    }
    // Don't prevent default - let the link open normally
  };

  const handleMouseEnter = () => {
    if (linkRef.current && onLinkHover) {
      onLinkHover(linkRef.current.getBoundingClientRect());
    }
  };

  const handleMouseLeave = () => {
    if (onLinkHover) {
      onLinkHover(null);
    }
  };

  return (
    <a
      ref={linkRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'underline' }}
      className="hover:opacity-70 transition-opacity"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </a>
  );
}

export const HoverTextBlock = forwardRef<HTMLDivElement, HoverTextBlockProps>(
  function HoverTextBlock({ position, content, zone, isJustPlaced = false, isDragging = false, onLinkHover, onMobileLinkClick }, ref) {
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

    const blockWidth = isHorizontalZone ? (isMobile ? 350 : 350) : undefined;

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
          renderSegment({
            segment,
            idx,
            isJustPlaced,
            isDragging,
            onEmailCopied: handleEmailCopied,
            copiedIdx,
            onLinkHover,
            onMobileLinkClick,
          })
        )}
        {/* Resources section - only shown when placed */}
        {!isDragging && isHorizontalZone && (
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              marginTop: '0.75rem',
            }}
          >
            <div>Resources:</div>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
              }}
            >
              <ResourceLink href="http://are.na/final-research/channels" onLinkHover={onLinkHover} onMobileLinkClick={onMobileLinkClick}>
                Are.na
              </ResourceLink>
              <ResourceLink href="https://instagram.com/final.research" onLinkHover={onLinkHover} onMobileLinkClick={onMobileLinkClick}>
                Instagram
              </ResourceLink>
            </div>
          </div>
        )}
      </div>
    );
  }
);
