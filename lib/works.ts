import { z } from 'zod';

export const workKinds = ['webapp', 'design', 'video'] as const;
export type WorkKind = typeof workKinds[number];
export const workLabels: Record<WorkKind, string> = { webapp: 'Website / Apps', design: 'Visual Design', video: 'Branding & Video' };

export function instagramURL(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname) || url.port || url.username || url.password) return null;
    const match = url.pathname.match(/^\/(p|reel|tv)\/([a-zA-Z0-9_-]+)\/?$/);
    return match ? `https://www.instagram.com/${match[1]}/${match[2]}/` : null;
  } catch { return null; }
}

const safeURL = (value: string) => {
  if (!value) return true;
  if (/^\/(?!\/)[^\\\s]*$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
};
const imageURL = (value: string) => {
  if (!value || /^\/(?!\/)[^\\\s]*$/.test(value)) return true;
  try { const url = new URL(value); return safeURL(value) && (url.hostname.endsWith('.supabase.co') || ['images.unsplash.com', 'picsum.photos'].includes(url.hostname)); } catch { return false; }
};

export const WorkItemSchema = z.object({
  id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  kind: z.enum(workKinds), title: z.string().trim().min(1, 'Judul wajib diisi.').max(140),
  description: z.string().max(500).default(''), image: z.string().max(2000).refine(imageURL, 'Gunakan upload gambar atau URL gambar Supabase yang valid.').default(''),
  imageAlt: z.string().max(250).default(''), url: z.string().max(2000).refine(safeURL, 'Gunakan tautan HTTPS atau path lokal.').default(''),
  published: z.boolean(), demo: z.boolean(),
  artwork: z.enum(['listing', 'meta', 'mbg', 'hub', 'schedule', 'sample']).default('sample'),
}).superRefine((item, ctx) => {
  if (item.kind === 'video' && item.url && !instagramURL(item.url)) ctx.addIssue({code: 'custom', path: ['url'], message: 'Gunakan link Instagram /reel/, /p/, atau /tv/.'});
  if (item.published && !item.demo && item.kind !== 'design' && !item.url) ctx.addIssue({code:'custom', path:['url'],message:'Tautan wajib diisi untuk karya asli yang ditampilkan.'});
  if (item.published && item.kind === 'design' && !item.image) ctx.addIssue({code:'custom',path:['image'],message:'Gambar desain wajib diisi sebelum ditampilkan.'});
});
export type WorkItem = z.infer<typeof WorkItemSchema>;
export const WorksSchema = z.object({items:z.array(WorkItemSchema).max(150)}).superRefine(({items},ctx)=>{
  if (new Set(items.map(item=>item.id)).size !== items.length) ctx.addIssue({code:'custom',path:['items'],message:'ID karya harus unik.'});
});
