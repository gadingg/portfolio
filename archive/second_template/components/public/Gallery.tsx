'use client';

import React, { useRef, useState, useEffect } from 'react';

interface Slide {
  id: number;
  label: string;
  title: string;
  year: string;
  image: string;
  video: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    label: 'PROPERTY CAMPAIGN',
    title: 'Luxury Property Campaign',
    year: '2026',
    image: 'https://picsum.photos/id/1029/960/540',
    video: 'https://vjs.zencdn.net/v/oceans.mp4',
  },
  {
    id: 2,
    label: 'PERFORMANCE CREATIVE',
    title: 'Meta Ads Motion Creative',
    year: '2026',
    image: 'https://picsum.photos/id/1057/960/540',
    video: 'https://www.w3schools.com/html/movie.mp4',
  },
  {
    id: 3,
    label: 'INTERNAL CAMPAIGN',
    title: 'Internal Event Animation',
    year: '2026',
    image: 'https://picsum.photos/id/1060/960/540',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    id: 4,
    label: 'AI VISUAL',
    title: 'AI Property Transformation',
    year: '2026',
    image: 'https://picsum.photos/id/1080/960/540',
    video: 'https://vjs.zencdn.net/v/oceans.mp4',
  },
  {
    id: 5,
    label: 'SOCIAL MEDIA',
    title: 'Social Media Campaign Visual',
    year: '2026',
    image: 'https://picsum.photos/id/1084/960/540',
    video: 'https://www.w3schools.com/html/movie.mp4',
  },
];

export function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = (index: number) => {
    const next = Math.max(0, Math.min(index, SLIDES.length - 1));
    setActiveIndex(next);
    if (trackRef.current) {
      const slides = trackRef.current.children;
      if (slides[next]) {
        const slide = slides[next] as HTMLElement;
        const targetLeft = slide.offsetLeft - (trackRef.current.clientWidth - slide.clientWidth) / 2;
        trackRef.current.scrollTo({ left: targetLeft, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => goToSlide(activeIndex - 1);
  const handleNext = () => goToSlide(activeIndex + 1);

  return (
    <section className="section gallery-section" id="portfolio-gallery" aria-labelledby="gallery-title">
      <div className="wrap">
        <header className="section-heading">
          <div>
            <p className="eyebrow">VISUAL AND MOTION GALLERY</p>
            <h2 id="gallery-title">Selected visuals in motion.</h2>
          </div>
          <p className="section-intro">
            A moving gallery of campaign visuals, property advertisements, social content, and experimental animation.
          </p>
        </header>
      </div>

      <div className="carousel" tabIndex={0} aria-label="Portfolio gallery carousel">
        <div className="carousel-track" ref={trackRef}>
          {SLIDES.map((slide, idx) => (
            <article
              key={slide.id}
              className={`gallery-slide ${idx === activeIndex ? 'is-active' : ''}`}
            >
              <div className="gallery-media">
                <img src={slide.image} alt={slide.title} loading="lazy" />
                <div className="gallery-caption">
                  <div>
                    <p className="card-label">{slide.label}</p>
                    <h3>{slide.title}</h3>
                  </div>
                  <span>{slide.year}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="carousel-footer wrap">
          <div className="carousel-controls" style={{ marginLeft: 'auto' }}>
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              aria-label="Previous gallery item"
            >
              ←
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }}>
              <strong>{String(activeIndex + 1).padStart(2, '0')}</strong> / 05
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={activeIndex === SLIDES.length - 1}
              aria-label="Next gallery item"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
