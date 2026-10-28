import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { siteFields, defaultCV, defaultLinkedIn, expertiseDefaults, type SiteContent } from '@/lib/site';
import { readCMS, readPublishedCMS } from './cms';
import { cleanVisualLayout } from '../visual-layout';
const activeTemplate = (name: string) => fs.readFile(path.join(process.cwd(), 'templates/active', name), 'utf8');
export async function homepageTemplate() {
  const [html, expertise] = await Promise.all([activeTemplate('homepage.html'), activeTemplate('what-i-do.html')]);
  const $ = load(html);
  $('[data-template-part="what-i-do"]').replaceWith(expertise);
  return $.html();
}
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
  const values: Record<string, string> = { ...expertiseDefaults, linkedin: defaultLinkedIn, ...site.values };
  const oldIntros = [
    'Saya suka mengubah ide jadi sesuatu yang benar-benar kepakai, dari visual sampai solusi digital.',
    'Saya suka mengembangkan ide jadi sesuatu yang benar-benar kepakai. Mulai dari campaign, visual, sampai web-app yang bikin workflow lebih simpel.',
    'Saya menggabungkan creative marketing, design, dan technology untuk mengubah ide atau masalah bisnis menjadi campaign, visual, dan web-app yang benar-benar bisa dipakai.',
  ];
  if (oldIntros.includes((values.intro || '').replace(/\s+/g, ' ').trim())) values.intro = 'From creative concepts to thoughtful design and useful digital products.\n2+ years across creative marketing, design, and product development.';
  const processCopy = [
    ['processTitle', 'How I work.', 'From idea to something useful.'],
    ['processTitle0', 'Observe', 'Understand'],
    ['processTitle1', 'Brainstorm', 'Explore'],
    ['processTitle2', 'Build', 'Design & Build'],
    ['processTitle3', 'Collaborate', 'Test & Refine'],
    ['processTitle4', 'Ownership', 'Deliver'],
  ];
  for (const [key, previous, next] of processCopy) if (values[key] === previous) values[key] = next;
  return { ...site, values };
};
export const getSiteDocument = async () => {
  const document = await readCMS('site', initialSite);
  return { ...document, draft: withSiteDefaults(document.draft), published: withSiteDefaults(document.published) };
};
export const getPublicSite = async () => withSiteDefaults(await readPublishedCMS('site', initialSite));
export async function renderHomepage(site: SiteContent,caseSlugs?:string[],caseStudyCount?:number) {
  const $ = load(await homepageTemplate());
  const values = withSiteDefaults(site).values;
  const pipelineTrack = $('.process-pipeline > .pipeline-track').first().clone();
  if(site.layout){
    const layout=cleanVisualLayout(site.layout);
    $('body').html(layout.html);
    $('head').append($('<style data-cms-layout>').text(layout.css));
    $('.capability-layout').replaceWith(await activeTemplate('what-i-do.html'));
  }
  $('.skip-link').remove();
  let main = $('main').first();
  if (!main.length) {
    $('body').children().not('script,style,link').wrapAll('<main id="main-content"></main>');
    main = $('main').first();
    if (!main.length) { $('body').append('<main id="main-content"></main>'); main = $('main').first(); }
  }
  if (!main.attr('id')) main.attr('id', 'main-content');
  main.attr('tabindex', '-1');
  $('body').prepend($('<a class="skip-link">').attr('href', `#${main.attr('id')}`).text('Skip to content'));
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
    if (field.key === 'intro') {
      el.text(value).attr('lang', 'en').css('white-space', 'pre-line');
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
  if (caseStudyCount !== undefined) {
    const heading = $('[data-work-kind="webapp"]').not('[data-collection]').find('.works-heading').first();
    heading.find('[data-works-count]').remove();
    if (heading.length) heading.append($('<p class="works-count" data-works-count aria-live="polite">').text(`${caseStudyCount} case ${caseStudyCount === 1 ? 'study' : 'studies'}`));
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
  $('.works-section > .section-heading p').remove();
  $('.process-section').each((_i, section) => {
    const process = $(section), list = process.find('.principles').first();
    process.find('.section-heading p, .principles li p').remove();
    if (list.length && !list.parent().hasClass('process-pipeline')) list.wrap('<div class="process-pipeline"></div>');
    const pipeline = process.find('.process-pipeline').first();
    if (pipeline.length) {
      pipeline.children('.pipeline-track').remove();
      pipeline.prepend(pipelineTrack.clone());
      const icons = [['search'], ['lightbulb'], ['pen-tool', 'code-2'], ['sliders-horizontal'], ['check-check']];
      list.children('li').each((index, element) => {
        const step = $(element);
        step.children('.pipeline-step-icon,.pipeline-step-icons').remove();
        step.prepend(`<span class="pipeline-step-icons" aria-hidden="true">${(icons[index] || ['check-check']).map(icon => `<svg class="icon pipeline-step-icon"><use href="/assets/icons/lucide.svg#${icon}"></use></svg>`).join('')}</span>`);
      });
    }
  });
  $('body').append('<script src="/assets/js/engagement.js" defer></script>');
  return $.html();
}
