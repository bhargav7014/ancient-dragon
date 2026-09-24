'use client';

import React from 'react';

interface LoaderProps {
  progress: number;
  isLoaded: boolean;
  statusText?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  progress,
  isLoaded,
  statusText = 'PRELOADING ASSETS',
}) => {
  return (
    <div
      className={`loader-root ${isLoaded ? 'loader-hidden' : ''}`}
      aria-hidden={isLoaded}
    >
      <div className="loader-content">
        <div className="loader-title">DRACONIS</div>
        <div className="loader-bar-wrap">
          <div
            className="loader-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        <div className="loader-meta">
          <span>{statusText}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

export default Loader;
