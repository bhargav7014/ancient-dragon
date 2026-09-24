'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { STAGES, TOTAL_FRAMES, START_FRAME } from '@/lib/constants';
import Navbar from './Navbar';
import HUD from './HUD';
import Loader from './Loader';
import Hero from './Hero';
import Section from './Section';
import DragonFallbackCanvas from './DragonFallbackCanvas';

// Dynamically import DragonScene with SSR disabled to prevent Three.js window issues
const DragonScene = dynamic(() => import('./DragonScene'), { ssr: false });

export const ScrollExperience: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<number>(0);

  // Loading states
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // 3D Model availability
  const [is3DModelAvailable, setIs3DModelAvailable] = useState<boolean>(false);
  const [is3DLoaded, setIs3DLoaded] = useState<boolean>(false);

  // HUD active stage and frame state
  const [currentStageName, setCurrentStageName] = useState<string>('STAGE 01 // PRIMORDIAL');
  const [currentStageShort, setCurrentStageShort] = useState<string>('STAGE 01');
  const [currentFrameNum, setCurrentFrameNum] = useState<number>(START_FRAME);
  const [scrollProgressState, setScrollProgressState] = useState<number>(0);
  const [activeSectionId, setActiveSectionId] = useState<string>('hero');

  // Check if 3D model .glb exists
  useEffect(() => {
    fetch('/models/dragon.glb', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setIs3DModelAvailable(true);
        } else {
          setIs3DModelAvailable(false);
        }
      })
      .catch(() => {
        setIs3DModelAvailable(false);
      });
  }, []);

  // Initialize GSAP ScrollTrigger
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    if (!container) return;

    // Create main scrub timeline
    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.15, // Ultra-responsive scrub without floaty artificial lag
      onUpdate: (self) => {
        const p = self.progress;
        scrollProgressRef.current = p;
        setScrollProgressState(p);

        // Calculate absolute frame
        const frameIdx = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.round(p * (TOTAL_FRAMES - 1)))
        );
        const absFrame = START_FRAME + frameIdx;
        setCurrentFrameNum(absFrame);

        // Update stage indicators based on frame
        for (const s of STAGES) {
          if (absFrame >= s.frameStart && absFrame <= s.frameEnd) {
            setCurrentStageName(s.name);
            setCurrentStageShort(s.shortName);
            break;
          }
        }
      },
    });

    // Update active nav link based on section scroll positions
    const sectionIds = ['hero', 'stage1', 'stage2', 'stage3', 'stage4', 'final'];
    const sectionTriggers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveSectionId(id),
        onEnterBack: () => setActiveSectionId(id),
      });
    });

    return () => {
      st.kill();
      sectionTriggers.forEach((t) => t?.kill());
    };
  }, []);

  const handleNavigate = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleCtaClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="experience-root">
      {/* Cinematic Preloader */}
      <Loader
        progress={loadProgress}
        isLoaded={isLoaded}
        statusText={is3DModelAvailable ? 'PRELOADING 3D ASSETS' : 'PRELOADING FRAMES'}
      />

      {/* Top Navbar */}
      <Navbar
        currentStageName={currentStageShort}
        activeSection={activeSectionId}
        onNavigate={handleNavigate}
        is3DMode={is3DModelAvailable && is3DLoaded}
      />

      {/* HUD Info Readouts & Top Progress */}
      <HUD
        stageFullName={currentStageName}
        frameNumber={currentFrameNum}
        totalFrames={TOTAL_FRAMES}
        scrollProgress={scrollProgressState}
        is3DMode={is3DModelAvailable && is3DLoaded}
      />

      {/* Fixed Background Experience (Pinned 3D Scene & Fallback Engine) */}
      <div className="fixed-stage-wrap">
        {/* If 3D model is not active/ready, the 264-frame canvas runs */}
        {(!is3DModelAvailable || !is3DLoaded) && (
          <DragonFallbackCanvas
            scrollProgressRef={scrollProgressRef}
            onLoadProgress={(pct) => setLoadProgress(pct)}
            onLoaded={() => setIsLoaded(true)}
            onFrameChange={(frame) => setCurrentFrameNum(frame)}
          />
        )}

        {/* React Three Fiber Scene for 3D Dragon, Cosmic Stardust & Lighting */}
        <DragonScene
          scrollProgressRef={scrollProgressRef}
          is3DModelAvailable={is3DModelAvailable}
          on3DModelLoaded={() => {
            setIs3DLoaded(true);
            setIsLoaded(true);
            setLoadProgress(100);
          }}
          on3DModelError={() => {
            setIs3DLoaded(false);
          }}
        />

        {/* Ambient Dark Vignette */}
        <div className="canvas-vignette" />
      </div>

      {/* Scrollable Story Container */}
      <main className="scroll-wrapper" ref={containerRef} id="scrollContainer">
        {/* 1. Hero */}
        <Hero onScrollClick={() => handleNavigate('stage1')} />

        {/* 2. Stage 1 - Primordial Form */}
        <Section
          id={STAGES[0].id}
          eyebrow={`[ ${STAGES[0].number} // ${STAGES[0].code} ] — FRAMES 007–070`}
          title={STAGES[0].title}
          description={STAGES[0].description}
          alignment={STAGES[0].alignment}
        />

        {/* 3. Stage 2 - Core Ignition */}
        <Section
          id={STAGES[1].id}
          eyebrow={`[ ${STAGES[1].number} // ${STAGES[1].code} ] — FRAMES 071–140`}
          title={STAGES[1].title}
          description={STAGES[1].description}
          alignment={STAGES[1].alignment}
        />

        {/* 4. Stage 3 - Wing Spread */}
        <Section
          id={STAGES[2].id}
          eyebrow={`[ ${STAGES[2].number} // ${STAGES[2].code} ] — FRAMES 141–210`}
          title={STAGES[2].title}
          description={STAGES[2].description}
          alignment={STAGES[2].alignment}
        />

        {/* 5. Stage 4 - Celestial Sovereign */}
        <Section
          id={STAGES[3].id}
          eyebrow={`[ ${STAGES[3].number} // ${STAGES[3].code} ] — FRAMES 211–270`}
          title={STAGES[3].title}
          description={STAGES[3].description}
          alignment={STAGES[3].alignment}
        />

        {/* 6. Final Section - Ascension Complete */}
        <Section
          id="final"
          eyebrow="ASCENSION COMPLETE"
          title="ENTER THE VOID"
          description="The metamorphosis is fulfilled. You have traversed the full continuum of ancient starlight. Step through the gate of cosmic remembrance."
          alignment="center"
          isFinal
          onCtaClick={handleCtaClick}
        />
      </main>

      {/* Site Footer */}
      <footer className="site-footer">
        <span>DRACONIS © 2026 // SCROLL CINEMATIC</span>
        <span>INSPIRED BY JUNNI & ANCIENT DRAGON</span>
        <span>{is3DModelAvailable && is3DLoaded ? 'REALTIME 3D SCENE' : 'ALL FRAMES RENDERED REALTIME'}</span>
      </footer>
    </div>
  );
};

export default ScrollExperience;
