'use client';

import React from 'react';

interface NavbarProps {
  currentStageName?: string;
  activeSection?: string;
  onNavigate?: (id: string) => void;
  is3DMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStageName = 'STAGE 01',
  activeSection = 'hero',
  onNavigate,
  is3DMode = false,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="site-navbar" id="navbar">
      <a
        href="#hero"
        className="nav-brand"
        onClick={(e) => handleClick(e, 'hero')}
      >
        <span className="nav-brand-symbol" />
        <span>DRACONIS</span>
        {is3DMode && <span className="nav-mode-pill">3D ENGINE</span>}
      </a>

      <div className="nav-stage-badge" id="navStageBadge">
        {currentStageName}
      </div>

      <nav>
        <ul className="nav-links">
          <li>
            <a
              href="#stage1"
              className={`nav-link ${activeSection === 'stage1' ? 'active' : ''}`}
              onClick={(e) => handleClick(e, 'stage1')}
            >
              Primordial
            </a>
          </li>
          <li>
            <a
              href="#stage2"
              className={`nav-link ${activeSection === 'stage2' ? 'active' : ''}`}
              onClick={(e) => handleClick(e, 'stage2')}
            >
              Ignition
            </a>
          </li>
          <li>
            <a
              href="#stage3"
              className={`nav-link ${activeSection === 'stage3' ? 'active' : ''}`}
              onClick={(e) => handleClick(e, 'stage3')}
            >
              Ascension
            </a>
          </li>
          <li>
            <a
              href="#stage4"
              className={`nav-link ${activeSection === 'stage4' ? 'active' : ''}`}
              onClick={(e) => handleClick(e, 'stage4')}
            >
              Sovereign
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
