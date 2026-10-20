import 'server-only';
import { createHash } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPublicClient } from '@/lib/supabase/public';
import {
  getLegacyPublishedProjects,
  getLegacyPublishedProjectBySlug,
} from './public-projects';
import { getPublicGalleryItems } from './gallery';
import {
  projectPresentations,
  useBriefArtwork,
} from '@/lib/project-presentation';
import { WorksSchema, publicWork, setWorkKind, type WorkItem } from '@/lib/works';
import { readCMS, readPublishedCMS, writeCMS, CMSConflict } from './cms';
import type { Project } from '@/types/portfolio';
import { applyRequestedWorks } from '@/lib/work-content-update';
import { stampWorkUpdates } from '@/lib/admin-overview';
import { normalizeWorkSlugs } from '@/lib/work-slugs';

const bucket = 'portfolio-public';
const filename = 'content/works.json';
export const revisionOf = (items: WorkItem[]) =>
  createHash('sha256').update(JSON.stringify(items)).digest('hex');

async function initialItems(): Promise<WorkItem[]> {
  const [projects, gallery] = await Promise.all([
    getLegacyPublishedProjects(),
    getPublicGalleryItems(),
  ]);
  const items: WorkItem[] = projects.map((project) => {
    const brief = projectPresentations[project.slug];
    return {
      id: project.id,
      kind: 'webapp',
      title: brief?.title || project.title,
      description: brief?.intro || project.description,
      image: useBriefArtwork(project) ? '' : project.cover_image_url,
      imageAlt: project.cover_image_alt || project.title,
      url: `/work/${project.slug}`,
      published: true,
      demo: false,
      artwork: brief?.artwork || 'sample',
    };
  });
  items.push(
    {
      id: 'mega-app',
      kind: 'webapp',
      title: 'Daily App Gading',
      description:
        'Task, prompt, caption, link, dan reminder dalam satu hub kerja.',
      image: '',
      imageAlt: '',
      url: 'https://patosser.my.id/gading/',
      published: true,
      demo: false,
      artwork: 'hub',
    },
    {
      id: 'req-video',
      kind: 'webapp',
      title: 'Req Video Bareng Patosser',
      description:
        'Request listing, follow-up, dan jadwal take video dalam satu alur.',
      image: '',
      imageAlt: '',
      url: 'https://patosser.my.id/reqvideo',
      published: true,
      demo: false,
      artwork: 'schedule',
    },
    {
      id: 'sample-web',
      kind: 'webapp',
      title: 'Website berikutnya',
      description:
        'Contoh slot karya. Ganti judul, gambar, dan link melalui menu Works.',
      image: '',
      imageAlt: '',
      url: '',
      published: true,
      demo: true,
      artwork: 'sample',
    },
  );
  const seedCaptions = new Set([
    'Minimalist monochrome aesthetic study',
    'Editorial design composition',
    'High-contrast typographic structure',
    'Conceptual motion framing',
    'Digital layout fragment',
  ]);
  const seedFiles = new Set([
    '4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg',
    'c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg',
    '917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg',
  ]);
  const originals = gallery.filter(
    (item) =>
      !(
        /^gallery-0[1-5]$/.test(item.id) &&
        /^Visual Archive Fragment 0[1-5]$/.test(item.alt) &&
        seedCaptions.has(item.caption || '') &&
        seedFiles.has(item.url.split('/').pop() || '')
      ),
  );
  for (const item of originals)
    items.push({
      id: item.id,
      kind: 'design',
      title: item.caption || item.alt || 'Visual design',
      description: item.category || '',
      image: item.url,
      imageAlt: item.alt,
      url: '',
      published: true,
      demo: false,
      artwork: 'sample',
    });
  if (!originals.length)
    for (let i = 1; i <= 4; i++)
      items.push({
        id: `sample-design-${i}`,
        kind: 'design',
        title: [
          'Campaign poster',
          'Social media series',
          'Visual identity',
          'Editorial layout',
        ][i - 1],
        description: 'Data contoh — ganti dengan karya Anda.',
        image: `/assets/work/sample-design-${i}.svg`,
        imageAlt: `Contoh layout desain ${i}`,
        url: '',
        published: true,
        demo: true,
        artwork: 'sample',
      });
  for (let i = 1; i <= 3; i++)
    items.push({
      id: `sample-video-${i}`,
      kind: 'video',
      title: ['Brand story', 'Campaign in motion', 'Behind the scenes'][i - 1],
      description: 'Data contoh — tambahkan link Instagram di admin.',
      image: `/assets/work/sample-design-${i}.svg`,
      imageAlt: 'Thumbnail contoh video',
      url: '',
      published: true,
      demo: true,
      artwork: 'sample',
    });
  return items;
}

async function legacyWorks() {
  const { data, error } = await createPublicClient()
    .storage.from(bucket)
    .download(filename);
  if (error) {
    const code = String((error as { statusCode?: string }).statusCode || '');
    if (
      !['400', '404'].includes(code) ||
      !/not found|does not exist/i.test(error.message)
    )
      throw new Error('Koleksi karya belum bisa dimuat.');
    const items = await initialItems();
    return { items, revision: revisionOf(items), initialized: false };
  }
  const { items } = WorksSchema.parse(JSON.parse(await data.text()));
  return { items, revision: revisionOf(items), initialized: true };
}

export async function saveWorks(items: WorkItem[]) {
  return writeCMS('works', await getWorksDocument(), { items });
}

export async function initialWorks() {
  const { items } = await legacyWorks();
  for (const project of await getLegacyPublishedProjects()) {
    let item = items.find(
      (value) =>
        value.id === project.id || value.url === `/work/${project.slug}`,
    );
    if (!item) {
      item = {
        id: project.id,
        kind: 'webapp',
        title: project.title,
        description: project.description,
        image: project.cover_image_url,
        imageAlt: project.cover_image_alt || project.title,
        url: `/work/${project.slug}`,
        published: true,
        demo: false,
        artwork: 'sample',
      };
      items.push(item);
    }
    const presentation = projectPresentations[project.slug];
    const full = await getLegacyPublishedProjectBySlug(project.slug);
    item.caseStudy = {
      slug: project.slug,
      problem: presentation?.problem || project.description,
      solution: presentation?.solution || project.subtitle || '',
      impact: presentation?.impact || '',
      appUrl: presentation?.url || '',
      blocks: presentation
        ? presentation.sections.flatMap((section, i) => [
            {
              id: `${project.id}-h-${i}`,
              block_type: 'heading' as const,
              block_order: i * 2,
              content_json: { text: section.title, level: 2 },
            },
            {
              id: `${project.id}-p-${i}`,
              block_type: 'paragraph' as const,
              block_order: i * 2 + 1,
              content_json: { text: section.body },
            },
          ])
        : (full?.blocks || []).map((block, i) => ({
            ...block,
            id: block.id || `${project.id}-${i}`,
          })),
    };
    if (presentation?.artwork === 'listing')
      item.caseStudy.blocks.push({
        id: `${project.id}-screens`,
        block_type: 'gallery',
        block_order: 100,
        content_json: {
          images: [
            {
              url: '/assets/work/listing-hub.jpg',
              alt: 'Pencarian dan perbandingan properti di Listing Hub',
            },
            {
              url: '/assets/work/listing-filter.jpg',
              alt: 'Filter listing pada layar mobile',
            },
          ],
          layout: 'grid',
        },
      });
  }
  return { items:applyRequestedWorks(items) };
}
export const getWorksDocument = async () => {
  const doc=await readCMS('works',initialWorks);
  return {...doc,draft:{...doc.draft,items:normalizeWorkSlugs(doc.draft.items)},published:{...doc.published,items:normalizeWorkSlugs(doc.published.items)}};
};
export async function getWorks() {
  const doc = await getWorksDocument();
  return {
    items: doc.draft.items,
    revision: doc.revision,
    initialized: doc.revision > 0,
    published_at: doc.published_at,
    published: doc.published.items,
  };
}
export async function getPublicWorks() {
  const doc = await readPublishedCMS('works', initialWorks, { cached: true });
  return {
    items: normalizeWorkSlugs(doc.items)
      .filter((item) => item.published)
      .map(publicWork),
  };
}
export function orderedItems(items: WorkItem[], ids: string[]) {
  const rank = new Map(ids.map((id, i) => [id, i]));
  return [...items].sort(
    (a, b) =>
      (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  );
}
export async function changeWorks(body: {
  items?: WorkItem[];
  revision: number;
  action: 'save' | 'publish' | 'order';
  ids?: string[];
}) {
  const current = await getWorksDocument();
  if (body.revision !== current.revision) throw new CMSConflict();
  if (body.action === 'order') {
    const ids = body.ids || [];
    if (
      ids.length !== current.draft.items.length ||
      new Set(ids).size !== ids.length ||
      current.draft.items.some((item) => !ids.includes(item.id))
    )
      throw new Error(
        'Urutan tidak valid. Simpan draft baru sebelum mengurutkan.',
      );
    return writeCMS(
      'works',
      current,
      { items: orderedItems(current.draft.items, ids) },
      { items: orderedItems(current.published.items, ids) },
    );
  }
  const draft = {
    items: (body.items || current.draft.items).map((item) => {
      const previous=current.draft.items.find(value=>value.id===item.id);
      const retained=!item.caseStudy&&!item.archivedCaseStudy
        ? {...item,archivedCaseStudy:previous?.caseStudy||previous?.archivedCaseStudy}
        : item;
      const normalized=setWorkKind(retained,item.kind);
      return {...normalized,url:normalized.caseStudy?`/work/${normalized.caseStudy.slug}`:normalized.url};
    }),
  };
  if(body.action==='publish')for(const item of draft.items){
    const previous=current.published.items.find(value=>value.id===item.id);
    if(item.caseStudy&&previous?.caseStudy&&item.caseStudy.slug!==previous.caseStudy.slug){
      item.aliases=[...new Set([...(previous.aliases||[]),...(item.aliases||[]),previous.caseStudy.slug])].filter(slug=>slug!==item.caseStudy!.slug);
    }
  }
  const stamped = { items: stampWorkUpdates(current.draft.items, draft.items, new Date().toISOString()) };
  return writeCMS(
    'works',
    current,
    stamped,
    body.action === 'publish' ? WorksSchema.parse(stamped) : current.published,
  );
}
export function workAsProject(item: WorkItem): Project {
  return {
    id: item.id,
    title: item.title,
    slug: item.caseStudy!.slug,
    description: item.description,
    subtitle: item.description,
    category: 'Website / Apps',
    cover_image_url: item.image,
    cover_image_alt: item.imageAlt,
    status: 'published',
    is_featured: false,
    display_order: 0,
    created_at: '',
    updated_at: '',
    blocks: item.caseStudy!.blocks.map((block, index) => ({
      ...block,
      project_id: item.id,
      block_order: index,
    })),
    cmsWork: item,
  } as Project;
}
