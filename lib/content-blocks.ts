import { z } from 'zod';

export const contentURL = z
  .string()
  .max(2000)
  .refine((value) => {
    if (!value) return true;
    if (/^\/(?!\/)[^\\\s]*$/.test(value)) return true;
    try {
      const u = new URL(value);
      return u.protocol === 'https:' && !u.username && !u.password;
    } catch {
      return false;
    }
  }, 'Gunakan tautan HTTPS atau path lokal.');
export const mediaURL = contentURL.refine((value) => {
  if (!value || value.startsWith('/')) return true;
  try {
    return (
      new URL(value).hostname.endsWith('.supabase.co') ||
      ['images.unsplash.com', 'picsum.photos'].includes(new URL(value).hostname)
    );
  } catch {
    return false;
  }
}, 'Upload media atau gunakan URL gambar yang didukung.');
const text = z.string().max(12000),
  short = z.string().max(300);
const picture = z.object({
  url: mediaURL,
  alt: short.default(''),
  caption: short.optional(),
});
const blockContent = {
  heading: z.object({
    text,
    level: z.union([z.literal(2), z.literal(3)]).default(2),
  }),
  paragraph: z.object({ text }),
  image: picture.extend({
    width_mode: z.enum(['standard', 'wide', 'full']).optional(),
  }),
  gallery: z.object({
    images: z.array(picture).max(50),
    layout: z.enum(['grid', 'carousel']).optional(),
  }),
  video: z.object({
    url: mediaURL,
    poster: mediaURL.optional(),
    caption: short.optional(),
    autoplay: z.boolean().optional(),
  }),
  quote: z.object({
    quote: text,
    attribution: short.optional(),
    role: short.optional(),
  }),
  metrics: z.object({
    items: z
      .array(
        z.object({ value: short, label: short, description: short.optional() }),
      )
      .max(20),
  }),
  list: z.object({
    items: z.array(text).max(100),
    ordered: z.boolean().optional(),
  }),
  divider: z.object({ style: z.enum(['line', 'dots', 'space']).optional() }),
  link: z.object({
    url: contentURL,
    label: short,
    target: z.enum(['_blank', '_self']).optional(),
    description: short.optional(),
  }),
};
export const CMSBlockSchema = z
  .object({
    id: z.string().min(1).max(100),
    block_type: z.enum([
      'heading',
      'paragraph',
      'image',
      'gallery',
      'video',
      'quote',
      'metrics',
      'list',
      'divider',
      'link',
    ]),
    block_order: z.number().int().min(0).default(0),
    content_json: z.record(z.unknown()),
  })
  .superRefine((block, ctx) => {
    const parsed = blockContent[block.block_type].safeParse(block.content_json);
    if (!parsed.success)
      for (const issue of parsed.error.issues)
        ctx.addIssue({
          code: 'custom',
          path: ['content_json', ...issue.path],
          message: issue.message,
        });
  });
export type CMSBlock = z.infer<typeof CMSBlockSchema>;
export const CaseStudySchema = z.object({
  slug: z
    .string()
    .max(160)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.',
    ),
  problem: text.default(''),
  solution: text.default(''),
  impact: text.default(''),
  appUrl: contentURL.default(''),
  blocks: z.array(CMSBlockSchema).max(150).default([]),
});
