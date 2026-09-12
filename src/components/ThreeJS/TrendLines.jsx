import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export default function TrendLines({ opacityMult = 1, theme = 'light', isMobile = false }) {
  const lineRef1 = useRef();
  const lineRef2 = useRef();
  const lineRef3 = useRef();
  const lineRef4 = useRef();

  const step = isMobile ? 1.6 : 0.8;

  // 1. Primary Bullish Trend Line (Signature Teal/Emerald) - spans full screen width (-28 to +28)
  const points1 = useMemo(() => {
    const pts = [];
    for (let x = -28; x <= 28; x += step) {
      const y = -2.4 + ((x + 28) / 56) * 1.8 + Math.sin(x * 0.35) * 0.45 + Math.cos(x * 0.18) * 0.25;
      pts.push(new THREE.Vector3(x, y, -6.0));
    }
    return pts;
  }, [step]);

  // 2. Secondary Harmonic Moving Average Line (Sage / Sky) - spans full screen width (-28 to +28)
  const points2 = useMemo(() => {
    const pts = [];
    for (let x = -28; x <= 28; x += step) {
      const y = -2.9 + ((x + 28) / 56) * 1.4 + Math.cos(x * 0.28) * 0.4 + Math.sin(x * 0.14) * 0.2;
      pts.push(new THREE.Vector3(x, y, -7.5));
    }
    return pts;
  }, [step]);

  // 3. Fast Momentum Signal Line (Market Green) - spans full screen width (-28 to +28)
  const points3 = useMemo(() => {
    const pts = [];
    for (let x = -28; x <= 28; x += step) {
      const y = -2.1 + ((x + 28) / 56) * 2.1 + Math.sin(x * 0.48 + 1.2) * 0.55 + Math.cos(x * 0.22) * 0.3;
      pts.push(new THREE.Vector3(x, y, -8.5));
    }
    return pts;
  }, [step]);

  // 4. Long-Term Deep Horizon Support Line (Slate / Teal) - spans full screen width (-28 to +28)
  const points4 = useMemo(() => {
    const pts = [];
    for (let x = -28; x <= 28; x += step) {
      const y = -3.3 + ((x + 28) / 56) * 1.0 + Math.cos(x * 0.2 + 2.0) * 0.35 + Math.sin(x * 0.1) * 0.25;
      pts.push(new THREE.Vector3(x, y, -10.0));
    }
    return pts;
  }, [step]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (lineRef1.current) {
      lineRef1.current.position.y = Math.sin(time * 0.22) * 0.14;
    }
    if (lineRef2.current) {
      lineRef2.current.position.y = Math.cos(time * 0.18 + 0.5) * 0.12;
    }
    if (lineRef3.current) {
      lineRef3.current.position.y = Math.sin(time * 0.26 + 1.0) * 0.15;
    }
    if (lineRef4.current) {
      lineRef4.current.position.y = Math.cos(time * 0.15 + 1.5) * 0.10;
    }
  });

  // Harmonious theme colors
  const color1 = theme === 'light' ? '#0D5C53' : '#00d4aa'; // Signature Teal
  const color2 = theme === 'light' ? '#4A726C' : '#38bdf8'; // Sage / Sky Blue
  const color3 = theme === 'light' ? '#059669' : '#10b981'; // Vibrant Green
  const color4 = theme === 'light' ? '#7A918D' : '#64748b'; // Muted Slate-Teal

  return (
    <group>
      {/* 1. Primary upward trend */}
      <Line
        ref={lineRef1}
        points={points1}
        color={color1}
        lineWidth={2.4}
        transparent
        opacity={0.65 * opacityMult}
        curveType="catmullrom"
        tension={0.4}
      />
      {/* 2. Secondary moving average */}
      <Line
        ref={lineRef2}
        points={points2}
        color={color2}
        lineWidth={1.8}
        transparent
        opacity={0.45 * opacityMult}
        curveType="catmullrom"
        tension={0.4}
      />
      {/* 3. Fast momentum signal line */}
      <Line
        ref={lineRef3}
        points={points3}
        color={color3}
        lineWidth={1.6}
        transparent
        opacity={0.42 * opacityMult}
        curveType="catmullrom"
        tension={0.4}
      />
      {/* 4. Deep horizon baseline support */}
      <Line
        ref={lineRef4}
        points={points4}
        color={color4}
        lineWidth={1.4}
        transparent
        opacity={0.32 * opacityMult}
        curveType="catmullrom"
        tension={0.4}
      />
    </group>
  );
}
