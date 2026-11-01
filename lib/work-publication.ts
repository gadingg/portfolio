import { WorksDraftSchema, WorksSchema, type WorkItem } from './works';

export function publishOneWork(draft: WorkItem[], published: WorkItem[], workId: string) {
  const item = draft.find(value => value.id === workId);
  if (!item) throw new Error('Portfolio yang akan dipublikasikan tidak ditemukan.');
  const validated = WorksSchema.parse({ items: [item] }).items[0];
  const exists = published.some(value => value.id === workId);
  const items = exists ? published.map(value => value.id === workId ? validated : value) : [...published, validated];
  return WorksDraftSchema.parse({ items });
}
