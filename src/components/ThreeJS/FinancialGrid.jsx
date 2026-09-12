import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

export default function FinancialGrid({ opacityMult = 1, theme = 'light' }) {
  const gridRef1 = useRef();
  const gridRef2 = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (gridRef1.current) {
      gridRef1.current.position.z = (time * 0.3) % 2;
    }
  });

  // High-contrast, clean fintech grid colors for clear visibility in light mode
  const centerColor = theme === 'light' ? '#0D5C53' : '#00d4aa';
  const gridColor = theme === 'light' ? '#4A726C' : '#2A4356';

  useEffect(() => {
    // Increased base opacity in light mode (0.85) so it is crisp and clearly visible against #F4F7F6
    const op = (theme === 'light' ? 0.85 : 0.5) * opacityMult;
    if (gridRef1.current?.material) {
      gridRef1.current.material.transparent = true;
      gridRef1.current.material.opacity = op;
      gridRef1.current.material.depthWrite = false;
      gridRef1.current.material.needsUpdate = true;
    }
    if (gridRef2.current?.material) {
      gridRef2.current.material.transparent = true;
      gridRef2.current.material.opacity = op * 0.6;
      gridRef2.current.material.depthWrite = false;
      gridRef2.current.material.needsUpdate = true;
    }
  }, [theme, opacityMult]);

  return (
    <group position={[0, -2.8, -4.5]}>
      <gridHelper 
        ref={gridRef1}
        args={[54, 54, centerColor, gridColor]} 
        position={[0, 0, 0]}
      />
      {/* Lower subtle layer for perspective depth */}
      <gridHelper 
        ref={gridRef2}
        args={[54, 27, centerColor, gridColor]} 
        position={[0, -0.6, 0]}
      />
    </group>
  );
}
