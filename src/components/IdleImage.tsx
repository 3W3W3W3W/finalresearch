'use client';

import Image from 'next/image';
import { useIdleDetection } from '@/hooks/useIdleDetection';
import { ArenaBlock } from '@/lib/arena';

interface IdleImageProps {
  image: ArenaBlock | null;
}

export default function IdleImage({ image }: IdleImageProps) {
  const isIdle = useIdleDetection(10000);

  if (!isIdle || !image?.image) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-64 h-64 z-40 animate-fadeIn">
      <Image
        src={image.image.display.url}
        alt="Idle image"
        width={256}
        height={256}
        className="w-full h-full object-cover rounded-lg shadow-lg"
      />
    </div>
  );
}
