import { load } from 'cheerio';
import { publicWork, type WorkItem } from './works';
import { cleanPlaceholderCopy } from './placeholder-copy';

const escape = (text: string) => text.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));
const safeURL = (value: string) => {
  if (/^\/(?!\/)[^\\\s]*$/.test(value)) return value;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
};
export const worksJSON = (items: WorkItem[]) => JSON.stringify({items:items.filter(item=>item.published).map(publicWork)}).replace(/</g, '\\u003c');

export function workCardsHTML(items: WorkItem[], collection = false, showcase = false): string {
  return items.map(original => {
    const item = cleanPlaceholderCopy(original);
    const title = escape(item.title), src = safeURL(item.image), href = safeURL(item.caseStudy ? `/work/${item.caseStudy.slug}` : item.url);
    const heading = collection ? 'h2' : 'h4';
    const picture = src ? `<img src="${escape(src)}" alt="${escape(item.imageAlt || item.title)}" loading="lazy" decoding="async"/>` : `<span class="work-type-art"><span>${title}</span></span>`;
    const destination = item.demo ? 'Preview' : item.caseStudy ? 'View case study' : 'Open app';
    const arrow = '<svg class="icon" aria-hidden="true"><use href="/assets/icons/lucide.svg#arrow-right"></use></svg>';
    if (item.kind === 'webapp') {
      const content = `<span class="work-media work-art-${item.artwork}">${picture}</span><${heading} class="work-card-title">${title}</${heading}>${item.description ? `<p class="work-card-description">${escape(item.description)}</p>` : ''}<div class="work-card-meta"><span class="work-destination">${destination}${arrow}</span></div>`;
      return `<article class="work-card work-card-webapp">${href ? `<a class="work-card-link" href="${escape(href)}" aria-label="${destination}: ${title}"${href.startsWith('/') ? '' : ' target="_blank" rel="noopener noreferrer"'}>${content}</a>` : `<div class="work-card-link">${content}</div>`}</article>`;
    }
    const media = `<a class="work-media work-art-${item.artwork}" href="${escape(item.kind === 'video' && !item.demo ? safeURL(item.videoFile || item.url) || src : src)}" aria-label="${item.kind === 'design' ? 'Enlarge' : item.demo ? 'Preview' : 'Watch'}: ${title}">${picture}${item.kind === 'video' ? `<span class="video-bottom"><span class="video-play">${item.demo ? 'Preview' : 'Watch video'}</span><strong>${title}</strong></span>` : ''}</a>`;
    const caption = item.kind === 'design' ? `<div class="${showcase ? 'video-bottom design-showcase-caption' : 'work-caption'}"><${heading} class="work-card-title">${href ? `<a class="design-title-link" href="${escape(href)}">${title}</a>` : title}</${heading}><p class="work-category">Visual Design</p></div>` : '';
    return `<article class="work-card work-card-${item.kind}">${media}${caption}</article>`;
  }).join('');
}

export function withInitialWorks(html: string, items: WorkItem[]): string {
  const $ = load(html);
  $('[data-work-kind]').each((_index, element) => {
    const group = $(element), list = group.find('[data-works-list]').first();
    if (!list.length) return;
    group.find('.works-recovery').attr('hidden','');
    let selected = items.filter(item => item.published && item.kind === group.attr('data-work-kind'));
    const collection = group.attr('data-collection') === 'true';
    if (!collection && group.attr('data-work-kind') === 'webapp') selected = selected.slice(0, 6);
    list.html(workCardsHTML(selected, collection, !!group.find('.editorial-gallery').length) || '<p class="works-message">Belum ada portfolio di koleksi ini.</p>').attr('aria-busy', 'false');
  });
  $('#initial-works').remove();
  $('body').append(`<script id="initial-works" type="application/json">${worksJSON(items)}</script>`);
  if (!$('a[href="#main-content"]').length) $('body').prepend('<a class="skip-link" href="#main-content">Skip to content</a>');
  return $.html();
}
