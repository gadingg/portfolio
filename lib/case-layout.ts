import { load } from 'cheerio';
import type { VisualLayout } from './visual-layout';
import type { WorkItem } from './works';
import {caseAppLinks,type CaseAppLink} from './case-app-links';
import {caseMotion,type CaseMotionConfig} from './case-motion';

function applyAppActions($:ReturnType<typeof load>,study:{slug?:string;appUrl?:string;appLinks?:CaseAppLink[]}){
  const intro=$('.case-intro').first();if(!intro.length)return;
  intro.find('.case-app-actions').remove();
  intro.find('a').filter((_index,element)=>/^Open (app|All Database|Personal Listing)/.test($(element).text().trim())).remove();
  const links=caseAppLinks(study);if(!links.length)return;
  const nav=$('<nav class="case-app-actions" aria-label="Project apps"></nav>');
  links.forEach((link,index)=>nav.append($('<a target="_blank" rel="noopener noreferrer"></a>').attr('class','text-link').attr('href',link.url).text(link.label).append('<svg class="icon" aria-hidden="true"><use href="/assets/icons/lucide.svg#external-link"></use></svg>')));
  intro.append(nav);
}

export function syncCaseIdentity(previous: WorkItem | undefined, next: WorkItem): WorkItem {
  const layout=next.caseStudy?.layout;
  if(!previous||!layout)return next;
  const title=previous.title!==next.title,description=previous.description!==next.description;
  const cover=previous.image!==next.image||previous.imageAlt!==next.imageAlt;
  const app=previous.caseStudy?.appUrl!==next.caseStudy?.appUrl||JSON.stringify(previous.caseStudy?.appLinks)!==JSON.stringify(next.caseStudy?.appLinks);
  if(!title&&!description&&!cover&&!app)return next;
  const $=load(layout.html,null,false);
  if(title)$('.case-intro h1').first().text(next.title);
  if(description)$('.case-intro p').first().text(next.description);
  if(cover)$('.case-cover-art img,.project-art img').first().attr('src',next.image).attr('alt',next.imageAlt||next.title).removeAttr('srcset').removeAttr('sizes').removeAttr('width').removeAttr('height');
  if(app){
    const links=$('.case-intro a').filter((_index,element)=>$(element).attr('href')===previous.caseStudy?.appUrl||/^Open app/.test($(element).text().trim()));
    if(!next.caseStudy?.appUrl)links.remove();
    else if(links.length)links.attr('href',next.caseStudy.appUrl);
    else $('.case-intro').first().append($('<a class="button button-outline" target="_blank" rel="noopener noreferrer">Open app</a>').attr('href',next.caseStudy.appUrl));
    applyAppActions($,next.caseStudy!);
  }
  return {...next,caseStudy:{...next.caseStudy!,layout:{...layout,html:$.html()}}};
}

// Apply the shared reading structure without rewriting saved custom layouts.
export function editorialCaseLayout(layout: VisualLayout, summary?: { problem: string; solution: string; impact: string;slug?:string;appUrl?:string;appLinks?:CaseAppLink[];motion?:CaseMotionConfig }): VisualLayout {
  const $ = load(layout.html, null, false);
  // Older visual pages were seeded from the former draft preview's three sections.
  const legacy = $('.case-narrative>section').filter((_index, section) =>
    /^(The problem|The solution|The impact)$/.test($(section).children('h2').first().text().trim()) && $(section).children().length === 2 && $(section).children('p').length === 1
  );
  if (!$('.case-summary-step').length && legacy.length === 3) {
    const wrapper = $('<section class="case-overview" aria-label="Project overview"><div class="case-summary-grid"></div></section>');
    legacy.first().closest('.case-narrative').before(wrapper);
    legacy.addClass('case-summary-step').appendTo(wrapper.find('.case-summary-grid'));
  }
  const steps = $('.case-summary-step');
  const overview = steps.first().parents('section').first();
  if (steps.length === 3 && overview.length && !overview.is('.case-summary-step')) {
    const grid = $('<div class="case-summary-grid"></div>');
    steps.each((index, element) => {
      const step = $(element).clone();
      step.find('h2,h3').first().text(['Problem', 'Approach', 'Result'][index]);
      const copy = summary && [summary.problem, summary.solution, summary.impact][index];
      if (copy?.trim()) step.find('p').first().text(copy);
      grid.append(step);
    });
    overview.attr('class', 'case-overview').attr('aria-label', 'Project overview').removeAttr('aria-labelledby').empty().append(grid);
  } else if (!steps.length && summary && [summary.problem, summary.solution, summary.impact].some(text => text.trim())) {
    const section = $('<section class="case-overview" aria-label="Project overview"><div class="case-summary-grid"></div></section>');
    [summary.problem, summary.solution, summary.impact].forEach((text, index) => {
      if (!text.trim()) return;
      const step = $('<section class="case-summary-step"><h2></h2><p></p></section>');
      step.find('h2').text(['Problem','Approach','Result'][index]); step.find('p').text(text);
      section.find('.case-summary-grid').append(step);
    });
    const anchor = $('.case-cover-art,.project-art').first();
    if (anchor.length) anchor.after(section); else {
      const intro = $('.case-intro').first();
      if (intro.length) intro.after(section); else if ($('main').length) $('main').first().prepend(section); else $.root().prepend(section);
    }
  }
  $('.case-narrative hr,.study-case-blocks hr').replaceWith('<div class="case-section-break" aria-hidden="true"></div>');
  if(!$('.case-cover-art').length&&$('.project-art').length)$('.project-art').first().wrap('<figure class="case-cover-art"></figure>');
  $('main').has('.case-intro').first().addClass('case-page');
  $('.case-overview').each((_index,element)=>{
    const section=$(element);
    const heading = section.children('.case-summary-heading');
    if (heading.length) heading.text('Project overview');
    else section.prepend('<h2 class="case-summary-heading">Project overview</h2>');
    const intro=$('.case-intro').first(),visual=$('.case-cover-art,.project-art,.case-narrative,.study-case-blocks').first();
    const cover=$('.case-cover-art').first();
    if(cover.length&&!cover.find(section).length){if(intro.length&&!intro.find(cover).length)intro.after(cover);cover.after(section);}
    else if(intro.length&&!section.find(intro).length)intro.after(section);
    else if(visual.length&&!section.find(visual).length)visual.before(section);
  });
  if(summary?.slug)applyAppActions($,summary);
  $('[data-cms-motion-slot]').remove();
  if(summary?.slug&&caseMotion({...summary,slug:summary.slug}))$('.case-overview').first().after('<div data-cms-motion-slot class="case-motion-slot"></div>');
  $('.case-summary-step').each((index,element)=>{
    const title=$(element).find('h2,h3').first();
    if(title.text().trim()==='Outcome')title.text('Result');
    title.children('svg').remove();
    title.prepend(`<svg class="icon" aria-hidden="true"><use href="/assets/icons/lucide.svg#${['search','lightbulb','check-check'][index%3]}"></use></svg>`);
  });
  return { ...layout, html: $.html() };
}
