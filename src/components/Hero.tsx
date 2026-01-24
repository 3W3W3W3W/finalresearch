'use client';

import { useGyroscope } from '@/hooks/useGyroscope';

export default function Hero() {
  const { supported, hasPermission, requestPermission } = useGyroscope();

  return (
    <section className="w-full h-screen relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <div className="text-center text-white max-w-2xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Welcome
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
