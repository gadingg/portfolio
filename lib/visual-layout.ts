import { z } from 'zod';
import sanitize from 'sanitize-html';
import postcss from 'postcss';

const RawLayoutSchema = z.object({
  html: z.string().max(700000),
  css: z.string().max(250000),
});
export type VisualLayout = z.infer<typeof RawLayoutSchema>;
export const VisualLayoutSchema = RawLayoutSchema.transform(value=>cleanVisualLayout(value));

export function cleanVisualLayout(input: unknown): VisualLayout {
  const layout = RawLayoutSchema.parse(input);
  const css = cleanVisualCSS(layout.css);
  const html = sanitize(layout.html, {
    allowedTags: [...sanitize.defaults.allowedTags, 'section', 'article', 'header', 'footer', 'main', 'nav', 'dialog', 'img', 'figure', 'figcaption', 'video', 'source', 'button', 'details', 'summary', 'svg', 'use', 'path', 'circle', 'line', 'polyline', 'rect'],
    allowedAttributes: {
      '*': ['id', 'class', 'title', 'role', 'aria-*', 'data-work-*', 'data-works*', 'data-carousel', 'data-carousel-*', 'data-close-dialog', 'data-retry-works', 'data-kind', 'data-category', 'data-cms-*', 'style', 'hidden', 'lang', 'tabindex'],
      a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height', 'loading'],
      video: ['src', 'poster', 'controls', 'muted', 'loop', 'playsinline', 'preload'], source: ['src', 'type'],
      details: ['open'], button: ['type', 'aria-label'],
      svg: ['viewBox', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'aria-hidden'],
      use: ['href'], path: ['d', 'fill'], circle: ['cx', 'cy', 'r'], line: ['x1', 'y1', 'x2', 'y2'], polyline: ['points'], rect: ['x', 'y', 'width', 'height', 'rx'],
    },
    allowedSchemes: ['https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    transformTags: {
      '*': (tagName, attribs) => {
        if (attribs.style) {
          try { attribs.style = cleanVisualCSS(`x{${attribs.style}}`).replace(/^x\s*\{/, '').replace(/\}$/, ''); }
          catch { delete attribs.style; }
        }
        for (const key of ['href', 'src', 'poster']) {
          const value = attribs[key];
          if (value && (/\\|[\u0000-\u001f]/.test(value) || value.startsWith('//'))) delete attribs[key];
        }
        if (tagName === 'a') attribs.rel = 'noopener noreferrer';
        return { tagName, attribs };
      },
    },
  });
  return { html, css };
}

export function cleanVisualCSS(value: string): string {
  if (/[<>]|expression\s*\(|javascript\s*:|vbscript\s*:|\\/i.test(value)) throw new Error('Style tidak valid.');
  const root = postcss.parse(value);
  root.walkAtRules(rule => { if (!['media', 'supports'].includes(rule.name)) rule.remove(); });
  root.walkDecls(decl => {
    if (/^(behavior|-moz-binding)$/i.test(decl.prop)) { decl.remove(); return; }
    for (const match of decl.value.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) {
      const url = match[1].trim();
      if (!/^\/(?!\/)[^\s]*$/.test(url) && !/^https:\/\/[^\s]+$/i.test(url)) throw new Error('URL style tidak valid.');
    }
  });
  return root.toString();
}
