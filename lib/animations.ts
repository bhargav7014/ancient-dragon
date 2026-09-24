import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins safely on client
export function initGSAP() {
  if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Map scroll progress (0..1) to 3D Camera choreography
export interface CameraPose {
  x: number;
  y: number;
  z: number;
  lookAtX: number;
  lookAtY: number;
  lookAtZ: number;
  fov: number;
}

export function getCameraPose(progress: number, isMobile: boolean): CameraPose {
  // Mobile uses slightly higher and further back perspective so dragon is centered in top 40%
  if (isMobile) {
    return {
      x: Math.sin(progress * Math.PI) * 0.4,
      y: 0.8 - progress * 0.3,
      z: 6.8 - Math.sin(progress * Math.PI) * 0.8,
      lookAtX: 0,
      lookAtY: 0.2,
      lookAtZ: 0,
      fov: 46,
    };
  }

  // Desktop choreography:
  // Early (0 - 0.2): camera slightly farther, centered
  // Stage 1 (0.2 - 0.4): text is left, camera subtly pans right to balance
  // Stage 2 (0.4 - 0.6): text is right, camera subtly pans left, moves closer
  // Stage 3 (0.6 - 0.8): wings expand, camera sweeps with a dynamic angle
  // Sovereign (0.8 - 1.0): epic cinematic center frame
  let x = 0;
  let y = 0.1;
  let z = 5.8;

  if (progress < 0.25) {
    const t = progress / 0.25;
    x = lerp(0, 0.3, t);
    y = lerp(0.1, 0.2, t);
    z = lerp(5.8, 5.2, t);
  } else if (progress < 0.5) {
    const t = (progress - 0.25) / 0.25;
    x = lerp(0.3, -0.4, t);
    y = lerp(0.2, -0.05, t);
    z = lerp(5.2, 4.8, t);
  } else if (progress < 0.75) {
    const t = (progress - 0.5) / 0.25;
    x = lerp(-0.4, 0.4, t);
    y = lerp(-0.05, 0.15, t);
    z = lerp(4.8, 5.0, t);
  } else {
    const t = (progress - 0.75) / 0.25;
    x = lerp(0.4, 0, t);
    y = lerp(0.15, 0.05, t);
    z = lerp(5.0, 5.5, t);
  }

  return {
    x,
    y,
    z,
    lookAtX: 0,
    lookAtY: 0,
    lookAtZ: 0,
    fov: 42,
  };
}

// Lighting setup parameters according to transformation stage
export interface LightingState {
  keyIntensity: number;
  keyColor: string;
  rimIntensity: number;
  rimColor: string;
  fillIntensity: number;
  fillColor: string;
  ambientIntensity: number;
  coreGlowIntensity: number;
}

export function getLightingState(progress: number): LightingState {
  // Primordial: deep celestial cyan & cool blue
  // Ignition: intense stellar white-cyan core with warm thermal surge
  // Wing spread: auroral violet & energetic cyan
  // Sovereign: imperial astral gold & brilliant starlight
  if (progress < 0.25) {
    return {
      keyIntensity: 2.2,
      keyColor: '#38bdf8',
      rimIntensity: 3.5,
      rimColor: '#818cf8',
      fillIntensity: 0.8,
      fillColor: '#0c4a6e',
      ambientIntensity: 0.6,
      coreGlowIntensity: 1.0,
    };
  } else if (progress < 0.5) {
    return {
      keyIntensity: 3.2,
      keyColor: '#e0f2fe',
      rimIntensity: 4.5,
      rimColor: '#38bdf8',
      fillIntensity: 1.2,
      fillColor: '#0369a1',
      ambientIntensity: 0.7,
      coreGlowIntensity: 2.5,
    };
  } else if (progress < 0.75) {
    return {
      keyIntensity: 3.8,
      keyColor: '#a78bfa',
      rimIntensity: 5.0,
      rimColor: '#38bdf8',
      fillIntensity: 1.4,
      fillColor: '#4338ca',
      ambientIntensity: 0.8,
      coreGlowIntensity: 3.2,
    };
  } else {
    return {
      keyIntensity: 4.2,
      keyColor: '#ffffff',
      rimIntensity: 5.5,
      rimColor: '#67e8f9',
      fillIntensity: 1.6,
      fillColor: '#312e81',
      ambientIntensity: 0.9,
      coreGlowIntensity: 4.0,
    };
  }
}
