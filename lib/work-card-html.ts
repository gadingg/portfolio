import { load } from 'cheerio';
import { instagramURL, publicWork, type WorkItem } from './works';
import { cleanPlaceholderCopy } from './placeholder-copy';
import { workThumbnail } from './work-images';
import { isReadyWork } from './work-readiness';
import { homepageWorks, homepagePreview } from './homepage-works';

const escape = (text: string) => text.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));
const safeURL = (value: string) => {
  if (/^\/(?!\/)[^\\\s]*$/.test(value)) return value;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
};
export const worksJSON = (items: WorkItem[]) => JSON.stringify({items:items.filter(item=>item.published).map(publicWork)}).replace(/</g, '\\u003c');

export function workCardsHTML(items: WorkItem[], collection = false, showcase = false, headingTag?: 'h3'): string {
  return items.map(original => {
    const item = cleanPlaceholderCopy(publicWork(original));
    const title = escape(item.title), src = safeURL(item.image), href = safeURL(item.caseStudy ? `/work/${item.caseStudy.slug}` : item.url);
    const heading = headingTag || (collection ? 'h2' : 'h4');
    const thumbnail=workThumbnail(src);
    const picture = src ? `<img src="${escape(thumbnail.src)}"${thumbnail.srcSet?` srcset="${escape(thumbnail.srcSet)}" sizes="${thumbnail.sizes}"`:''} alt="${escape(item.imageAlt || item.title)}" loading="lazy" decoding="async"/>` : `<span class="work-type-art"><span>${title}</span></span>`;
    const destination = item.demo ? 'Preview' : item.caseStudy ? 'View case study' : 'Open app';
    const arrow = '<svg class="icon" aria-hidden="true"><use href="/assets/icons/lucide.svg#arrow-right"></use></svg>';
    if (item.kind === 'webapp') {
      const content = `<span class="work-media work-art-${item.artwork}">${picture}</span><${heading} class="work-card-title">${title}</${heading}>${item.description ? `<p class="work-card-description">${escape(item.description)}</p>` : ''}<div class="work-card-meta"><span class="work-destination">${destination}${arrow}</span></div>`;
      return `<article data-ssr-work-id="${escape(item.id)}" class="work-card work-card-webapp">${href ? `<a class="work-card-link" href="${escape(href)}" aria-label="${destination}: ${title}"${href.startsWith('/') ? '' : ' target="_blank" rel="noopener noreferrer"'}>${content}</a>` : `<div class="work-card-link">${content}</div>`}</article>`;
    }
    const file=item.videoSource==='instagram'?'':safeURL(item.videoFile||''),instagramOriginal=instagramURL(item.url);
    const playable=!!file&&/\.(mp4|webm)(?:[?#].*)?$/i.test(file);
    const instagram=!!instagramOriginal&&!/\/DEMO_VIDEO_\d+\//.test(instagramOriginal);
    const videoLabel=playable?'Watch video':instagram?'View on Instagram':'Preview';
    const destinationURL=item.kind==='video'?(playable?file:instagram?instagramOriginal!:src):src;
    const external=item.kind==='video'&&!playable&&instagram;
    if (headingTag === 'h3') {
      const label = item.kind === 'design' ? 'View design' : videoLabel;
      const media = `<a class="work-media work-art-${item.artwork}" href="${escape(destinationURL)}" aria-label="${item.kind === 'design' ? 'Enlarge' : videoLabel}: ${title}"${external?' target="_blank" rel="noopener noreferrer"':''}>${picture}</a>`;
      const headingHTML = href && item.kind === 'design' ? `<a class="design-title-link" href="${escape(href)}">${title}</a>` : title;
      return `<article data-ssr-work-id="${escape(item.id)}" class="work-card work-card-${item.kind}"><div class="work-card-link work-card-interactive">${media}<h3 class="work-card-title">${headingHTML}</h3><div class="work-card-meta"><span class="work-destination">${label}${arrow}</span></div></div></article>`;
    }
    const media = `<a class="work-media work-art-${item.artwork}" href="${escape(destinationURL)}" aria-label="${item.kind === 'design' ? 'Enlarge' : videoLabel}: ${title}"${external?' target="_blank" rel="noopener noreferrer"':''}>${picture}${item.kind === 'video' ? `<span class="video-bottom"><span class="video-play">${videoLabel}</span><strong>${title}</strong></span>` : ''}</a>`;
    const caption = item.kind === 'design' ? `<div class="${showcase ? 'video-bottom design-showcase-caption' : 'work-caption'}"><${heading} class="work-card-title">${href ? `<a class="design-title-link" href="${escape(href)}">${title}</a>` : title}</${heading}></div>` : '';
    return `<article data-ssr-work-id="${escape(item.id)}" class="work-card work-card-${item.kind}">${media}${caption}</article>`;
  }).join('');
}

export function withInitialWorks(html: string, items: WorkItem[]): string {
  const $ = load(html);
  $('[data-work-kind]').each((_index, element) => {
    const group = $(element), list = group.find('[data-works-list]').first();
    if (!list.length) return;
    group.find('.works-recovery').attr('hidden','');
    const homepage=group.is('[data-homepage-limit]');
    let selected = items.filter(item => item.published && isReadyWork(item) && (group.attr('data-work-kind') === 'all' || item.kind === group.attr('data-work-kind')));
    const total = selected.length, link = group.find('.works-heading > a').first();
    if (link.length) {
      const kind = group.attr('data-work-kind'), heading = link.parent().find('h2,h3').first();
      if (heading.length) {
        if (!heading.parent().hasClass('works-heading-copy')) heading.wrap('<div class="works-heading-copy"></div>');
        heading.parent().find('.works-count').remove();
        const noun = kind === 'webapp' ? selected.every(item => item.caseStudy) ? 'case study' : 'project' : kind === 'design' ? 'design project' : 'video';
        heading.after($('<p class="works-count">').text(`${total} ${total === 1 ? noun : noun === 'case study' ? 'case studies' : `${noun}s`}`));
      }
      const icon = '<svg class="icon" aria-hidden="true"><use href="/assets/icons/lucide.svg#arrow-right"></use></svg>';
      link.addClass('button button-outline works-view-all').empty().text('View all').append(icon);
      link.attr('aria-label', `View all ${kind === 'webapp' ? 'web apps and case studies' : kind === 'design' ? 'design projects' : 'videos'}`);
    }
    const collection = group.attr('data-collection') === 'true';
    if(homepage){
      selected=homepagePreview(selected);
      $('#work .works-all-footer').attr('hidden',total>selected.length?null:'');
    }else if (!collection && group.attr('data-work-kind') === 'webapp') selected = homepageWorks(selected);
    list.html(workCardsHTML(selected, collection, !!group.find('.editorial-gallery').length,homepage?'h3':undefined) || '<p class="works-message">No portfolio items yet.</p>').attr('aria-busy', 'false');
  });
  $('#initial-works').remove();
  $('body').append(`<script id="initial-works" type="application/json">${worksJSON(items)}</script>`);
  if (!$('a[href="#main-content"]').length) $('body').prepend('<a class="skip-link" href="#main-content">Skip to content</a>');
  return $.html();
}
