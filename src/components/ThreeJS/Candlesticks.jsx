import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Candlesticks({ count = 12, opacityMult = 1, theme = 'light', isDashboard = false }) {
  const groupRef = useRef();

  // Create refined, smaller micro-candlesticks structured on the outer margins/flanks
  // Wide clear center corridor so central cards remain completely legible
  const candles = useMemo(() => {
    const half = Math.ceil(count / 2);
    const list = [];

    // Far Left flank series (x: -11.5 to -5.5)
    for (let i = 0; i < half; i++) {
      const isBullish = i % 3 !== 0;
      // Smaller, sleeker candle heights (0.28 to 0.68)
      const height = 0.28 + ((i * 37) % 100) / 100 * 0.4;
      const wickHeight = height + 0.22 + ((i * 17) % 100) / 100 * 0.32;
      const x = -11.5 + (i * 0.95);
      const y = -2.5 + Math.sin(i * 0.75) * 0.5 + (i * 0.1);
      const z = -5.0 - (i % 3) * 1.2;

      list.push({
        isBullish,
        height,
        wickHeight,
        position: [x, y, z],
        speed: 0.12 + ((i * 13) % 10) * 0.015,
        offset: i * 0.7,
      });
    }

    // Far Right flank series (x: 5.5 to 11.5)
    for (let i = 0; i < count - half; i++) {
      const isBullish = i % 2 === 0;
      // Smaller, sleeker candle heights (0.28 to 0.65)
      const height = 0.28 + ((i * 43) % 100) / 100 * 0.37;
      const wickHeight = height + 0.2 + ((i * 23) % 100) / 100 * 0.3;
      const x = 5.6 + (i * 0.95);
      const y = -2.3 + Math.cos(i * 0.75) * 0.5 + (i * 0.08);
      const z = -5.0 - (i % 3) * 1.3;

      list.push({
        isBullish,
        height,
        wickHeight,
        position: [x, y, z],
        speed: 0.11 + ((i * 19) % 10) * 0.015,
        offset: i * 0.8 + 2.0,
      });
    }

    return list;
  }, [count]);

  const bullishColor = theme === 'light' ? '#0D5C53' : '#00d4aa';
  const bearishColor = theme === 'light' ? '#dc2626' : '#ef4444';
  const wickColor = theme === 'light' ? '#4A635E' : '#64748b';

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    groupRef.current.children.forEach((candle, i) => {
      const data = candles[i];
      if (!data) return;
      candle.position.y = data.position[1] + Math.sin(time * data.speed + data.offset) * 0.14;
      candle.rotation.y = Math.sin(time * 0.15 + data.offset) * 0.1;
    });
  });

  return (
    <group ref={groupRef}>
      {candles.map((data, i) => (
        <group key={i} position={data.position}>
          {/* Small Sleek Candle Body */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.16, data.height, 0.16]} />
            <meshStandardMaterial 
              color={data.isBullish ? bullishColor : bearishColor} 
              transparent
              opacity={0.65 * opacityMult}
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
          {/* Delicate Wick */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.01, 0.01, data.wickHeight, 6]} />
            <meshStandardMaterial 
              color={wickColor}
              transparent
              opacity={0.45 * opacityMult}
              roughness={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
