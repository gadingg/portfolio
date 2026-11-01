import type { WorkItem } from './works';
import type { SiteContent } from './site';
import { sameDraftContent } from './draft-backup';
const content = ({createdAt, updatedAt, ...item}: WorkItem) => item;
export function summarizePortfolioChanges(draft: WorkItem[], published: WorkItem[]) {
  const before = new Map(published.map(item => [item.id, item]));
  const after = new Map(draft.map(item => [item.id, item]));
  const ids = new Set([...before.keys(), ...after.keys()]);
  const changed = [...ids].filter(id => {
    const a = before.get(id), b = after.get(id);
    return !a || !b || !sameDraftContent(JSON.stringify(content(a)), JSON.stringify(content(b)));
  }).map(id => after.get(id)?.title || before.get(id)?.title || 'Portofolio');
  const oldOrder = published.filter(item => after.has(item.id)).map(item => item.id);
  const newOrder = draft.filter(item => before.has(item.id)).map(item => item.id);
  return {changed, orderChanged: JSON.stringify(oldOrder) !== JSON.stringify(newOrder)};
}
export function portfolioPublicationMessage(draft: WorkItem[], published: WorkItem[]) {
  const {changed, orderChanged} = summarizePortfolioChanges(draft, published);
  const names = changed.slice(0, 5).join(', ');
  const extra = changed.length > 5 ? ` dan ${changed.length - 5} lainnya` : '';
  const parts = [changed.length ? `${changed.length} portofolio: ${names}${extra}` : '', orderChanged ? 'urutan portofolio' : ''].filter(Boolean);
  return `Publish semua perubahan? ${parts.join(' · ') || 'Perubahan portofolio'} ikut di-publish.`;
}
export function sitePublicationSummary(draft: SiteContent, published: SiteContent) {
  const sections: string[] = [];
  if (JSON.stringify(draft.values) !== JSON.stringify(published.values) || JSON.stringify(draft.layout) !== JSON.stringify(published.layout)) sections.push('Website');
  if (JSON.stringify(draft.cv) !== JSON.stringify(published.cv)) sections.push('CV');
  return sections;
}
