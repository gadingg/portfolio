import 'server-only';
import { randomUUID } from 'node:crypto';
import { load } from 'cheerio';
import { AIApplySchema, type AIStudy } from './ai-study';
import { WorksDraftSchema, type WorkItem } from './works';
import type { CMSBlock } from './content-blocks';
import { cleanVisualLayout } from './visual-layout';
import { editorialCaseLayout } from './case-layout';
export class AIApplyError extends Error {}

function narrativeBlocks(result: AIStudy): CMSBlock[] {
  return result.sections.flatMap(section => [
    { id:randomUUID(), block_type:'heading' as const, block_order:0, content_json:{text:section.heading,level:2} },
    { id:randomUUID(), block_type:'paragraph' as const, block_order:0, content_json:{text:section.body} },
  ]);
}
export function applyAIStudy(items: WorkItem[], input: unknown): { items: WorkItem[]; id: string } {
  const data = AIApplySchema.parse(input), current = data.id ? items.find(item => item.id === data.id) : undefined;
  if (data.id && !current) throw new AIApplyError('Portfolio tidak ditemukan. Muat ulang daftar portfolio.');
  if (current && (current.kind !== 'webapp' || !current.caseStudy)) throw new AIApplyError('Pilih portfolio Website / Apps yang memiliki studi kasus.');
  const id = current?.id || `ai-${randomUUID()}`;
  const slug = current?.caseStudy?.slug || data.result.slug;
  if (items.some(item => item.id !== id && [item.caseStudy?.slug,...(item.aliases || [])].includes(slug))) throw new AIApplyError('Slug sudah dipakai. Ubah slug draft AI sebelum menerapkannya.');
  const generated = narrativeBlocks(data.result), remaining = [...generated];
  const existing = current?.caseStudy?.blocks || [];
  const blocks: CMSBlock[] = existing.flatMap(block => ['heading','paragraph','divider'].includes(block.block_type) ? (block.block_type === 'divider' ? [] : remaining.length ? [remaining.shift()!] : []) : [block]);
  blocks.push(...remaining);
  const summary = { problem:data.result.problem, solution:data.result.approach, impact:data.result.outcome };
  let layout = current?.caseStudy?.layout;
  if (layout) {
    const editorial = editorialCaseLayout(layout,summary), $ = load(editorial.html,null,false);
    $('h1').first().text(data.result.title); $('.case-intro p').first().text(data.result.description);
    const appLinks=$('.case-intro a').filter((_index,element)=>$(element).attr('href')===current?.caseStudy?.appUrl||/^Open app/.test($(element).text().trim()));
    if(data.appUrl){
      if(appLinks.length)appLinks.attr('href',data.appUrl);
      else $('.case-intro').first().append($('<a class="button button-outline" target="_blank" rel="noopener noreferrer">Open app</a>').attr('href',data.appUrl));
    }else appLinks.remove();
    let story = $('.study-case-blocks').first();
    if (!story.length) story = $('.case-narrative').first();
    if (!story.length) throw new AIApplyError('Layout visual ini belum punya area cerita yang bisa direvisi otomatis. Rapikan area cerita melalui editor visual terlebih dahulu.');
    const fresh = data.result.sections.flatMap(section => [
      $('<h2></h2>').text(section.heading), $('<p class="case-copy"></p>').text(section.body),
    ]);
    const old = story.children('h2,h3,p,.case-section-break,hr');
    let next = 0;
    old.each((_at,node) => { if (next < fresh.length) $(node).replaceWith(fresh[next++]); else $(node).remove(); });
    while (next < fresh.length) story.append(fresh[next++]);
    // The cover is the portfolio asset; narrative screenshots are left untouched.
    const cover = $('.case-cover-art img,.project-art img').first();
    if (cover.length) { cover.attr('src',data.image).attr('alt',data.imageAlt || data.result.title).removeAttr('srcset').removeAttr('sizes'); }
    layout = cleanVisualLayout({html:$.html(),css:editorial.css});
  }
  const item: WorkItem = {
    ...(current || { id,kind:'webapp' as const,published:false,demo:false,artwork:'sample' as const }),
    title:data.result.title, description:data.result.description, image:data.image, imageAlt:data.imageAlt || data.result.title, url:`/work/${slug}`,
    caseStudy:{...current?.caseStudy,...summary,slug,appUrl:data.appUrl,blocks:blocks.map((block,at)=>({...block,block_order:at})),...(layout?{layout}:{})},
    aiDraft:{brief:data.brief,confirmations:data.result.confirmations,screenshots:data.result.screenshots,generatedAt:new Date().toISOString()},
  };
  const next = current ? items.map(value => value.id === id ? item : value) : [...items,item];
  return { items:WorksDraftSchema.parse({items:next}).items,id };
}
