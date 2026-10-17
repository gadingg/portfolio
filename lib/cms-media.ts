import 'server-only';
import { createAdminClient } from './supabase/admin';
export const cmsMediaBucket='portfolio-cms-media';
export function referencesMedia(value:unknown,url:string):boolean {
  if(typeof value==='string')return value===url||(value.startsWith('/api/media/')&&value.split(/[?#]/)[0]===url)||[...value.matchAll(/\/api\/media\/[A-Za-z0-9/_.-]+/g)].some(match=>match[0]===url);
  if(Array.isArray(value))return value.some(item=>referencesMedia(item,url));
  if(value&&typeof value==='object')return Object.entries(value).some(([key,item])=>key!=='archivedCaseStudy'&&referencesMedia(item,url));
  return false;
}
export async function publishedMedia(url:string){
  const {data,error}=await createAdminClient().from('portfolio_cms_documents').select('id,published');
  if(error)throw error;
  return (data||[]).some(doc=>doc.id==='works'
    ? (doc.published.items||[]).filter((item:{published:boolean})=>item.published).some((item:unknown)=>referencesMedia(item,url))
    : referencesMedia(doc.published,url));
}
