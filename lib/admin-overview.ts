import { workKinds, type WorkItem } from './works';

export function summarizeWorks(draft: WorkItem[], published: WorkItem[]) {
  const live = published.filter(item => item.published);
  const visible = new Map(live.map(item => [item.id, item]));
  const collection = new Map(published.map(item => [item.id, item]));
  draft.forEach(item => collection.set(item.id, item));
  const items = [...collection.values()];
  const stored = new Map(published.map(item => [item.id,item]));
  const drafts = items.filter(item => !stored.has(item.id));
  const hidden = published.filter(item => !item.published);
  const status = (item: WorkItem) => !stored.has(item.id) ? 'Draft baru' : JSON.stringify(item) !== JSON.stringify(stored.get(item.id)) ? 'Ada perubahan draft' : item.published ? 'Tayang' : 'Disembunyikan';
  const recent = [...draft].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 5);
  return {
    total: items.length, live: live.length, drafts: drafts.length, hidden: hidden.length,
    examples: items.filter(item => item.demo).length,
    changed: JSON.stringify(draft) !== JSON.stringify(published),
    categories: workKinds.map(kind => ({ kind, total: items.filter(item => item.kind === kind).length })),
    recent: recent.map(item => ({ ...item, isLive: visible.has(item.id), status: status(item) })),
  };
}

export function stampWorkUpdates(previous: WorkItem[], next: WorkItem[], now: string) {
  const before = new Map(previous.map(item => [item.id, item]));
  const content = ({ createdAt, updatedAt, ...item }: WorkItem) => item;
  const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable)
    : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)])) : value;
  return next.map(item => {
    const old = before.get(item.id);
    const changed = !old || JSON.stringify(stable(content(old))) !== JSON.stringify(stable(content(item)));
    return { ...content(item),
      ...(old?.createdAt ? { createdAt: old.createdAt } : !old ? { createdAt: now } : {}),
      ...(changed ? { updatedAt: now } : old?.updatedAt ? { updatedAt: old.updatedAt } : {}),
    };
  });
}
