import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CV | R. Gading Utama',
  description: 'Professional profile and selected experience of R. Gading Utama.',
  robots: { index: false, follow: false },
};

const experience = [
  ['Marketing Communication, PropTech & Creative Growth', '2023 to present', 'Menangani creative marketing, Meta Ads, web app internal, dan operational tooling untuk kebutuhan bisnis properti.'],
  ['Owner & Marketing Lead, Kosan Bu Endang', '2023 to present', 'Memimpin renovasi, pemasaran, operasional, dan membangun aplikasi pencatatan sewa.'],
  ['Founder, Geektuku, akkc.id, and Diskonlicious', '2021 to 2023', 'Mengelola branding, pemasaran digital, e-commerce, customer engagement, dan operasi bisnis.'],
];

export default function CvPage() {
  return (
    <article className="cv-page">
      <header className="cv-header">
        <div>
          <p className="cv-kicker">Creative Marketing · Design · Technology</p>
          <h1>R. Gading Utama</h1>
          <p className="cv-role">Creative Marketer & Digital Problem Solver</p>
        </div>
        <div className="cv-actions">
          <a href="/api/cv" className="button button--primary">Download PDF</a>
          <Link href="/" className="button button--secondary">Portfolio</Link>
        </div>
      </header>

      <section>
        <h2>Profile</h2>
        <p>Creative problem solver yang menggabungkan marketing, design, technology, dan AI untuk mengubah kendala bisnis menjadi kampanye, workflow, atau digital tool yang dapat dipakai.</p>
      </section>

      <section>
        <h2>Selected Experience</h2>
        <div className="cv-list">
          {experience.map(([role, period, description]) => (
            <div className="cv-entry" key={role}>
              <div><h3>{role}</h3><p>{period}</p></div>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Core Capabilities</h2>
        <p>Creative marketing, graphic design, Meta Ads, web app development, workflow automation, generative AI, campaign ideation, dan digital operations.</p>
      </section>

      <footer className="cv-footer">
        <a href="https://wa.me/6289653484274" target="_blank" rel="noreferrer">WhatsApp: +62 896-5348-4274</a>
        <a href="https://instagram.com/gadingg_" target="_blank" rel="noreferrer">Instagram: @gadingg_</a>
      </footer>
    </article>
  );
}
