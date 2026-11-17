const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const {randomUUID}=require('node:crypto');
const {isDeepStrictEqual}=require('node:util');
const {env,root,runtime}=require('./cms-script-runtime.cjs');

async function main(){
  env();
  const load=runtime();
  const {readCMS,writeCMS}=load('lib/db/cms.ts');
  const {initialWorks}=load('lib/db/works.ts');
  const {WorksSchema}=load('lib/works.ts');
  const {homepageWorks}=load('lib/homepage-works.ts');
  const {sportyCase,sportySlug,sportyWorkId}=load('lib/gmd-sporty-content.ts');
  const current=await readCMS('works',initialWorks);
  if(!current.revision)throw Error('Existing CMS document required.');
  const matches=item=>item.id===sportyWorkId||item.caseStudy?.slug===sportySlug||item.aliases?.includes(sportySlug);
  if(current.published.items.some(matches))throw Error('A published project already uses this identity.');
  if(current.draft.items.some(matches)){
    console.log(JSON.stringify({status:'draft exists',id:sportyWorkId,revision:current.revision}));
    return;
  }
  const timestamp=Date.now();
  const assets=Object.fromEntries(['cover','flow','teams'].map(key=>[key,{
    name:`${key==='cover'?'works':'content'}/${timestamp}-${randomUUID()}.webp`,
    bytes:readFileSync(join(root,'public','assets','work','gmd-sporty',key+'.webp')),
  }]));
  const urls=Object.fromEntries(Object.entries(assets).map(([key,asset])=>[key,'/api/media/'+asset.name]));
  const date=new Date(timestamp).toISOString();
  const [item]=WorksSchema.parse({items:[{...sportyCase(urls),createdAt:date,updatedAt:date}]}).items;
  const draft={...current.draft,items:[...current.draft.items,item]};
  const selected=items=>homepageWorks(items).map(work=>work.id);
  if(!isDeepStrictEqual(selected(draft.items),selected(current.draft.items)))throw Error('Homepage selection changed.');
  if(!process.argv.includes('--apply')){
    console.log(JSON.stringify({status:'validated',id:item.id,route:item.url,assets:Object.keys(assets),revision:current.revision}));
    return;
  }
  const {createAdminClient}=load('lib/supabase/admin.ts');
  const {cmsMediaBucket}=load('lib/cms-media.ts');
  const storage=createAdminClient().storage.from(cmsMediaBucket);
  for(const asset of Object.values(assets)){
    const {error}=await storage.upload(asset.name,asset.bytes,{contentType:'image/webp',upsert:false,cacheControl:'3600'});
    if(error)throw error;
  }
  const saved=await writeCMS('works',current,draft);
  const reread=await readCMS('works',initialWorks);
  if(saved.revision!==reread.revision||!isDeepStrictEqual(reread.draft,draft)||
    !isDeepStrictEqual(reread.published,current.published))throw Error('CMS readback differs.');
  console.log(JSON.stringify({status:'draft saved',id:item.id,revision:reread.revision,publicUnchanged:true,assets:urls}));
}

main().catch(error=>{console.error(error.message);process.exitCode=1;});
