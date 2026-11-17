import { siteFields } from './site';

export const websiteSections = [
  {id:'hero', label:'Hero', selector:'#home, .hero'},
  {id:'works', label:'Portofolio', selector:'#work'},
  {id:'about', label:'About', selector:'#about, .about-section'},
  {id:'capabilities', label:'What I do', selector:'.capability-layout'},
  {id:'process', label:'How I work', selector:'.process-section'},
  {id:'tools', label:'Tools', selector:'#toolkit, .toolkit-section'},
  {id:'contact', label:'Kontak', selector:'.contact-layout, .social-links'},
  {id:'footer', label:'Footer', selector:'.contact-bottom, .site-footer'},
] as const;
export type WebsiteSection = typeof websiteSections[number]['id'];

export function websiteSectionForField(field:typeof siteFields[number]): WebsiteSection | 'settings' {
  if(field.key.startsWith('footer'))return 'footer';
  if(field.key==='capabilitiesTitle')return 'capabilities';
  switch(field.group){
    case 'Hero':return 'hero';
    case 'Portofolio':return 'works';
    case 'About':return 'about';
    case 'Kemampuan':return 'capabilities';
    case 'Proses':return 'process';
    case 'Tools':return 'tools';
    case 'Kontak':return 'contact';
    default:return 'settings';
  }
}
