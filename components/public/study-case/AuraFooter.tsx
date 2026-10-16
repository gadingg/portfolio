import { ArrowUp, ExternalLink, MessageCircle } from 'lucide-react';
import { getPublicSite } from '@/lib/db/site';

export async function AuraFooter() {
  const {values}=await getPublicSite();
  return <>
    <section className="contact-section" aria-labelledby="case-contact-title"><div className="section-shell">
      <div className="contact-layout"><h2 id="case-contact-title">{values.contactTitle.split('\n').map((line,i)=><span key={i}>{i>0&&<br/>}{line}</span>)}</h2><div><p>{values.contactBody}</p><a className="button button-dark" href={values.whatsapp} target="_blank" rel="noopener noreferrer">{values.contactButton}<MessageCircle className="icon" aria-hidden="true" /></a></div></div>
      <div className="contact-bottom"><span>{values.footerSignature}</span><a href={values.instagram} target="_blank" rel="noopener noreferrer">{values.instagramLabel}<ExternalLink className="icon" aria-hidden="true" /></a></div>
    </div></section>
    <footer className="site-footer section-shell"><p>© {new Date().getFullYear()} {values.footerName}</p><a href="#case-top">Back to top <ArrowUp className="icon" aria-hidden="true" /></a></footer>
  </>;
}
