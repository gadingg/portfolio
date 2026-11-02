import {WorkItemSchema, type WorkItem} from './works';

export type WorkEditorErrors = Record<string, string>;
export async function openStudyPreview(id: string, prepare: () => Promise<number | null>) {
  const tab = window.open('about:blank', '_blank');
  if (tab) tab.opener = null;
  try {
    const revision = await prepare();
    if (revision === null) {tab?.close(); return;}
    const url = `/admintgadink/preview/${encodeURIComponent(id)}?revision=${revision}`;
    if (tab) {if (!tab.closed) tab.location.replace(url);}
    else window.location.assign(url);
  } catch (error) {tab?.close(); throw error;}
}
export function workEditorErrors(item: WorkItem): WorkEditorErrors {
  const result = WorkItemSchema.safeParse(item), errors: WorkEditorErrors = {};
  if (!result.success) for (const issue of result.error.issues) {
    const path = issue.path.join('.') || 'title';
    if (!errors[path]) errors[path] = issue.message;
  }
  if (item.published && item.caseStudy) for (const [key, label] of [['problem','Masalah'],['solution','Solusi'],['impact','Hasil']] as const)
    if (!item.caseStudy[key].trim()) errors[`caseStudy.${key}`] = `Isi ${label.toLowerCase()} proyek ini.`;
  if (item.kind === 'video' && errors.url && (item.videoSource === 'file' || (!item.videoSource && item.videoFile))) {
    errors.videoFile = errors.url; delete errors.url;
  }
  return errors;
}
export function focusWorkError(errors: WorkEditorErrors, root: HTMLElement | null) {
  if (!root) return;
  const paths = Object.keys(errors);
  const fields = Array.from(root.querySelectorAll<HTMLElement>('[data-work-field]'));
  const field = fields.find(element => paths.includes(element.dataset.workField || ''))
    || fields.find(element => paths.some(path => path.startsWith((element.dataset.workField || '') + '.')));
  if (!field) return;
  const input = field.matches('input,textarea,select,button') ? field : field.querySelector<HTMLElement>('input:not([type=hidden]),textarea,select,button');
  for (let parent = input?.parentElement || field.parentElement; parent; parent = parent.parentElement)
    if (parent.tagName === 'DETAILS') (parent as HTMLDetailsElement).open = true;
  input?.focus({preventScroll:true});
  field.scrollIntoView({block:'center', behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}
