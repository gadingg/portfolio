import {ExternalLink} from 'lucide-react';
import {caseAppLinks,type CaseAppLink} from '@/lib/case-app-links';
export function CaseAppActions({study}:{study:{slug?:string;appUrl?:string;appLinks?:CaseAppLink[]}}){
  const links=caseAppLinks(study);if(!links.length)return null;
  return <nav className="case-app-actions" aria-label="Project apps">{links.map((link,index)=><a key={index} className="text-link" href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<ExternalLink className="icon" aria-hidden="true"/></a>)}</nav>;
}
