import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="contact-section" id="contact">
      <div className="wrap">
        <div className="contact-shell">
          <div className="roofline" aria-hidden="true" />
          <div className="contact-grid">
            <div>
              <p className="eyebrow">LET&apos;S WORK TOGETHER</p>
              <h2>Have a campaign, visual idea, or digital problem to solve?</h2>
              <p>Let’s turn it into something clear, useful, and ready to launch.</p>
            </div>

            <nav className="contact-links" aria-label="Contact links">
              <a href="https://wa.me/62XXXXXXXXXXX" target="_blank" rel="noreferrer">
                WhatsApp <span aria-hidden="true">↗</span>
              </a>
              <a href="mailto:your@email.com">
                Email <span aria-hidden="true">↗</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                Instagram <span aria-hidden="true">↗</span>
              </a>
              <a href="/cv.pdf" download>
                Download CV <span aria-hidden="true">↓</span>
              </a>
            </nav>
          </div>

          <div className="contact-bottom">
            <span>GADING</span>
            <span>MARKETING COMMUNICATION · DESIGN · ADS · WEB</span>
            <span>{currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
