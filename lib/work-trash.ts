import type { WorkItem } from './works';

export const trashRetentionMs = 72 * 60 * 60 * 1000;
export type TrashedWork = {
  id: string; deletedAt: string; expiresAt: string;
  draft?: WorkItem; published?: WorkItem; draftIndex: number; publishedIndex: number;
};
export type WorksCollection = {items: WorkItem[]; trash?: TrashedWork[]; pendingMediaCleanup?: string[]};
export function trashExpired(entry: TrashedWork, now = Date.now()) {
  return !Number.isFinite(Date.parse(entry.expiresAt)) || Date.parse(entry.expiresAt) <= now;
}
export function trashTimeLeft(entry: TrashedWork, now = Date.now()) {
  const hours = Math.ceil((Date.parse(entry.expiresAt) - now) / 3600000);
  return hours <= 0 ? 'Menunggu pembersihan' : hours > 24 ? `Sisa ${Math.ceil(hours / 24)} hari` : `Sisa ${hours} jam`;
}
export function moveWorkToTrash(draft: WorksCollection, published: WorksCollection, id: string, latest?: WorkItem, now = Date.now()) {
  if ((draft.trash || []).some(item => item.id === id)) throw Error('Portofolio sudah di Sampah.');
  const draftIndex = draft.items.findIndex(item => item.id === id);
  const publishedIndex = published.items.findIndex(item => item.id === id);
  const draftItem = latest?.id === id ? latest : draft.items[draftIndex];
  const publicItem = published.items[publishedIndex];
  if (!draftItem && !publicItem) throw Error('Portofolio tidak ditemukan.');
  const entry: TrashedWork = {id, deletedAt: new Date(now).toISOString(), expiresAt: new Date(now + trashRetentionMs).toISOString(),
    ...(draftItem ? {draft: draftItem} : {}), ...(publicItem ? {published: publicItem} : {}), draftIndex, publishedIndex};
  return {
    draft: {...draft, items: draft.items.filter(item => item.id !== id), trash: [entry, ...(draft.trash || [])]},
    published: {...published, items: published.items.filter(item => item.id !== id)}, entry,
  };
}
export function restoreTrashedWork(draft: WorksCollection, published: WorksCollection, id: string, now = Date.now()) {
  const entry = draft.trash?.find(item => item.id === id);
  if (!entry || trashExpired(entry, now)) throw Error('Masa pemulihan sudah habis.');
  if ([...draft.items, ...published.items].some(item => item.id === id)) throw Error('ID portofolio sudah digunakan. Muat ulang terlebih dahulu.');
  for (const [items, restored] of [[draft.items, entry.draft], [published.items, entry.published]] as const) {
    if (restored && items.length >= 150) throw Error('Koleksi sudah penuh. Pindahkan satu portofolio ke Sampah sebelum memulihkan.');
    if (restored?.homepageFeatured && items.filter(item => item.kind === 'webapp' && item.homepageFeatured).length >= 3)
      throw Error('Lepas satu pilihan unggulan homepage sebelum memulihkan portofolio ini.');
    const slugs = [restored?.caseStudy?.slug, ...(restored?.aliases || [])].filter(Boolean);
    if (slugs.some(slug => items.some(item => item.caseStudy?.slug === slug || item.aliases?.includes(slug!))))
      throw Error('Link studi kasus sudah dipakai portofolio lain. Ubah link tersebut sebelum memulihkan.');
  }
  const insert = (items: WorkItem[], item: WorkItem | undefined, index: number) => {
    const next = [...items]; if (item) next.splice(index < 0 ? next.length : Math.min(index, next.length), 0, item); return next;
  };
  return {
    draft: {...draft, items: insert(draft.items, entry.draft, entry.draftIndex), trash: draft.trash!.filter(item => item.id !== id)},
    published: {...published, items: insert(published.items, entry.published, entry.publishedIndex)}, entry,
  };
}
