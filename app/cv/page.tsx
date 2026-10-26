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

function CVDescription({text}:{text:string}) {
  const lines=text.split('\n').map(line=>line.trim()).filter(Boolean);
  return lines.length>1 ? <ul className="cv-bullets">{lines.map((line,index)=><li key={index}>{line}</li>)}</ul> : <p>{text}</p>;
}

export default async function CvPage({searchParams}:{searchParams:Promise<{preview?:string}>}) {
  const preview=(await searchParams).preview==='1';if(preview&&!await verifyAdminSession())redirect('/admintgadink');
  const site=preview?(await getSiteDocument()).draft:await getPublicSite();const {cv,values}=site;
  return (
    <article className="cv-page" lang="en">
      <header className="cv-header">
        <div>
          <h1>{cv.name}</h1>
          <p className="cv-role">{cv.role}</p>
          <div className="cv-contact">
            {cv.phone && <a href={`tel:${cv.phone.replace(/[^+\d]/g,'')}`}>{cv.phone}</a>}
            {cv.email && <a href={`mailto:${cv.email}`}>{cv.email}</a>}
            {cv.website && <a href={cv.website} target="_blank" rel="noreferrer">{cv.website.replace(/^https?:\/\//,'')}</a>}
            {cv.location && <span>{cv.location}</span>}
          </div>
        </div>
        <div className="cv-actions">
          <a href={preview?'/api/cv?preview=1':'/api/cv'} download className="button button--primary">Download PDF</a>
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
              <CVDescription text={description}/>
            </div>
          ))}
        </div>
      </section>

      {!!cv.education?.length && <section>
        <h2>Education</h2>
        <div className="cv-list">{cv.education.map(({title,period,description},index)=><div className="cv-entry" key={index}>
          <div><h3>{title}</h3><p>{period}</p></div><CVDescription text={description}/>
        </div>)}</div>
      </section>}

      <section>
        <h2>Core Capabilities</h2>
        <p>{cv.capabilities}</p>
      </section>
      {cv.languages && <section><h2>Languages</h2><p>{cv.languages}</p></section>}

      <footer className="cv-footer">
        <a href={values.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
        <a href={values.instagram} target="_blank" rel="noreferrer">{values.instagramLabel}</a>
      </footer>
    </article>
  );
}
