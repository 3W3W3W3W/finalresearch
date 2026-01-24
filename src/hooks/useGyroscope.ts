'use client';

import { useEffect, useState } from 'react';

export interface GyroscopeTilt {
  x: number;
  y: number;
}

export function useGyroscope() {
  const [tilt, setTilt] = useState<GyroscopeTilt>({ x: 0, y: 0 });
  const [supported, setSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setTilt({
        x: event.beta || 0,
        y: event.gamma || 0,
      });
    };

    if (typeof window !== 'undefined') {
      setSupported(true);

      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        'requestPermission' in DeviceOrientationEvent
      ) {
        setHasPermission(false);
      } else if (typeof DeviceOrientationEvent !== 'undefined') {
        setHasPermission(true);
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  const requestPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      'requestPermission' in DeviceOrientationEvent
    ) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setHasPermission(true);
          window.addEventListener('deviceorientation', (event) => {
            setTilt({
              x: event.beta || 0,
              y: event.gamma || 0,
            });
          });
        }
      } catch (error) {
        console.error('Gyroscope permission denied:', error);
      }
    }
  };

  return { tilt, supported, hasPermission, requestPermission };
}
