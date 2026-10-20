import type { WorkItem } from './works';

function renameContent(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(/Mega App Gading/gi, 'Daily App Gading');
  if (Array.isArray(value)) return value.map(renameContent);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, renameContent(entry)]));
  return value;
}

export function updateDailyApp(items: WorkItem[], cover: string): WorkItem[] {
  return items.map(item => {
    if (item.id !== 'mega-app') return item;
    const study = item.caseStudy;
    return {
      ...item,
      title: 'Daily App Gading',
      description: 'Task, prompt, watermark, dan library untuk merapikan workflow marketing harian.',
      image: cover,
      imageAlt: 'Grid diagonal UI Daily App Gading dengan panel sejajar dan jarak konsisten, menampilkan Kanban, Prompt Generator, Link Library, dan Watermark Generator.',
      aliases: [...new Set([...(item.aliases || []), 'mega-app-gading'])],
      url: study ? '/work/daily-app-gading' : item.url,
      caseStudy: study ? {
        ...study, slug: 'daily-app-gading',
        problem: study.problem.replace(/Mega App Gading/gi, 'Daily App Gading'),
        solution: study.solution.replace(/Mega App Gading/gi, 'Daily App Gading'),
        impact: study.impact.replace(/Mega App Gading/gi, 'Daily App Gading'),
        blocks: study.blocks.map(block => ({ ...block, content_json: renameContent(block.content_json) as typeof block.content_json })),
        ...(study.layout ? { layout: renameContent(study.layout) as typeof study.layout } : {}),
      } : undefined,
    };
  });
}
