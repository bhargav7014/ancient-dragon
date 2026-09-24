'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { lerp } from '@/lib/animations';

interface DragonModelProps {
  modelUrl?: string;
  scrollProgressRef: React.MutableRefObject<number>;
  onLoaded?: () => void;
  onError?: (err: any) => void;
}

// Inner model loader component
function GLTFDragon({
  url,
  scrollProgressRef,
  onLoaded,
}: {
  url: string;
  scrollProgressRef: React.MutableRefObject<number>;
  onLoaded?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(url);
  const { actions, names } = useAnimations(gltf.animations, groupRef);

  useEffect(() => {
    if (gltf.scene) {
      // Center and normalize geometry if needed
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (mesh.material) {
            // Enhance contrast and metallic sheen on dark background
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat.roughness !== undefined) {
              mat.roughness = Math.max(0.2, mat.roughness * 0.85);
            }
          }
        }
      });
      if (onLoaded) {
        onLoaded();
      }
    }
  }, [gltf, onLoaded]);

  // Scrub animation action if available
  useEffect(() => {
    if (names.length > 0 && actions[names[0]]) {
      const action = actions[names[0]]!;
      action.play();
      action.paused = true;
    }
  }, [actions, names]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const progress = scrollProgressRef.current;
    const clock = state.clock.getElapsedTime();

    // Subtle breathing float
    const floatY = Math.sin(clock * 1.5) * 0.06;

    // Scroll-driven transforms
    // Rotation Y: subtle rotation sweeping from -0.35 rad to +0.35 rad
    const targetRotY = lerp(-0.4, 0.45, progress);
    const targetRotX = Math.sin(progress * Math.PI) * 0.15;
    const targetScale = lerp(1.8, 2.1, Math.sin(progress * Math.PI));

    groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, targetRotY, 0.1);
    groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, targetRotX, 0.1);
    groupRef.current.position.y = lerp(groupRef.current.position.y, floatY - 0.2, 0.1);
    groupRef.current.scale.setScalar(targetScale);

    // Scrub timeline animation clip if one exists
    if (names.length > 0 && actions[names[0]]) {
      const action = actions[names[0]]!;
      const clipDuration = action.getClip().duration || 1;
      action.time = progress * clipDuration;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// Error Boundary & Availability Checker
export const DragonModel: React.FC<DragonModelProps> = ({
  modelUrl = '/models/dragon.glb',
  scrollProgressRef,
  onLoaded,
  onError,
}) => {
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the model file is accessible
    fetch(modelUrl, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setModelAvailable(true);
        } else {
          setModelAvailable(false);
          if (onError) onError(new Error(`Model not found: ${modelUrl}`));
        }
      })
      .catch((err) => {
        setModelAvailable(false);
        if (onError) onError(err);
      });
  }, [modelUrl, onError]);

  if (modelAvailable === null || !modelAvailable) {
    return null;
  }

  return (
    <GLTFDragon
      url={modelUrl}
      scrollProgressRef={scrollProgressRef}
      onLoaded={onLoaded}
    />
  );
};

export default DragonModel;
