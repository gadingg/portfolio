import type { WorkItem } from './works';
import redirects from './case-slugs.json';

export const caseSlugRedirects: Record<string,string> = redirects;

export function normalizeWorkSlugs(items: WorkItem[]): WorkItem[] {
  return items.map(item=>{
    if(!item.caseStudy)return item;
    const slug=Object.prototype.hasOwnProperty.call(caseSlugRedirects,item.caseStudy.slug)?caseSlugRedirects[item.caseStudy.slug]:undefined;
    if(!slug)return item;
    const aliases=[...new Set([...(item.aliases||[]),item.caseStudy.slug,...Object.keys(caseSlugRedirects).filter(key=>caseSlugRedirects[key]===slug)])].filter(alias=>alias!==slug);
    return {...item,caseStudy:{...item.caseStudy,slug},url:`/work/${slug}`,aliases};
  });
}
