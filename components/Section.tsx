'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  alignment?: 'left' | 'right' | 'center';
  isFinal?: boolean;
  onCtaClick?: () => void;
}

export const Section: React.FC<SectionProps> = ({
  id,
  eyebrow,
  title,
  description,
  alignment = 'left',
  isFinal = false,
  onCtaClick,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        } else if (entry.boundingClientRect.top > window.innerHeight) {
          // Reset when scrolling back above
          setInView(false);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const titleWords = title.split(' ');
  const descWords = description.split(' ');

  return (
    <section
      ref={sectionRef}
      className={`story-section align-${alignment} ${inView ? 'in-view' : ''}`}
      id={id}
    >
      <div className="content-box">
        <div className="eyebrow">
          {alignment === 'center' && <span className="eyebrow-line" />}
          <span>{eyebrow}</span>
          {alignment === 'center' && <span className="eyebrow-line" />}
        </div>

        {isFinal ? (
          <h2 className="title-large">
            {titleWords.map((word, i) => (
              <span className="reveal-word" key={i}>
                <span
                  className="reveal-inner"
                  style={{ transitionDelay: `${0.08 + i * 0.08}s` }}
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>
        ) : (
          <h2 className="title-stage">
            {titleWords.map((word, i) => (
              <span className="reveal-word" key={i}>
                <span
                  className="reveal-inner"
                  style={{ transitionDelay: `${0.08 + i * 0.08}s` }}
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>
        )}

        <p className="description">
          {descWords.map((word, i) => (
            <span className="reveal-word" key={i}>
              <span
                className="reveal-inner"
                style={{ transitionDelay: `${0.22 + i * 0.018}s` }}
              >
                {word}
              </span>
            </span>
          ))}
        </p>

        {isFinal && (
          <div>
            <button
              type="button"
              className="pill-btn"
              onClick={onCtaClick}
            >
              <span>Experience the Void</span>
              <span className="pill-btn-icon">→</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Section;
