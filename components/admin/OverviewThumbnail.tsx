'use client';

import { useState } from 'react';
import { PanelsTopLeft, Palette, Clapperboard } from 'lucide-react';
import type { WorkItem } from '@/lib/works';
import { workThumbnail } from '@/lib/work-images';

export function OverviewThumbnail({ src, kind }: { src: string; kind: WorkItem['kind'] }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const Icon = { webapp: PanelsTopLeft, design: Palette, video: Clapperboard }[kind];
  return <div className="overview-thumbnail" aria-hidden="true">
    {src && src !== failedSource
      ? <img {...workThumbnail(src)} sizes="112px" alt="" width={112} height={84} loading="lazy" decoding="async" onError={() => setFailedSource(src)} />
      : <div className="overview-thumbnail-fallback"><Icon size={26} /><span>Tanpa cover</span></div>}
  </div>;
}
