'use client';

import React, { useEffect, useRef } from 'react';
import { TOTAL_FRAMES, START_FRAME, getFramePath } from '@/lib/constants';

interface DragonFallbackCanvasProps {
  scrollProgressRef: React.MutableRefObject<number>;
  onLoadProgress: (pct: number) => void;
  onLoaded: () => void;
  onFrameChange?: (frame: number) => void;
}

export const DragonFallbackCanvas: React.FC<DragonFallbackCanvasProps> = ({
  scrollProgressRef,
  onLoadProgress,
  onLoaded,
  onFrameChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const displayedFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const isLoadedRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  // Helper to find nearest loaded image
  const getNearestImage = (idx: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    if (images[idx]?.complete && images[idx]!.naturalWidth > 0) {
      return images[idx];
    }
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = idx - offset;
      if (prev >= 0 && images[prev]?.complete && images[prev]!.naturalWidth > 0) {
        return images[prev];
      }
      const next = idx + offset;
      if (next < TOTAL_FRAMES && images[next]?.complete && images[next]!.naturalWidth > 0) {
        return images[next];
      }
    }
    return null;
  };

  const drawFrame = (frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Fill background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    const clampedIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIdx)));
    const img = getNearestImage(clampedIdx);
    if (!img) return;

    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;
    const isMobilePortrait = w < 768 && h > w;

    // In mobile portrait, scale and center at y ~ 28% so dragon stays visible above bottom content cards
    const scale = isMobilePortrait
      ? Math.min((w * 0.98) / iw, (h * 0.44) / ih)
      : Math.min(w / iw, h / ih);

    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (w - dw) / 2;
    const dy = isMobilePortrait ? h * 0.28 - dh / 2 : (h - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);

    if (onFrameChange) {
      onFrameChange(START_FRAME + clampedIdx);
    }
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(displayedFrameRef.current);
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Preload frames in batches
    let loadedCount = 0;
    let hasNotifiedReady = false;
    const images = imagesRef.current;

    // First load frame 0 immediately
    const img0 = new Image();
    img0.onload = () => {
      images[0] = img0;
      loadedCount++;
      drawFrame(0);
    };
    img0.src = getFramePath(START_FRAME);

    const batchSize = 10;
    let nextIdx = 1;

    const loadNext = () => {
      if (nextIdx >= TOTAL_FRAMES) return;
      const idx = nextIdx++;
      const frameNum = START_FRAME + idx;
      const img = new Image();

      const onDone = () => {
        loadedCount++;
        const pct = (loadedCount / TOTAL_FRAMES) * 100;
        onLoadProgress(pct);

        if (!hasNotifiedReady && (loadedCount >= 28 || pct >= 25)) {
          hasNotifiedReady = true;
          isLoadedRef.current = true;
          onLoaded();
        }
        loadNext();
      };

      img.onload = () => {
        images[idx] = img;
        onDone();
      };
      img.onerror = () => {
        onDone();
      };
      img.src = getFramePath(frameNum);
    };

    for (let b = 0; b < batchSize; b++) {
      loadNext();
    }

    // Animation lerp loop
    const renderLoop = () => {
      // Map scroll progress to target frame index
      const progress = scrollProgressRef.current;
      targetFrameRef.current = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, progress * (TOTAL_FRAMES - 1))
      );

      const diff = targetFrameRef.current - displayedFrameRef.current;
      if (Math.abs(diff) > 0.01) {
        displayedFrameRef.current += diff * 0.22;
        drawFrame(displayedFrameRef.current);
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed-stage-wrap">
      <canvas
        ref={canvasRef}
        id="dragonCanvas"
        aria-label="Ancient Cosmic Dragon Scroll Animation"
      />
    </div>
  );
};

export default DragonFallbackCanvas;
