import type { WorkItem } from './works';

export function updateReqVideo(items: WorkItem[], cover: string): WorkItem[] {
  return items.map(item => item.id === 'req-video' ? {
    ...item,
    image: cover,
    imageAlt: 'Mockup Req Take Video dengan jadwal take video dan antrean request dalam dua panel browser berlatar white silver.',
  } : item);
}
