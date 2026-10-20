import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { siteFields, defaultCV, defaultLinkedIn, defaultHeroMetadata, type SiteContent } from '@/lib/site';
import { readCMS, readPublishedCMS } from './cms';
import { cleanVisualLayout } from '../visual-layout';
export const homepageTemplate = () =>
  fs.readFile(path.join(process.cwd(), 'public/index.html'), 'utf8');
export async function initialSite(): Promise<SiteContent> {
  const $ = load(await homepageTemplate());
  const values: Record<string, string> = {};
  for (const field of siteFields) {
    const el = $(field.selector).first();
    if (field.attribute) values[field.key] = el.attr(field.attribute) || '';
    else if (field.lines) {
      const copy = el.clone();
      copy.find('br').replaceWith('\n');
      values[field.key] = copy.text().trim();
    } else
      values[field.key] =
        el
          .contents()
          .filter((_i, node) => node.type === 'text')
          .text()
          .trim() || el.text().trim();
  }
  values.footerName = 'R. Gading Utama';
  return { values, cv: defaultCV };
}
const withSiteDefaults = (site: SiteContent): SiteContent => {
  const values: Record<string, string> = { linkedin: defaultLinkedIn, heroMetadata: defaultHeroMetadata, ...site.values };
  if (values.worksIntro === 'Website, visual, dan video. Pilihan karya dari ide sampai hasil yang bisa digunakan.') values.worksIntro = 'Karya visual dan digital yang menyelesaikan masalah.';
  const replacements: Record<string, [string, string]> = {
    headline: ['I think. I create.\nI solve.', 'I Think. I Create.\nI Solve.'],
    aboutLead: ['Saya suka ikut mikir dari awal.', 'Dari brainstorm, membuat visual, sampai membuat workflow lewat web-app dan AI.'],
    aboutBody1: ['Mulai dari mencari ide campaign, menyusun content, membuat visual, sampai melihat workflow yang ribet dan mencari cara supaya bisa dibuat lebih simpel lewat web-app atau AI.', 'Good visuals are nice, but good solutions are better.'],
    aboutBody2: ['Buat saya, hasil yang bagus bukan cuma terlihat menarik. Campaign harus punya tujuan, tools harus benar-benar kepakai, dan solusi harus membuat pekerjaan jadi lebih mudah.', 'Buat saya, bukan cuma soal visual yang menarik, tapi juga bagaimana pesan bisa tersampaikan dengan baik & masalah bisa diselesaikan.'],
  };
  for (const [key, [previous, next]] of Object.entries(replacements)) if (values[key]?.replace(/\u00a0/g, ' ').trim() === previous) values[key] = next;
  return { ...site, values };
};
export const getSiteDocument = async () => {
  const document = await readCMS('site', initialSite);
  return { ...document, draft: withSiteDefaults(document.draft), published: withSiteDefaults(document.published) };
};
export const getPublicSite = async () => withSiteDefaults(await readPublishedCMS('site', initialSite));
export async function renderHomepage(site: SiteContent,caseSlugs?:string[]) {
  const $ = load(await homepageTemplate());
  const values = withSiteDefaults(site).values;
  const pipelineTrack = $('.process-pipeline > .pipeline-track').first().clone();
  if(site.layout){
    const layout=cleanVisualLayout(site.layout);
    $('body').html(layout.html);
    $('head').append($('<style data-cms-layout>').text(layout.css));
  }
  const targets = new Map(
    siteFields.map((field) => [field.key, $(field.selector).first()]),
  );
  for (const field of siteFields) {
    const value = values[field.key];
    if (value === undefined) continue;
    const el = targets.get(field.key)!;
    if (field.attribute) {
      el.attr(field.attribute, value);
      continue;
    }
    if (field.key === 'footerName') {
      el.empty()
        .append(`© ${new Date().getFullYear()} `)
        .append($('<span>').text(value));
      continue;
    }
    if (field.key === 'seoTitle') {
      el.text(value);
      continue;
    }
    if (field.lines) {
      const lines = value.split('\n');
      el.empty();
      lines.forEach((line, i) => {
        if (i) el.append('<br>');
        const escaped = $('<span>').text(line).html() || '';
        if (i !== lines.length - 1) {
          el.append(escaped);
          return;
        }
        if (field.key === 'contactTitle') {
          const at = line.lastIndexOf(' ');
          el.append(
            $('<span>')
              .text(at < 0 ? '' : line.slice(0, at + 1))
              .html() || '',
          );
          el.append($('<em>').text(line.slice(at + 1)));
        } else
          el.append(
            $(['heroThinking'].includes(field.key) ? '<em>' : '<span>').text(
              line,
            ),
          );
      });
      continue;
    }
    const icons=el.children('svg,.icon').clone();
    el.empty().text(value).append(icons);
  }
  // Existing visual layouts retain their structure while public controls use the current treatment.
  $('#menu-toggle').removeClass('button button-outline').attr({ 'aria-label': 'Open menu', title: 'Open menu' }).empty().append('<svg class="icon" aria-hidden="true"><use href="/assets/icons/lucide.svg#menu"></use></svg>');
  $('.contact-bottom').each((_i, element) => {
    const footer = $(element);
    let links = footer.children('.social-links').first();
    if (!links.length) { footer.append('<div class="social-links"></div>'); links = footer.children('.social-links').first(); }
    for (const key of ['instagram', 'linkedin'] as const) {
      let link = footer.find(`a[data-social="${key}"], a[href*="${key}.com"]`).first();
      if (!values[key]) { link.remove(); continue; }
      if (!link.length) { links.append(`<a data-social="${key}"></a>`); link = links.find(`a[data-social="${key}"]`).first(); }
      link.attr({ class: 'social-icon', 'data-social': key, href: values[key], target: '_blank', rel: 'noopener noreferrer', title: key === 'instagram' ? 'Instagram' : 'LinkedIn', 'aria-label': key === 'instagram' ? values.instagramLabel || 'Instagram' : 'LinkedIn R. Gading Utama' });
      link.empty().append(`<svg class="icon" aria-hidden="true"><use href="/assets/icons/lucide.svg#${key}"></use></svg>`);
      links.append(link);
    }
  });
  $('.hero .work-strip, .hero .hero-signoff').remove();
  $('.hero-intro').empty().append($('<p class="hero-metadata">').text(values.heroMetadata));
  $('.about-copy').each((_i, element) => {
    const copy = $(element);
    copy.find('p').first().removeClass('lead-copy');
    copy.find('p').eq(1).addClass('about-statement');
  });
  $('#visuals').removeAttr('data-carousel').find('.carousel-controls').remove();
  $('#visuals [data-works-list]').removeClass('works-track works-grid').addClass('editorial-gallery').removeAttr('tabindex aria-label');
  $('#visuals .gallery-hint').remove();
  $('#visuals [data-works-list]').after('<p class="gallery-hint" id="visual-gallery-hint" hidden>Drag / Swipe to explore</p>');
  $('.process-section').each((_i, section) => {
    const process = $(section), list = process.find('.principles').first();
    process.find('.section-heading p, .principles li p').remove();
    if (list.length && !list.parent().hasClass('process-pipeline')) list.wrap('<div class="process-pipeline"></div>');
    const pipeline = process.find('.process-pipeline').first();
    if (pipeline.length) {
      pipeline.children('.pipeline-track').remove();
      pipeline.prepend(pipelineTrack.clone());
      const icons = ['search', 'lightbulb', 'code-2', 'users', 'check-check'];
      list.children('li').each((index, element) => {
        const step = $(element);
        step.children('.pipeline-step-icon').remove();
        step.prepend(`<svg class="icon pipeline-step-icon" aria-hidden="true"><use href="/assets/icons/lucide.svg#${icons[index] || 'check-check'}"></use></svg>`);
      });
    }
  });
  $('body').append('<script src="/assets/js/engagement.js" defer></script>');
  return $.html();
}
