'use client';

import React from 'react';

interface HUDProps {
  stageFullName: string;
  frameNumber: number;
  totalFrames: number;
  scrollProgress: number;
  is3DMode?: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  stageFullName,
  frameNumber,
  totalFrames,
  scrollProgress,
  is3DMode = false,
}) => {
  const showScrollHint = scrollProgress < 0.02;

  return (
    <>
      {/* Top 2px Progress Bar */}
      <div
        id="scrollProgressBar"
        style={{ width: `${(scrollProgress * 100).toFixed(2)}%` }}
      />

      {/* Fixed HUD Stage Label */}
      <div className="hud-element" id="hudStage">
        <span className="stage-dot" />
        <span>{stageFullName}</span>
      </div>

      {/* Fixed HUD Frame / Phase Indicator */}
      <div className="hud-element" id="hudFrame">
        <span>
          {is3DMode
            ? `3D PHASE [ ${String(frameNumber).padStart(3, '0')} / ${totalFrames} ]`
            : `FRAME [ ${String(frameNumber).padStart(3, '0')} / ${totalFrames} ]`}
        </span>
      </div>

      {/* Center Bottom Scroll Hint */}
      <div
        id="scrollHint"
        className={showScrollHint ? '' : 'hidden'}
      >
        <span>SCROLL TO EVOLVE</span>
        <div className="scroll-arrow" />
      </div>
    </>
  );
};

export default HUD;
