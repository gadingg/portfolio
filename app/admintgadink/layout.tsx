import type { CSSProperties, ReactNode } from 'react';
import { defaultPalette as palette } from '@/lib/public-palette';
import '@/components/admin/admin-controls.css';

const theme = {
  '--bg': palette.canvas,
  '--bg-hero': palette.canvas,
  '--admin-bg': palette.canvas,
  '--admin-card': palette.surface,
  '--admin-card-border': palette.line,
  '--admin-sidebar-bg': palette.canvas,
  '--surface': palette.surface,
  '--ink': palette.ink,
  '--muted': palette.secondary,
  '--border': palette.line,
  '--border-strong': palette.controlLine,
  '--wm-control': palette.controlLine,
  '--amber': palette.start,
  '--admin-accent-text': palette.buttonText,
  '--admin-accent-gradient': `linear-gradient(${palette.angle}deg, ${palette.start}, ${palette.end})`,
} as CSSProperties;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-theme" style={theme}>{children}</div>;
}
