import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { siteFields, defaultCV, type SiteContent } from '@/lib/site';
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
export const getSiteDocument = () => readCMS('site', initialSite);
export const getPublicSite = () => readPublishedCMS('site', initialSite);
export async function renderHomepage(site: SiteContent,caseSlugs?:string[]) {
  const $ = load(await homepageTemplate());
  if(site.layout){
    const layout=cleanVisualLayout(site.layout);
    $('body').html(layout.html);
    $('head').append($('<style data-cms-layout>').text(layout.css));
  }
  const targets = new Map(
    siteFields.map((field) => [field.key, $(field.selector).first()]),
  );
  for (const field of siteFields) {
    const value = site.values[field.key];
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
  if(caseSlugs){const allowed=new Set(caseSlugs.map(slug=>`/work/${slug}`));$('a.strip-piece[href^="/work/"]').each((_i,element)=>{if(!allowed.has($(element).attr('href')||''))$(element).remove();});if($('.work-strip > a').length<3)$('.work-strip').addClass('cms-compact-strip');}
  $('body').append('<script src="/assets/js/engagement.js" defer></script>');
  return $.html();
}
