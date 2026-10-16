import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicSite,getSiteDocument } from '@/lib/db/site';
import { verifyAdminSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
export const dynamic='force-dynamic';

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

export default async function CvPage({searchParams}:{searchParams:Promise<{preview?:string}>}) {
  const preview=(await searchParams).preview==='1';if(preview&&!await verifyAdminSession())redirect('/admintgadink');
  const site=preview?(await getSiteDocument()).draft:await getPublicSite();const {cv,values}=site;
  return (
    <article className="cv-page">
      <header className="cv-header">
        <div>
          <p className="cv-kicker">Creative Marketing · Design · Technology</p>
          <h1>{cv.name}</h1>
          <p className="cv-role">{cv.role}</p>
        </div>
        <div className="cv-actions">
          <a href={preview?'/api/cv?preview=1':'/api/cv'} className="button button--primary">Download PDF</a>
          <Link href="/" className="button button--secondary">Portfolio</Link>
        </div>
      </header>

      <section>
        <h2>Profile</h2>
        <p>{cv.profile}</p>
      </section>

      <section>
        <h2>Selected Experience</h2>
        <div className="cv-list">
          {cv.experience.map(({title:role,period,description}) => (
            <div className="cv-entry" key={role}>
              <div><h3>{role}</h3><p>{period}</p></div>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Core Capabilities</h2>
        <p>{cv.capabilities}</p>
      </section>

      <footer className="cv-footer">
        <a href={values.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
        <a href={values.instagram} target="_blank" rel="noreferrer">{values.instagramLabel}</a>
      </footer>
    </article>
  );
}
