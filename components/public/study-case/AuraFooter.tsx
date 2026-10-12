import { ArrowUp, ExternalLink, MessageCircle } from 'lucide-react';

export function AuraFooter() {
  return <>
    <section className="contact-section" aria-labelledby="case-contact-title"><div className="section-shell">
      <div className="contact-layout"><h2 id="case-contact-title">Let's make<br />something useful.</h2><div><p>Punya campaign yang mau dikembangkan, visual yang perlu dieksekusi, atau workflow yang terasa terlalu ribet? Let's talk.</p><a className="button button-dark" href="https://wa.me/6289653484274?text=Hi%20Gading%2C%20I%20found%20your%20portfolio%20and%20would%20like%20to%20talk." target="_blank" rel="noopener noreferrer">Chat on WhatsApp <MessageCircle className="icon" aria-hidden="true" /></a></div></div>
      <div className="contact-bottom"><span>Think. Create. Build. Improve.</span><a href="https://instagram.com/gadingg_" target="_blank" rel="noopener noreferrer">Instagram @gadingg_ <ExternalLink className="icon" aria-hidden="true" /></a></div>
    </div></section>
    <footer className="site-footer section-shell"><p>© {new Date().getFullYear()} R. Gading Utama</p><a href="#case-top">Back to top <ArrowUp className="icon" aria-hidden="true" /></a></footer>
  </>;
}
