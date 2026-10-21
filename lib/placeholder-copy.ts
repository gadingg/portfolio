import type { WorkItem } from './works';

// Keep media and the internal placeholder flag intact while removing setup copy.
export function cleanPlaceholderCopy(item: WorkItem): WorkItem {
  if (!item.demo) return {...item, imageAlt: item.imageAlt.replace(/\b(contoh|dummy|sample|demo)\s*/gi, '').trim()};
  return { ...item,
    title: item.title.replace(/\b(contoh|dummy|sample|demo)\s*/gi, '').trim() || 'Portfolio',
    description: /\b(contoh|dummy|sample|demo)\b|ganti.*admin/i.test(item.description) ? '' : item.description,
    imageAlt: item.imageAlt.replace(/\b(contoh|dummy|sample|demo)\s*/gi, '').trim(),
  };
}
