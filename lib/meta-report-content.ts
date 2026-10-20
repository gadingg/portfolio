import type { WorkItem } from './works';

export function updateMetaReport(items: WorkItem[], cover: string): WorkItem[] {
  return items.map(item => {
    if (item.caseStudy?.slug !== 'meta-ads-campaign-system') return item;
    return {
      ...item,
      description: 'Performa iklan, respons WhatsApp, dan evaluasi campaign dalam satu dashboard.',
      image: cover,
      imageAlt: 'Close-up dashboard Meta Ads dengan panel pembesaran menu Rekap Iklan dan ringkasan performa batch pada bingkai silver.',
    };
  });
}
