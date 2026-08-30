import React from 'react';

interface WebAppItem {
  label: string;
  title: string;
  problem: string;
  solution: string;
  image: string;
}

const APPS: WebAppItem[] = [
  {
    label: 'GAMIFICATION TOOL',
    title: 'PROGRAM MBG Leaderboard',
    problem: 'Agent activities and reward points were difficult to monitor.',
    solution: 'Real-time leaderboard, activity history, and point redemption.',
    image: 'https://picsum.photos/id/1/600/400',
  },
  {
    label: 'OPERATIONS TOOL',
    title: 'Trip Planner Dashboard',
    problem: 'Budget, rundown, tools, and consumption data were separated.',
    solution: 'One dashboard for planning and tracking group trips.',
    image: 'https://picsum.photos/id/2/600/400',
  },
  {
    label: 'REPORTING TOOL',
    title: 'Meta Ads Recap',
    problem: 'Campaign data required repetitive manual recap.',
    solution: 'A structured dashboard for spend, responses, CTR, CPC, and CPM.',
    image: 'https://picsum.photos/id/3/600/400',
  },
  {
    label: 'PRODUCTION TOOL',
    title: 'Watermark Generator',
    problem: 'Adding logos to multiple assets took too much time.',
    solution: 'A tool to upload, preview, watermark, save, and download campaign assets.',
    image: 'https://picsum.photos/id/4/600/400',
  },
];

export function Apps() {
  return (
    <section className="apps-section" id="web-apps" aria-labelledby="apps-title">
      <div className="wrap">
        <header className="section-heading">
          <div>
            <p className="eyebrow">TOOLS BUILT FOR REAL WORK</p>
            <h2 id="apps-title">Web apps created to remove repetitive work.</h2>
          </div>
          <p className="section-intro">
            Each tool started from a real operational problem and became a focused system used to organize data, speed
            up tasks, or improve participation.
          </p>
        </header>

        <div className="apps-grid">
          {APPS.map((app, index) => (
            <article key={index} className="app-card">
              <div className="project-preview" style={{ aspectRatio: '16 / 9' }}>
                <img src={app.image} alt={app.title} loading="lazy" />
              </div>
              <div className="app-card__body">
                <p className="card-label">{app.label}</p>
                <h3>{app.title}</h3>
                <dl>
                  <div>
                    <dt>Problem</dt>
                    <dd>{app.problem}</dd>
                  </div>
                  <div>
                    <dt>Solution</dt>
                    <dd>{app.solution}</dd>
                  </div>
                </dl>
                <a href="#recent-works" className="app-link" aria-label={`Open ${app.title} preview`}>
                  OPEN PREVIEW <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
