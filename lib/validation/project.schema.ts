import { z } from 'zod';

export const ContentBlockSchema = z.object({
  id: z.string().optional(),
  project_id: z.string().optional(),
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
  block_order: z.number().int().nonnegative(),
  content_json: z.record(z.any()),
});

export const ProjectSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  subtitle: z.string().max(300).optional().nullable(),
  description: z.string().min(1, 'Description is required').max(1000),
  category: z.string().min(1, 'Category is required'),
  cover_image_url: z.string().url('Cover image must be a valid URL'),
  cover_image_alt: z.string().max(200).optional().nullable(),
  year: z.union([z.string(), z.number()]).optional().nullable(),
  status: z.enum(['draft', 'published']),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().default(0),
  client: z.string().max(100).optional().nullable(),
  role: z.string().max(100).optional().nullable(),
  duration: z.string().max(100).optional().nullable(),
  services: z.array(z.string()).optional().nullable(),
  tags: z.array(z.string()).optional(),
  blocks: z.array(ContentBlockSchema).optional(),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;
