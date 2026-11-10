import { paletteCSS } from '@/lib/public-palette';
import { ArrowUp, Instagram, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { getPublicSite } from '@/lib/db/site';
import { CopyEmailButton } from '../CopyEmailButton';

export async function AuraFooter() {
  const {values,cv,palette}=await getPublicSite();
  return <>
    <style data-public-palette>{paletteCSS(palette)}</style>
    <section className="contact-section" aria-labelledby="case-contact-title"><div className="section-shell">
      <div className="contact-layout"><h2 id="case-contact-title">{values.contactTitle.split('\n').map((line,i)=><span key={i}>{i>0&&<br/>}{line}</span>)}</h2><div>{values.contactBody&&<p>{values.contactBody}</p>}<a className="button button-dark" href={values.whatsapp} target="_blank" rel="noopener noreferrer">{values.contactButton}<MessageCircle className="icon" aria-hidden="true" /></a>{cv.email&&<CopyEmailButton email={cv.email}/>}</div></div>
      <div className="contact-bottom">{values.footerSignature&&<span>{values.footerSignature}</span>}<div className="social-links">
        {values.instagram && <a className="social-icon" data-social="instagram" href={values.instagram} aria-label={values.instagramLabel || 'Instagram'} title="Instagram" target="_blank" rel="noopener noreferrer"><Instagram className="icon" aria-hidden="true" /></a>}
        {values.linkedin && <a className="social-icon" data-social="linkedin" href={values.linkedin} aria-label="LinkedIn R. Gading Utama" title="LinkedIn" target="_blank" rel="noopener noreferrer"><Linkedin className="icon" aria-hidden="true" /></a>}
        {cv.email && <a className="social-icon" data-social="email" href={`mailto:${cv.email}`} aria-label="Email Gading" title="Email Gading"><Mail className="icon" aria-hidden="true" /></a>}
      </div></div>
    </div></section>
    <footer className="site-footer section-shell"><p>© {new Date().getFullYear()} {values.footerName}</p><a href="#case-top">Back to top <ArrowUp className="icon" aria-hidden="true" /></a></footer>
  </>;
}
