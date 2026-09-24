'use client';

import React, { useEffect, useRef, useState } from 'react';

interface HeroProps {
  onScrollClick?: () => void;
}

export const Hero: React.FC<HeroProps> = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const titleWords = ['THE', 'ANCIENT', 'DRACONIS'];
  const descWords =
    'Born of deep stellar nebulae and celestial fire. Scroll down to command the continuous evolution from primeval starlight guardian to sovereign cosmic dragon.'.split(
      ' '
    );

  return (
    <section
      ref={sectionRef}
      className={`story-section align-center ${inView ? 'in-view' : ''}`}
      id="hero"
    >
      <div className="content-box">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          <span>ANCIENT COSMIC MANIFESTATION</span>
          <span className="eyebrow-line" />
        </div>

        <h1 className="title-large">
          {titleWords.map((word, i) => (
            <span className="reveal-word" key={i}>
              <span
                className="reveal-inner"
                style={{ transitionDelay: `${0.1 + i * 0.08}s` }}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

        <p className="description">
          {descWords.map((word, i) => (
            <span className="reveal-word" key={i}>
              <span
                className="reveal-inner"
                style={{ transitionDelay: `${0.35 + i * 0.02}s` }}
              >
                {word}
              </span>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
};

export default Hero;
