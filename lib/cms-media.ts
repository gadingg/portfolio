import 'server-only';
import { unstable_cache } from 'next/cache';
import { createAdminClient } from './supabase/admin';
export const cmsMediaBucket='portfolio-cms-media';
function collectMedia(value:unknown, urls:Set<string>) {
  if(typeof value==='string'){
    for(const [url] of value.matchAll(/\/api\/media\/[A-Za-z0-9/_.-]+/g))urls.add(url);
  } else if(Array.isArray(value)){
    value.forEach(item=>collectMedia(item,urls));
  } else if(value&&typeof value==='object'){
    for(const [key,item] of Object.entries(value)){
      if(key==='archivedCaseStudy'||key==='aiDraft')continue;
      if(key==='motion'&&item&&typeof item==='object'&&(!('enabled' in item)||!item.enabled||!('video' in item)||!item.video))continue;
      collectMedia(item,urls);
    }
  }
}
export function referencesMedia(value:unknown,url:string):boolean {
  const urls=new Set<string>();
  collectMedia(value,urls);
  return urls.has(url);
}
async function readPublishedMediaIndex(){
  const {data,error}=await createAdminClient().from('portfolio_cms_documents').select('id,published');
  if(error)throw error;
  const urls=new Set<string>();
  for(const doc of data||[]){
    if(doc.id==='works')collectMedia((doc.published.items||[]).filter((item:{published:boolean})=>item.published),urls);
    if(doc.id==='site')collectMedia(doc.published,urls);
  }
  return [...urls];
}
export async function publishedMedia(url:string){
  const publishedMediaIndex=unstable_cache(readPublishedMediaIndex,[
    'published-media',process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||'',
  ],{revalidate:60,tags:['portfolio-cms-works','portfolio-cms-site']});
  return (await publishedMediaIndex()).includes(url);
}
