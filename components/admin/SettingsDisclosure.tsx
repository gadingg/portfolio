import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export function SettingsDisclosure({title,icon,status,children}:{title:string;icon:ReactNode;status?:string;children:ReactNode}) {
  return <details className="cms-settings-card cms-disclosure">
    <summary>
      <span className="cms-settings-icon" aria-hidden="true">{icon}</span>
      <span className="cms-settings-label"><span>{title}</span>{status&&<small>{status}</small>}</span>
      <ChevronDown className="cms-settings-chevron" size={18} aria-hidden="true"/>
    </summary>
    <div className="cms-settings-content">{children}</div>
  </details>;
}
