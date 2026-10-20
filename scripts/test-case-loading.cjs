const test=require('node:test'),assert=require('node:assert/strict');
const {runtime}=require('./cms-script-runtime.cjs');

test('all built-in case slugs shorten without losing data, aliases or input immutability',()=>{
 const {normalizeWorkSlugs,caseSlugRedirects}=runtime()('lib/work-slugs.ts');
 const items=Object.keys(caseSlugRedirects).map((slug,i)=>({id:String(i),title:'Original '+i,url:'/work/'+slug,caseStudy:{slug,blocks:[{content_json:{text:'Keep'}}]},aliases:['prior-'+i]}));
 const snapshot=structuredClone(items),result=normalizeWorkSlugs(items);
 result.forEach((item,i)=>{
  assert.equal(item.caseStudy.slug,caseSlugRedirects[items[i].caseStudy.slug]);
  assert.equal(item.url,'/work/'+item.caseStudy.slug);
  assert.ok(item.aliases.includes(items[i].caseStudy.slug));assert.ok(item.aliases.includes('prior-'+i));
  assert.deepEqual(item.caseStudy.blocks,items[i].caseStudy.blocks);assert.equal(item.title,items[i].title);
  assert.ok(!item.aliases.includes(item.caseStudy.slug));
 });
 assert.deepEqual(items,snapshot);assert.deepEqual(normalizeWorkSlugs(result),result);
 const custom={id:'custom',caseStudy:{slug:'custom-case',blocks:[]}};
 assert.equal(normalizeWorkSlugs([custom])[0],custom);
 const prototypeName={id:'custom-key',caseStudy:{slug:'constructor',blocks:[]}};
 assert.equal(normalizeWorkSlugs([prototypeName])[0],prototypeName);
});

test('cached public reads are bounded and drafts do not invalidate or leak into the published cache',async()=>{
 let row={draft:{secret:'private'},published:{value:'public'},revision:1,published_at:null};
 let reads=0,noStore=0,aborts=0;const entries=new Map(),invalidated=[];
 const client={from(){let selected,patch;const q={select(value){selected=value;return q;},eq(){return q;},abortSignal(signal){assert.ok(signal instanceof AbortSignal);aborts++;return q;},update(value){patch=value;return q;},maybeSingle:async()=>{
  if(patch){row={...row,...patch};return {data:structuredClone(row),error:null};}
  reads++;assert.equal(selected,'published');return {data:{published:structuredClone(row.published)},error:null};
 }};return q;}};
 const cache={unstable_noStore(){noStore++;},unstable_cache(fn,keys,options){assert.equal(options.revalidate,60);assert.ok(options.tags.includes('portfolio-cms-works'));return()=>{const key=JSON.stringify(keys);if(!entries.has(key))entries.set(key,fn());return entries.get(key);};},revalidateTag(tag){invalidated.push(tag);entries.clear();}};
 const db=runtime({'@/lib/supabase/admin':{createAdminClient:()=>client},'next/cache':cache})('lib/db/cms.ts');
 const initial=async()=>{throw Error('Unexpected fallback');};
 assert.deepEqual(await db.readPublishedCMS('works',initial,{cached:true}),{value:'public'});
 await db.readPublishedCMS('works',initial,{cached:true});assert.equal(reads,1);assert.equal(aborts,1);
 const draftOnly=await db.writeCMS('works',structuredClone(row),{secret:'new private'});
 assert.equal(invalidated.length,0);assert.deepEqual(await db.readPublishedCMS('works',initial,{cached:true}),{value:'public'});
 await db.writeCMS('works',draftOnly,draftOnly.draft,{value:'new public'});
 assert.deepEqual(invalidated,['portfolio-cms-works']);
 assert.deepEqual(await db.readPublishedCMS('works',initial,{cached:true}),{value:'new public'});assert.equal(reads,2);
 await db.readPublishedCMS('works',initial);assert.equal(noStore,1);assert.equal(reads,3);
});

test('a failed CMS response rejects instead of caching an empty project list',async()=>{
 const client={from(){const q={select:()=>q,eq:()=>q,abortSignal:()=>q,maybeSingle:async()=>({data:null,error:{message:'timeout'}})};return q;}};
 const db=runtime({'@/lib/supabase/admin':{createAdminClient:()=>client}})('lib/db/cms.ts');
 await assert.rejects(db.readPublishedCMS('works',async()=>({items:[]})),/belum bisa dimuat/);
});
