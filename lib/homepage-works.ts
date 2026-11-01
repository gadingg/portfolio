import type { WorkItem } from './works';
import { isReadyWork } from './work-readiness';

// Older documents retain their existing three selections until the first CMS edit.
export function homepageWorks(items: WorkItem[]): WorkItem[] {
  const apps = items.filter(item => item.kind === 'webapp');
  const manual = apps.some(item => item.homepageFeatured !== undefined);
  return apps.filter(item => item.published && isReadyWork(item) && (!manual || item.homepageFeatured === true)).slice(0, 3);
}

export function setHomepageFeatured(items: WorkItem[], id: string, selected: boolean): WorkItem[] {
  if (selected && !items.some(item => item.id === id && item.kind === 'webapp' && item.published && isReadyWork(item))) return items;
  const current = new Set(homepageWorks(items).map(item => item.id));
  if (selected) current.add(id); else current.delete(id);
  if (current.size > 3) return items;
  return items.map(item => item.kind === 'webapp' ? { ...item, homepageFeatured: current.has(item.id) } : item);
}

export function homepageWorkSummary(selected: number, total: number, studies: number): string {
  return `${selected} selected ${selected === 1 ? 'project' : 'projects'} from ${total} web ${total === 1 ? 'app' : 'apps'} · ${studies} case ${studies === 1 ? 'study' : 'studies'}`;
}
