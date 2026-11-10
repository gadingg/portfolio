import { PaletteSchema } from './public-palette';
import latestCV from './cv-2026.json';
import { z } from 'zod';
import { contentURL, mediaURL } from './content-blocks';
import { VisualLayoutSchema } from './visual-layout';
export const defaultLinkedIn = 'https://www.linkedin.com/in/gadingutama/';
export const defaultHeroMetadata = '2+ years in creative marketing & product development';
export const capabilityTitles = ['Creative Strategy & Digital Marketing','Visual Design & Branding','Web Apps & Digital Solutions','Generative AI & Automation'] as const;
export type SiteField = {
  key: string;
  label: string;
  group: string;
  selector: string;
  attribute?: 'href' | 'src' | 'alt' | 'content' | 'aria-label';
  lines?: boolean;
};
export const siteFields: SiteField[] = [
  {
    key: 'seoTitle',
    label: 'Judul browser',
    group: 'Identitas',
    selector: 'title',
  },
  {
    key: 'seoDescription',
    label: 'Deskripsi di hasil pencarian',
    group: 'Identitas',
    selector: 'meta[name="description"]',
    attribute: 'content',
  },
  {
    key: 'heroMetadata',
    label: 'Teks kecil di atas judul',
    group: 'Hero',
    selector: '.hero-metadata',
  },
  {
    key: 'headline',
    label: 'Judul utama',
    group: 'Hero',
    selector: '#hero-title',
    lines: true,
  },
  {
    key: 'intro',
    label: 'Deskripsi singkat',
    group: 'Hero',
    selector: '.hero-bottom > p',
  },
  {
    key: 'heroPrimary',
    label: 'Tombol portofolio',
    group: 'Hero',
    selector: '.hero-bottom .button',
  },
  {
    key: 'heroSecondary',
    label: 'Tombol kontak',
    group: 'Hero',
    selector: '.hero-bottom .text-link',
  },
  {
    key: 'worksTitle',
    label: 'Judul portofolio',
    group: 'Portofolio',
    selector: '#work-title',
  },
  {
    key: 'aboutTitle',
    label: 'Judul About',
    group: 'About',
    selector: '#about-title',
    lines: true,
  },
  {
    key: 'aboutSignature',
    label: 'Nama & peran',
    group: 'About',
    selector: '.about-signature',
    lines: true,
  },
  {
    key: 'aboutBody1',
    label: 'Quote',
    group: 'About',
    selector: '.about-copy .about-statement',
  },
  {
    key: 'aboutBody2',
    label: 'Cerita tentang saya',
    group: 'About',
    selector: '.about-copy > p:last-of-type',
  },
  {
    key: 'capabilitiesTitle',
    label: 'Judul What I Do',
    group: 'About',
    selector: '.capability-layout > h3',
  },
  ...Array.from({ length: 4 }, (_, i) => [
    {
      key: `capabilityTitle${i}`,
      label: `Layanan ${i + 1}`,
      group: 'Kemampuan',
      selector: `.capability-list > :nth-child(${i + 1}) :is(summary,h4)`,
    },
  ]).flat(),
  {
    key: 'processTitle',
    label: 'Judul How I Work',
    group: 'Proses',
    selector: '#process-title',
  },
  ...Array.from({ length: 5 }, (_, i) => [
    {
      key: `processTitle${i}`,
      label: `Langkah ${i + 1}`,
      group: 'Proses',
      selector: `.principles li:nth-child(${i + 1}) h3`,
    },
  ]).flat(),
  {
    key: 'toolkitTitle',
    label: 'Judul tools',
    group: 'Tools',
    selector: '#toolkit-title',
  },
  ...Array.from({ length: 3 }, (_, i) => [
    {
      key: `toolTitle${i}`,
      label: `Kategori tools ${i + 1}`,
      group: 'Tools',
      selector: `.toolkit-groups > div:nth-child(${i + 1}) h3`,
    },
    {
      key: `toolBody${i}`,
      label: `Daftar tools ${i + 1}`,
      group: 'Tools',
      selector: `.toolkit-groups > div:nth-child(${i + 1}) p`,
    },
  ]).flat(),
  {
    key: 'contactTitle',
    label: 'Judul kontak',
    group: 'Kontak',
    selector: '#contact-title',
    lines: true,
  },
  {
    key: 'contactBody',
    label: 'Deskripsi kontak',
    group: 'Kontak',
    selector: '.contact-layout > div p',
  },
  {
    key: 'contactButton',
    label: 'Tombol kontak',
    group: 'Kontak',
    selector: '.contact-layout .button',
  },
  {
    key: 'whatsapp',
    label: 'Link WhatsApp',
    group: 'Kontak',
    selector: '.contact-layout .button',
    attribute: 'href',
  },
  {
    key: 'instagram',
    label: 'Link Instagram',
    group: 'Kontak',
    selector: '.contact-bottom a[data-social="instagram"], .contact-bottom a[href*="instagram.com"]',
    attribute: 'href',
  },
  {
    key: 'instagramLabel',
    label: 'Label Instagram',
    group: 'Kontak',
    selector: '.contact-bottom a[data-social="instagram"], .contact-bottom a[href*="instagram.com"]',
    attribute: 'aria-label',
  },
  {
    key: 'linkedin',
    label: 'Link LinkedIn',
    group: 'Kontak',
    selector: '.contact-bottom a[data-social="linkedin"]',
    attribute: 'href',
  },
  {
    key: 'footerSignature',
    label: 'Teks footer',
    group: 'Kontak',
    selector: '.contact-bottom > span',
  },
  {
    key: 'footerName',
    label: 'Nama copyright',
    group: 'Kontak',
    selector: '.site-footer p',
  },
];
export const defaultCV = latestCV;
export const SiteSchema = z
  .object({
    palette: PaletteSchema.optional(),
    layout: VisualLayoutSchema.optional(),
    values: z.record(z.string().max(4000)).transform((values): Record<string, string> => ({ linkedin: defaultLinkedIn, heroMetadata: defaultHeroMetadata, ...values })),
    cv: z.object({
      sourceVersion: z.string().max(40).default(''),
      name: z.string().min(1).max(150),
      role: z.string().max(300),
      profile: z.string().max(4000),
      capabilities: z.string().max(2000),
      pdf: mediaURL,
      phone: z.string().max(100).default(''),
      email: z.union([z.literal(''), z.string().email().max(300)]).default(''),
      website: contentURL.default(''),
      location: z.string().max(300).default(''),
      languages: z.string().max(500).default(''),
      education: z.array(z.object({
        title: z.string().max(300),
        period: z.string().max(150),
        description: z.string().max(2000),
      })).max(30).default([]),
      experience: z
        .array(
          z.object({
            title: z.string().max(300),
            period: z.string().max(150),
            description: z.string().max(2000),
          }),
        )
        .max(30),
    }),
  })
  .superRefine((site, ctx) => {
    for (const field of siteFields) {
      const value = site.values[field.key];
      if (typeof value !== 'string') {
        ctx.addIssue({
          code: 'custom',
          message: `${field.label} belum tersedia.`,
        });
        continue;
      }
      const validator =
        field.attribute === 'href'
          ? contentURL
          : field.attribute === 'src'
            ? mediaURL
            : null;
      if (validator && !validator.safeParse(value).success)
        ctx.addIssue({
          code: 'custom',
          message: `${field.label}: link tidak valid.`,
        });
    }
  });
export type SiteContent = z.infer<typeof SiteSchema>;
