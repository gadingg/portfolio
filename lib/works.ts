import { z } from 'zod';
import { CaseStudySchema, mediaURL } from './content-blocks';

export const workKinds = ['webapp', 'design', 'video'] as const;
export type WorkKind = (typeof workKinds)[number];
export function activeVideoSource(item: { videoSource?: 'file' | 'instagram'; videoFile?: string }) {
  return item.videoSource || (item.videoFile ? 'file' : 'instagram');
}
export const workLabels: Record<WorkKind, string> = {
  webapp: 'Website / Apps',
  design: 'Visual Design',
  video: 'Branding & Video',
};

export function instagramURL(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      !['instagram.com', 'www.instagram.com'].includes(url.hostname) ||
      url.port ||
      url.username ||
      url.password
    )
      return null;
    const match = url.pathname.match(/^\/(p|reel|tv)\/([a-zA-Z0-9_-]+)\/?$/);
    return match ? `https://www.instagram.com/${match[1]}/${match[2]}/` : null;
  } catch {
    return null;
  }
}

const safeURL = (value: string) => {
  if (!value) return true;
  if (/^\/(?!\/)[^\\\s]*$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
};
const imageURL = (value: string) => {
  if (!value || /^\/(?!\/)[^\\\s]*$/.test(value)) return true;
  try {
    const url = new URL(value);
    return (
      safeURL(value) &&
      (url.hostname.endsWith('.supabase.co') ||
        ['images.unsplash.com', 'picsum.photos'].includes(url.hostname))
    );
  } catch {
    return false;
  }
};

export const WorkDraftItemSchema = z.object({
  copyEdition: z.string().max(40).optional(),
  aiDraft: z.object({
    brief: z.string().max(30000), confirmations: z.array(z.string().max(500)).max(12),
    screenshots: z.array(z.object({ afterSection:z.number().int().min(0).max(7), description:z.string().max(500), caption:z.string().max(300) })).max(8),
    generatedAt: z.string().datetime(),
  }).optional(),
  homepageFeatured: z.boolean().optional(),
  evidenceEdition: z.string().max(40).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  videoFile: mediaURL.refine(value=>!value||/\.(mp4|webm)(?:[?#].*)?$/i.test(value),'Gunakan file MP4 atau WebM.').optional(),
  videoSource: z.enum(['file', 'instagram']).optional(),
  id: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/),
  kind: z.enum(workKinds),
  title: z.string().trim().min(1, 'Judul wajib diisi.').max(140),
  description: z.string().max(500).default(''),
  image: z
    .string()
    .max(2000)
    .refine(
      imageURL,
      'Gunakan upload gambar atau URL gambar Supabase yang valid.',
    )
    .default(''),
  imageAlt: z.string().max(250).default(''),
  url: z
    .string()
    .max(2000)
    .refine(safeURL, 'Gunakan tautan HTTPS atau path lokal.')
    .default(''),
  published: z.boolean(),
  demo: z.boolean(),
  artwork: z
    .enum(['listing', 'meta', 'mbg', 'hub', 'schedule', 'sample'])
    .default('sample'),
  caseStudy: CaseStudySchema.optional(),
  archivedCaseStudy: CaseStudySchema.optional(),
  aliases:z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(30).optional(),
});
export const WorkItemSchema = WorkDraftItemSchema.superRefine((item, ctx) => {
  if(item.published&&item.caseStudy?.motion?.enabled){
    if(!item.caseStudy.motion.video)ctx.addIssue({code:'custom',path:['caseStudy','motion','video'],message:'Tambahkan video animasi atau matikan Tampilkan animasi alur.'});
    if(!item.caseStudy.motion.poster)ctx.addIssue({code:'custom',path:['caseStudy','motion','poster'],message:'Tambahkan poster animasi sebelum dipublikasikan.'});
  }
  if(item.kind==='video'&&activeVideoSource(item)==='file'&&item.videoFile&&item.published&&!item.demo&&!item.image)ctx.addIssue({code:'custom',path:['image'],message:'Tambahkan thumbnail sebelum video dipublikasikan.'});
  if (item.kind === 'video' && activeVideoSource(item)==='instagram' && item.url && !instagramURL(item.url))
    ctx.addIssue({
      code: 'custom',
      path: ['url'],
      message: 'Gunakan link Instagram /reel/, /p/, atau /tv/.',
    });
  if (item.published && !item.demo && item.kind !== 'design' && (item.kind==='video' ? !(activeVideoSource(item)==='file' ? item.videoFile : item.url) : !item.url))
    ctx.addIssue({
      code: 'custom',
      path: ['url'],
      message: 'Tautan wajib diisi untuk karya asli yang ditampilkan.',
    });
  if (item.published && item.kind === 'design' && !item.image)
    ctx.addIssue({
      code: 'custom',
      path: ['image'],
      message: 'Gambar desain wajib diisi sebelum ditampilkan.',
    });
});
export type WorkItem = z.infer<typeof WorkDraftItemSchema>;

export function setCaseStudyEnabled(item: WorkItem, enabled: boolean): WorkItem {
  if (enabled) {
    const study = item.caseStudy || item.archivedCaseStudy || {
      slug: `karya-${item.id.slice(0, 8)}`, problem: '', solution: '', impact: '',
      appUrl: item.url.startsWith('https:') ? item.url : '', blocks: [],
    };
    return { ...item, caseStudy: study, archivedCaseStudy: undefined, url: `/work/${study.slug}` };
  }
  return { ...item, archivedCaseStudy: item.caseStudy || item.archivedCaseStudy,
    caseStudy: undefined, url: item.caseStudy ? item.caseStudy.appUrl || '' : item.url };
}

export function setWorkKind(item: WorkItem, kind: WorkKind): WorkItem {
  return { ...(kind !== 'webapp' && item.caseStudy ? setCaseStudyEnabled(item, false) : item), kind };
}

export function publicWork(item: WorkItem): WorkItem {
  const { archivedCaseStudy, createdAt, updatedAt, copyEdition, aiDraft, ...visible } = item;
  if (visible.kind === 'video') {
    if (activeVideoSource(visible) === 'instagram') return { ...visible, videoFile: '', url: visible.url };
    return { ...visible, url: instagramURL(visible.url) || '' };
  }
  return { ...visible, url: visible.caseStudy ? `/work/${visible.caseStudy.slug}` : visible.url };
}
export const WorksDraftSchema = z
  .object({ items: z.array(WorkDraftItemSchema).max(150) })
  .superRefine(({ items }, ctx) => {
    if (items.filter(item => item.kind === 'webapp' && item.homepageFeatured).length > 3)
      ctx.addIssue({ code: 'custom', path: ['items'], message: 'Pilih maksimal 3 portfolio unggulan untuk homepage.' });
    if (new Set(items.map((item) => item.id)).size !== items.length)
      ctx.addIssue({
        code: 'custom',
        path: ['items'],
        message: 'ID karya harus unik.',
      });
    const slugs = items.filter(item=>item.caseStudy).flatMap(item=>[item.caseStudy!.slug,...(item.aliases||[])]);
    if (new Set(slugs).size !== slugs.length)
      ctx.addIssue({
        code: 'custom',
        path: ['items'],
        message: 'Slug studi kasus harus unik.',
      });
  });
export const WorksSchema = WorksDraftSchema.superRefine(({ items }, ctx) => {
  for (const item of items.filter((value) => value.published)) {
    const parsed = WorkItemSchema.safeParse(item);
    if (!parsed.success)
      ctx.addIssue({
        code: 'custom',
        message: `${item.title}: ${parsed.error.issues[0].message}`,
      });
    if (
      item.caseStudy &&
      (!item.caseStudy.problem.trim() ||
        !item.caseStudy.solution.trim() ||
        !item.caseStudy.impact.trim())
    )
      ctx.addIssue({
        code: 'custom',
        message: `${item.title}: lengkapi masalah, solusi, dan hasil sebelum publikasi.`,
      });
  }
});
