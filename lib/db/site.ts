import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { siteFields, defaultCV, defaultLinkedIn, defaultHeroMetadata, capabilityTitles, type SiteContent } from '@/lib/site';
import { readCMS, readPublishedCMS } from './cms';
import { cleanVisualLayout } from '../visual-layout';
import { siteURL } from '../site-url';
import { refineSiteCopy } from '../public-copy';
import { isReadyWork } from '../work-readiness';
import { workThumbnail } from '../work-images';
import type { WorkItem } from '../works';
import { workFiltersHTML } from '../work-filters';
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
  values.capabilityLayoutVersion = '2';
  return { values, cv: defaultCV };
}
const withSiteDefaults = (site: SiteContent): SiteContent => {
  const values: Record<string, string> = { linkedin: defaultLinkedIn, heroMetadata: defaultHeroMetadata, ...site.values };
  if(values.capabilityLayoutVersion!=='2'){
    capabilityTitles.forEach((title,index)=>{values[`capabilityTitle${index}`]=title;});
    values.capabilityLayoutVersion='2';
  }
  const replacements: Record<string, [string, string]> = {
    headline: ['I think. I create.\nI solve.', 'I Think. I Create.\nI Solve.'],
    aboutLead: ['Saya suka ikut mikir dari awal.', 'Dari brainstorm, membuat visual, sampai membuat workflow lewat web-app dan AI.'],
    aboutBody1: ['Mulai dari mencari ide campaign, menyusun content, membuat visual, sampai melihat workflow yang ribet dan mencari cara supaya bisa dibuat lebih simpel lewat web-app atau AI.', 'Good visuals are nice, but good solutions are better.'],
    aboutBody2: ['Buat saya, hasil yang bagus bukan cuma terlihat menarik. Campaign harus punya tujuan, tools harus benar-benar kepakai, dan solusi harus membuat pekerjaan jadi lebih mudah.', 'Buat saya, bukan cuma soal visual yang menarik, tapi juga bagaimana pesan bisa tersampaikan dengan baik & masalah bisa diselesaikan.'],
  };
  for (const [key, [previous, next]] of Object.entries(replacements)) if (values[key]?.replace(/\u00a0/g, ' ').trim() === previous) values[key] = next;
  const editorialDefaults: Record<string, [string[], string]> = {
    heroMetadata: [['© 2026 SUB-IDN. Creative Marketing'], defaultHeroMetadata],
    intro: [['Saya menggabungkan creative marketing, design, dan technology untuk mengubah ide atau masalah bisnis menjadi campaign, visual, dan web-app yang benar-benar bisa dipakai.', 'Saya suka mengembangkan ide jadi sesuatu yang benar-benar kepakai. Mulai dari campaign, visual, sampai web-app yang bikin workflow lebih simpel.'], 'Saya suka mengubah ide jadi sesuatu yang benar-benar kepakai, dari visual sampai solusi digital.'],
    aboutTitle: [['More than\nexecuting\nthe brief.'], 'More than executing\nthe brief.'],
    aboutBody1: [['Good visuals are nice, but good solutions are better.'], 'Good visuals catch eyes. Great ideas make an impact.'],
    aboutBody2: [['Buat saya, bukan cuma soal visual yang menarik, tapi juga bagaimana pesan bisa tersampaikan dengan baik & masalah bisa diselesaikan.'], 'Buat saya, bukan cuma soal visual yang menarik, tapi juga bagaimana pesan bisa tersampaikan dengan baik dan pekerjaan jadi lebih simpel.'],
  };
  for (const [key, [previous, next]] of Object.entries(editorialDefaults)) if (previous.includes(values[key]?.replace(/\u00a0/g, ' ').trim())) values[key] = next;
  // Replace the previous CV edition on read, then retain edits saved against this edition.
  const cv = site.cv.sourceVersion === defaultCV.sourceVersion ? site.cv : structuredClone(defaultCV);
  return refineSiteCopy({ ...site, values, cv });
};
export const getSiteDocument = async () => {
  const document = await readCMS('site', initialSite);
  return { ...document, draft: withSiteDefaults(document.draft), published: withSiteDefaults(document.published) };
};
export const getPublicSite = async () => withSiteDefaults(await readPublishedCMS('site', initialSite, {cached:true}));
export async function renderHomepage(site: SiteContent,caseSlugs?:string[],aboutWorks:WorkItem[]=[]) {
  const $ = load(await homepageTemplate());
  const values = withSiteDefaults(site).values;
  const baseURL=siteURL();
  $('link[rel="canonical"],meta[property^="og:"],meta[name^="twitter:"]').remove();
  $('head').append($('<link rel="canonical">').attr('href',`${baseURL}/`));
  for(const [property,content] of Object.entries({'og:title':values.seoTitle,'og:description':values.seoDescription,'og:type':'website','og:url':`${baseURL}/`,'og:image':`${baseURL}/opengraph-image`,'og:image:alt':'Gading Utama, Creative Marketing & Digital Solutions'})) $('head').append($('<meta>').attr({property,content}));
  $('head').append($('<meta>').attr({name:'twitter:card',content:'summary_large_image'}));
  const pipelineTrack = $('.process-pipeline > .pipeline-track').first().clone();
  const designControls = $('#visuals .carousel-controls').first().clone();
  const capabilityCards = $('.capability-list > .capability-card').toArray().map(element => $(element).clone());
  if(site.layout){
    const layout=cleanVisualLayout(site.layout);
    $('body').html(layout.html);
    $('head').append($('<style data-cms-layout>').text(layout.css));
  }
  // Normalize older CMS layouts before binding fields so the quote and body stay distinct.
  $('.about-copy').each((_i, element) => {
    const copy = $(element);
    let statement = copy.find('.about-statement').first();
    if (!statement.length) statement = copy.find('p').eq(1).addClass('about-statement');
    copy.children('p').not(statement).slice(0, -1).remove();
    if (statement.length && !statement.parent().is('blockquote')) statement.wrap('<blockquote class="about-quote"></blockquote>');
  });
  if (values.aboutBody2 && !$('.about-copy > p:not(.about-statement)').length) $('.about-copy a').first().before('<p></p>');
  if (values.contactBody && !$('.contact-layout > div p').length) $('.contact-layout > div').last().prepend('<p></p>');
  if (values.footerSignature && !$('.contact-bottom > span').length) $('.contact-bottom').prepend('<span></span>');
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
  $('.contact-section .contact-email, .contact-section [data-contact-email], .contact-section a[data-social="email"]').remove();
  $('.contact-section [data-copy-email]').remove();
  if(site.cv.email) $('.contact-layout > div').last().append(
    $('<button type="button" class="button contact-copy-email" data-copy-email></button>').attr('data-email',site.cv.email).text('Salin Email').append('<svg class="icon" aria-hidden="true"><use href="/assets/icons/lucide.svg#mail"></use></svg>')
  );
  if(!$('#work [data-work-filters]').length) $('#work > .section-heading').after(workFiltersHTML());
  $('#work').attr('data-work-explorer','').attr('id','work');
  if(!$('#work #portfolio-results').length&&$('#work > .works-group').length) $('#work > .works-group').wrapAll('<div id="portfolio-results" class="portfolio-results"></div>');
  if (!$('script[src="/assets/js/contact-copy.js"]').length) $('body').append('<script src="/assets/js/contact-copy.js" defer></script>');
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
    if(site.cv.email) links.append($('<a class="social-icon" data-social="email" aria-label="Email Gading" title="Email Gading"></a>').attr('href',`mailto:${site.cv.email}`).append('<svg class="icon" aria-hidden="true"><use href="/assets/icons/lucide.svg#mail"></use></svg>'));
  });
  $('.hero .work-strip, .hero .hero-signoff').remove();
  $('.hero-intro').empty().append($('<p class="hero-metadata">').text(values.heroMetadata));
  $('.about-copy').each((_i, element) => {
    const copy = $(element);
    const statement=copy.find('.about-statement').first();
    if(statement.length){
      if(!statement.parent().is('blockquote'))statement.wrap('<blockquote class="about-quote"></blockquote>');
      else statement.parent().addClass('about-quote');
    }
  });
  $('.about-copy p,.contact-layout p,.contact-bottom > span').filter((_index, element) => !$(element).text().trim()).remove();
  $('.about-quote').each((_index, element) => {
    const quote = $(element), statement = quote.find('.about-statement');
    if (statement.text() === 'Plan campaigns. Design visuals. Build useful tools.') quote.replaceWith(statement);
  });
  const aboutLayout=$('#about .about-layout').first();
  if(aboutLayout.length&&!aboutLayout.attr('data-cms-about-version')){
    const intro=$('<div class="about-introduction"></div>');
    intro.append(aboutLayout.children().not('.about-workboard'));
    aboutLayout.prepend(intro).addClass('about-editorial').attr('data-cms-about-version','1');
    const heading=intro.find('#about-title');
    if(heading.parent().is(intro))heading.wrap('<div class="about-heading"></div>');else heading.parent().addClass('about-heading');
    const visible=aboutWorks.filter(item=>item.published&&isReadyWork(item)&&item.image);
    const poster=visible.find(item=>item.kind==='design'),app=visible.find(item=>item.kind==='webapp');
    if(!aboutLayout.find('.about-workboard').length&&poster&&app){
      const board=$('<figure class="about-workboard" aria-label="Visual design and web app work by Gading Utama"></figure>');
      for(const [item,kind] of [[poster,'poster'],[app,'app']] as const){
        const media=workThumbnail(item.image),piece=$('<div></div>').attr('class',`about-work-${kind}`);
        const image=$('<img loading="lazy" decoding="async">').attr({src:media.src,alt:item.imageAlt||item.title,width:kind==='poster'?'480':'720',height:kind==='poster'?'600':'540'});
        if(media.srcSet)image.attr({srcset:media.srcSet,sizes:kind==='poster'?'(max-width:767px) 52vw, 320px':'(max-width:767px) 64vw, 460px'});
        piece.append(image);board.append(piece);
      }
      aboutLayout.append(board);
    }
  }
  const aboutStatement=$('#about .about-statement').first();
  if(aboutStatement.text()==='Plan campaigns. Design visuals. Build useful tools.'){
    aboutStatement.empty();
    ['Plan campaigns.','Design visuals.','Build useful tools.'].forEach((line,index)=>{if(index)aboutStatement.append(' ');aboutStatement.append($('<span class="about-action-line"></span>').text(line));});
  }
  $('#menu-title').text('Menu');
  $('#mobile-menu > p').remove();
  const hero=$('main > #home, main > .hero').first(), about=$('main > #about').first(), works=$('main > #work').first();
  if(hero.length&&works.length){hero.after(works);if(about.length)works.after(about);}
  $('.works-section > .section-heading > p').remove();
  $('.works-heading > a').addClass('works-view-all');
  $('#visuals').attr('data-carousel','true').find('.carousel-controls').remove();
  $('#visuals [data-works-list]').removeClass('works-grid').addClass('editorial-gallery works-track').removeAttr('tabindex aria-label');
  $('#visuals .gallery-hint').remove();
  $('#visuals [data-works-list]').after(designControls);
  $('.capability-list').each((_index,element) => {
    const list=$(element);
    if(!list.hasClass('capability-bento-v2')||list.children('.capability-card').length!==4){
      list.empty().append(...capabilityCards.map(card=>card.clone()));
      list.addClass('capability-bento-v2');
    }
    list.children('.capability-card').each((index,card)=>{
      $(card).find('h4').first().text(values[`capabilityTitle${index}`]||capabilityTitles[index]);
      $(card).find('p,summary,.sample-label').remove();
    });
  });
  $('.capability-web .browser-front').each((_index,element)=>{if(!$(element).find('.browser-progress').length)$(element).append('<span class="browser-progress"></span>');});
  $('.capability-ai .ai-scene').each((_index,element)=>{if(!$(element).find('.ai-packet').length)$(element).append('<span class="ai-packet"></span>');});
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
        step.children('.pipeline-step-icon,.pipeline-step-icons').remove();
        step.prepend(index === 2
          ? '<svg class="icon pipeline-step-icon pipeline-design-build" aria-hidden="true"><use href="/assets/icons/lucide.svg#design-build"></use></svg>'
          : `<svg class="icon pipeline-step-icon" aria-hidden="true"><use href="/assets/icons/lucide.svg#${icons[index] || 'check-check'}"></use></svg>`);
      });
    }
  });
  $('body').append('<script src="/assets/js/engagement.js" defer></script>');
  if (!$('script[src="/assets/js/capabilities-motion.js"]').length) $('body').append('<script src="/assets/js/capabilities-motion.js" defer></script>');
  const work=$('#work');
  if(work.length){
    work.attr('data-homepage-works','');
    work.find('[data-work-filters],#portfolio-results,.works-group,.works-all-footer').remove();
    work.children('.section-heading').after(workFiltersHTML('all',true));
    work.append('<div id="portfolio-results" class="portfolio-results" data-work-kind="all" data-homepage-limit="6" aria-label="Selected portfolio"><div class="works-grid" data-works-list aria-busy="true"><p class="works-message" role="status">Loading portfolio…</p></div><div class="works-recovery" hidden><p role="status">Couldn\'t load the portfolio.</p><button type="button" class="button button-outline" data-retry-works>Try again</button></div></div><div class="works-all-footer"><a class="text-link" href="/works" data-view-all-works>View all works <svg class="icon" aria-hidden="true"><use href="/assets/icons/lucide.svg#arrow-right"></use></svg></a></div>');
  }
  return $.html();
}
