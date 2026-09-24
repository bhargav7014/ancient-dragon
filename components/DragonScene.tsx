'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getCameraPose, getLightingState, lerp } from '@/lib/animations';
import DragonModel from './DragonModel';

interface DragonSceneProps {
  scrollProgressRef: React.MutableRefObject<number>;
  is3DModelAvailable: boolean;
  on3DModelLoaded: () => void;
  on3DModelError: () => void;
}

// Interactive Camera Rig with Scroll & Parallax
function CameraRig({
  scrollProgressRef,
  isMobile,
}: {
  scrollProgressRef: React.MutableRefObject<number>;
  isMobile: boolean;
}) {
  const { camera } = useThree();
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.x = x * 0.25;
      mouseRef.current.y = y * 0.18;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  useFrame(() => {
    const progress = scrollProgressRef.current;
    const pose = getCameraPose(progress, isMobile);

    const targetX = pose.x + (isMobile ? 0 : mouseRef.current.x);
    const targetY = pose.y + (isMobile ? 0 : mouseRef.current.y);
    const targetZ = pose.z;

    camera.position.x = lerp(camera.position.x, targetX, 0.08);
    camera.position.y = lerp(camera.position.y, targetY, 0.08);
    camera.position.z = lerp(camera.position.z, targetZ, 0.08);

    camera.lookAt(pose.lookAtX, pose.lookAtY, pose.lookAtZ);
  });

  return null;
}

// Dynamic Cinematic Lighting Rig
function LightingRig({
  scrollProgressRef,
}: {
  scrollProgressRef: React.MutableRefObject<number>;
}) {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    const progress = scrollProgressRef.current;
    const lighting = getLightingState(progress);

    if (keyLightRef.current) {
      keyLightRef.current.intensity = lerp(keyLightRef.current.intensity, lighting.keyIntensity, 0.1);
      keyLightRef.current.color.set(lighting.keyColor);
    }
    if (rimLightRef.current) {
      rimLightRef.current.intensity = lerp(rimLightRef.current.intensity, lighting.rimIntensity, 0.1);
      rimLightRef.current.color.set(lighting.rimColor);
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = lerp(fillLightRef.current.intensity, lighting.fillIntensity, 0.1);
      fillLightRef.current.color.set(lighting.fillColor);
    }
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = lerp(ambientLightRef.current.intensity, lighting.ambientIntensity, 0.1);
    }
  });

  return (
    <>
      {/* Ambient background light */}
      <ambientLight ref={ambientLightRef} intensity={0.6} color="#0c192c" />

      {/* Main key light */}
      <directionalLight
        ref={keyLightRef}
        position={[4, 5, 4]}
        intensity={2.2}
        color="#38bdf8"
        castShadow
      />

      {/* Sharp rim backlight */}
      <directionalLight
        ref={rimLightRef}
        position={[-4, 3, -4]}
        intensity={3.5}
        color="#818cf8"
      />

      {/* Soft low fill light */}
      <directionalLight
        ref={fillLightRef}
        position={[0, -3, 2]}
        intensity={0.8}
        color="#0c4a6e"
      />
    </>
  );
}

// Atmospheric Cosmic Stardust Particles
function CosmicStardust({ count = 180 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Cyan to soft starlight white
      const isCyan = Math.random() > 0.4;
      col[i * 3] = isCyan ? 0.35 : 0.85;
      col[i * 3 + 1] = isCyan ? 0.75 : 0.92;
      col[i * 3 + 2] = 1.0;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime() * 0.04;
    pointsRef.current.rotation.y = t * 0.5;
    pointsRef.current.rotation.x = Math.sin(t) * 0.15;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export const DragonScene: React.FC<DragonSceneProps> = ({
  scrollProgressRef,
  is3DModelAvailable,
  on3DModelLoaded,
  on3DModelError,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="r3f-canvas-container">
      <Canvas
        camera={{ position: [0, 0.1, 5.8], fov: 42 }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
      >
        <fog attach="fog" args={['#0a0a0a', 4, 18]} />
        <CameraRig scrollProgressRef={scrollProgressRef} isMobile={isMobile} />
        <LightingRig scrollProgressRef={scrollProgressRef} />
        <CosmicStardust count={isMobile ? 90 : 180} />

        {is3DModelAvailable && (
          <DragonModel
            scrollProgressRef={scrollProgressRef}
            onLoaded={on3DModelLoaded}
            onError={on3DModelError}
          />
        )}
      </Canvas>
    </div>
  );
};

export default DragonScene;
