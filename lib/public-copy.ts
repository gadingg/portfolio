import 'server-only';
import { load } from 'cheerio';
import edition from './public-copy-content.json';
import type { SiteContent } from './site';
import type { WorkItem } from './works';
import type { VisualLayout } from './visual-layout';
import type { CMSBlock } from './content-blocks';

const normalize = (value: string) => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
type TextMap = Record<string, string>;
type RemovedSection = { heading: string; paragraph: string };
const shared: TextMap = edition.shared;
const cases: Record<string, { text: TextMap; removeSections: RemovedSection[] }> = edition.cases;

function replacements(map: TextMap) {
  const entries = new Map(Object.entries(map).map(([before, after]) => [normalize(before), after]));
  return (value: string) => entries.get(normalize(value)) ?? value;
}

export function refineCopyLayout(layout: VisualLayout, text: TextMap = {}, remove: RemovedSection[] = []): VisualLayout {
  const $ = load(layout.html), replace = replacements({ ...shared, ...text });
  for (const section of remove) {
    $('h2,h3').each((_index, element) => {
      const heading = $(element), paragraph = heading.next();
      if (normalize(heading.text()) === normalize(section.heading) && paragraph.is('p') && normalize(paragraph.text()) === normalize(section.paragraph)) {
        heading.remove(); paragraph.remove();
      }
    });
  }
  $('h1,h2,h3,h4,p,figcaption,li,a,button').each((_index, element) => {
    const node = $(element), before = node.text(), after = replace(before);
    if (after === before || node.find('a,button,img,video,iframe,h1,h2,h3,h4,p,li').length) return;
    if (!after) { node.empty(); return; }
    const icons = node.find('svg').clone();
    node.empty().text(after).append(icons);
  });
  return { ...layout, html: $('body').html() || '' };
}

export function refineSiteCopy(site: SiteContent): SiteContent {
  const sameEdition = site.values.publicCopyEdition === edition.edition;
  const sameAbout=site.values.aboutEditorialVersion === '1',sameProcess=site.values.processCopyVersion === '2';
  if (sameEdition && sameAbout && sameProcess) return site;
  const values = { ...site.values };
  const changes = sameEdition ? { ...(!sameAbout?{aboutBody1:edition.site.aboutBody1}:{}), ...(!sameProcess?{processTitle4:edition.site.processTitle4}:{}) } : edition.site;
  for (const [key, change] of Object.entries(changes)) {
    if (change.from.some(before => normalize(before) === normalize(values[key] || ''))) values[key] = change.to;
  }
  values.publicCopyEdition = edition.edition;
  values.aboutEditorialVersion = '1';
  values.processCopyVersion = '2';
  const cv = !sameEdition && site.cv.profile === edition.cvProfile.from ? { ...site.cv, profile: edition.cvProfile.to } : site.cv;
  const text = Object.fromEntries(Object.values(changes).flatMap(change => change.from.map(before => [before, change.to])));
  return { ...site, values, cv, ...(site.layout ? { layout: refineCopyLayout(site.layout, text) } : {}) };
}

export function refineWorkCopy(item: WorkItem): WorkItem {
  const workEdition = item.caseStudy && cases[item.caseStudy.slug] ? '2026-11-03-webapp-story-copy' : edition.edition;
  if (item.caseStudy?.slug === 'mydaily' && item.imageAlt === 'Mockup tiga ponsel Daily App Gading') {
    item = { ...item, imageAlt: 'Tiga layar Literally... My Daily App: ringkasan harian, keuangan, dan kebiasaan.' };
  }
  if (item.copyEdition === workEdition) return item;
  const profile = item.caseStudy && cases[item.caseStudy.slug];
  const replace = replacements({ ...shared, ...profile?.text });
  const next = { ...item, description: replace(item.description) };
  const design = edition.designs.find(design => design.id === item.id && design.image === item.image);
  if (design) {
    if (item.title === design.fromTitle) next.title = design.title;
    if (design.fromAlt.includes(item.imageAlt)) next.imageAlt = design.alt;
  }
  if (item.caseStudy) {
    const blocks: CMSBlock[] = [];
    for (let index = 0; index < item.caseStudy.blocks.length; index++) {
      const block = item.caseStudy.blocks[index], following = item.caseStudy.blocks[index + 1];
      if (block.block_type === 'heading' && following?.block_type === 'paragraph' && profile?.removeSections.some(section => normalize(String(block.content_json.text)) === normalize(section.heading) && normalize(String(following.content_json.text)) === normalize(section.paragraph))) {
        index++; continue;
      }
      const content = { ...block.content_json };
      for (const key of ['text', 'caption', 'label', 'description']) if (typeof content[key] === 'string') content[key] = replace(content[key]);
      if (Array.isArray(content.items)) content.items = content.items.map(value => typeof value === 'string' ? replace(value) : value);
      blocks.push({ ...block, block_order: blocks.length, content_json: content });
    }
    next.caseStudy = {
      ...item.caseStudy, problem: replace(item.caseStudy.problem), solution: replace(item.caseStudy.solution), impact: replace(item.caseStudy.impact), blocks,
      ...(item.caseStudy.layout ? { layout: refineCopyLayout(item.caseStudy.layout, profile?.text, profile?.removeSections) } : {}),
    };
  }
  return JSON.stringify(next) === JSON.stringify(item) ? item : { ...next, copyEdition: workEdition };
}
