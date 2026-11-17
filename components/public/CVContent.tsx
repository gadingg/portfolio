import Link from 'next/link';
import type {SiteContent} from '@/lib/site';

function CVDescription({text}:{text:string}) {
  const lines=text.split('\n').map(line=>line.trim()).filter(Boolean);
  return lines.length>1 ? <ul className="cv-bullets">{lines.map((line,index)=><li key={index}>{line}</li>)}</ul> : <p>{text}</p>;
}

export function CVContent({site,preview=false,embedded=false}:{site:SiteContent;preview?:boolean;embedded?:boolean}) {
  const {cv,values}=site;
  return (
    <article className={embedded?'cv-page cv-embedded':'cv-page'} lang="en">
      <header className="cv-header" data-cv-section="profile">
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
        <div className="cv-actions" data-cv-section="pdf">
          <a href={preview?'/api/cv?preview=1':'/api/cv'} download className="button button--primary">Download PDF</a>
          {!embedded&&<Link href="/" className="button button--secondary">Portfolio</Link>}
        </div>
      </header>

      <section data-cv-section="profile">
        <h2>Profile</h2>
        <p>{cv.profile}</p>
      </section>

      <section data-cv-section="experience">
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

      {!!cv.education?.length && <section data-cv-section="education">
        <h2>Education</h2>
        <div className="cv-list">{cv.education.map(({title,period,description},index)=><div className="cv-entry" key={index}>
          <div><h3>{title}</h3><p>{period}</p></div><CVDescription text={description}/>
        </div>)}</div>
      </section>}

      <section data-cv-section="profile">
        <h2>Core Capabilities</h2>
        <p>{cv.capabilities}</p>
      </section>
      {cv.languages && <section data-cv-section="profile"><h2>Languages</h2><p>{cv.languages}</p></section>}

      <footer className="cv-footer">
        <a href={values.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
        <a href={values.instagram} target="_blank" rel="noreferrer">{values.instagramLabel}</a>
      </footer>
    </article>
  );
}
