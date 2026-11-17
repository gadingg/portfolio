import 'server-only';
import { load } from 'cheerio';
import type { SiteContent } from '../site';
import { withInitialWorks } from '../work-card-html';
import { renderHomepage } from './site';
import { getPublicWorks } from '@/lib/db/works';

export async function renderSiteEditorPreview(draft:SiteContent){
  const {items}=await getPublicWorks();
  const slugs=items.flatMap(item=>item.caseStudy?[item.caseStudy.slug,...(item.aliases||[])]:[]);
  const $=load(withInitialWorks(await renderHomepage(draft,slugs,items),items));
  $('script,noscript,iframe').remove();
  $('video').removeAttr('autoplay').attr('preload','none');
  $('body').attr('data-cms-preview','true');
  return $.html();
}
