import { cleanVisualLayout, type VisualLayout as Layout } from '@/lib/visual-layout';
export function VisualLayout({layout}:{layout:Layout}) {
  const safe=cleanVisualLayout(layout);
  return <div className="cms-visual-layout"><style>{safe.css}</style><div dangerouslySetInnerHTML={{__html:safe.html}} /></div>;
}
