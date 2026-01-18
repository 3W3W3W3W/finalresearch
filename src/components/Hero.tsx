'use client';

import Image from 'next/image';
import { useGyroscope } from '@/hooks/useGyroscope';
import { ArenaBlock } from '@/lib/arena';
import { CSSProperties } from 'react';

interface HeroProps {
  text?: ArenaBlock;
  image?: ArenaBlock;
}

export default function Hero({ text, image }: HeroProps) {
  const { tilt, supported, hasPermission, requestPermission } = useGyroscope();

  const rotateStyle: CSSProperties = supported
    ? {
        transform: `rotateX(${tilt.x * 0.1}deg) rotateY(${tilt.y * 0.1}deg)`,
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d',
      }
    : {};

  return (
    <section className="w-full h-screen relative overflow-hidden">
      {image && image.image && (
        <div style={rotateStyle} className="w-full h-full">
          <Image
            src={image.image.display.url}
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <div className="text-center text-white max-w-2xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            {text?.content || 'Welcome'}
          </h1>

          {supported && !hasPermission && (
            <button
              onClick={requestPermission}
              className="mt-6 px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
            >
              Enable Gyroscope
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
