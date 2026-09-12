import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export default function DataParticles({ count = 130, opacityMult = 1, theme = 'light' }) {
  const pointsRef = useRef();

  // Create particles placed randomly along the financial grid lines & intersections
  const { positions, speeds, directions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const dir = new Uint8Array(count); // 0: along Z gridline, 1: along X gridline, 2: stationary on intersection

    for (let i = 0; i < count; i++) {
      const type = Math.random();
      let x, y, z;

      if (type < 0.55) {
        // Aligned along a Z gridline (runs forward/backward)
        // Snapped to integer x (e.g. -16, -15, ... 15, 16)
        x = Math.round((Math.random() - 0.5) * 36);
        y = -2.76 + (Math.random() * 0.05); // resting right on the y = -2.8 grid plane
        z = -4.5 + (Math.random() - 0.5) * 30;
        dir[i] = 0;
        spd[i] = 0.5 + Math.random() * 0.8; // moves forward along Z
      } else if (type < 0.85) {
        // Aligned along an X gridline (runs left/right)
        // Snapped to integer z relative to grid center (-4.5)
        z = -4.5 + Math.round((Math.random() - 0.5) * 26);
        y = -2.76 + (Math.random() * 0.05);
        x = (Math.random() - 0.5) * 36;
        dir[i] = 1;
        spd[i] = (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.6); // moves along X
      } else {
        // Placed directly on grid line intersections
        x = Math.round((Math.random() - 0.5) * 36);
        z = -4.5 + Math.round((Math.random() - 0.5) * 26);
        y = -2.75;
        dir[i] = 2;
        spd[i] = 0.05; // gentle pulse
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }

    return { positions: pos, speeds: spd, directions: dir };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array;
    const clampedDelta = Math.min(delta, 0.1);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const d = directions[i];
      const s = speeds[i];

      if (d === 0) {
        // Flowing forward along Z grid line towards camera, then wraps back
        array[i3 + 2] += s * clampedDelta * 2.2;
        if (array[i3 + 2] > 7) {
          array[i3 + 2] = -22;
          array[i3] = Math.round((Math.random() - 0.5) * 36); // re-snap to a grid line
        }
      } else if (d === 1) {
        // Flowing along X grid lines laterally
        array[i3] += s * clampedDelta * 1.6;
        if (array[i3] > 18) array[i3] = -18;
        if (array[i3] < -18) array[i3] = 18;
      } else {
        // Intersection subtle breathing pulse
        const time = state.clock.getElapsedTime();
        array[i3 + 1] = -2.75 + Math.sin(time * 2 + i) * 0.035;
      }
    }

    posAttr.needsUpdate = true;
  });

  const particleColor = theme === 'light' ? '#0D5C53' : '#00d4aa';

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={theme === 'light' ? 0.095 : 0.085}
        color={particleColor}
        transparent
        opacity={(theme === 'light' ? 0.8 : 0.7) * opacityMult}
        sizeAttenuation={true}
      />
    </points>
  );
}
