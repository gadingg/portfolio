const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto'),{isDeepStrictEqual}=require('node:util');
const {env,runtime,root}=require('./cms-script-runtime.cjs');env();
(async()=>{
  const load=runtime(),{readCMS,writeCMS}=load('lib/db/cms.ts'),{initialWorks}=load('lib/db/works.ts');
  const {practicalTools,addPracticalTools,practicalToolIds}=load('lib/practical-tools-content.ts');
  const {WorksSchema}=load('lib/works.ts'),{homepageWorks}=load('lib/homepage-works.ts');
  const current=await readCMS('works',initialWorks);
  if(!current.revision)throw Error('Existing CMS document required.');
  const client=load('lib/supabase/admin.ts').createAdminClient(),bucket='portfolio-public',assets=new Map();
  function media(value){
    if(Array.isArray(value))return value.map(media);
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,media(item)]));
    if(typeof value!=='string'||!/^\/assets\/(work\/new-cases\/|motion\/(prompt|followup|rekapella))/.test(value))return value;
    const file=path.resolve(root,'public','.'+value),publicRoot=path.resolve(root,'public')+path.sep;
    if(!file.startsWith(publicRoot)||!fs.existsSync(file))throw Error('Missing or unsafe asset: '+value);
    const bytes=fs.readFileSync(file),hash=createHash('sha256').update(bytes).digest('hex').slice(0,16),name=`works/practical-tools-20261105/${hash}-${path.basename(file)}`;
    assets.set(value,{name,bytes,type:value.endsWith('.mp4')?'video/mp4':'image/webp'});
    return client.storage.from(bucket).getPublicUrl(name).data.publicUrl;
  }
  const at=new Date().toISOString();
  const additions=WorksSchema.parse({items:media(practicalTools()).map(item=>({...item,createdAt:at,updatedAt:at}))}).items;
  const draft={...current.draft,items:addPracticalTools(current.draft.items,additions)};
  const published={...current.published,items:addPracticalTools(current.published.items,additions)};
  for(const state of ['draft','published']){
    const next=state==='draft'?draft:published;
    if(!isDeepStrictEqual(next.items.filter(item=>!practicalToolIds.includes(item.id)),current[state].items))throw Error('Unrelated records changed.');
    if(!isDeepStrictEqual(homepageWorks(next.items).map(item=>item.id),homepageWorks(current[state].items).map(item=>item.id)))throw Error('Homepage selection changed.');
  }
  if(!process.argv.includes('--apply'))return console.log(JSON.stringify({mode:'preview',revision:current.revision,newCases:additions.map(item=>({id:item.id,path:item.url})),assets:assets.size,existingRecordsPreserved:true,homepagePreserved:true}));
  const backup=path.join(root,'.cms-backups',`before-practical-tools-${Date.now()}.json`);fs.mkdirSync(path.dirname(backup),{recursive:true});fs.writeFileSync(backup,JSON.stringify(current,null,2));
  for(const asset of assets.values()){
    const {error}=await client.storage.from(bucket).upload(asset.name,asset.bytes,{contentType:asset.type,upsert:false,cacheControl:'31536000'});
    if(error&&!/already exists|duplicate/i.test(error.message))throw error;
  }
  const saved=await writeCMS('works',current,draft,published),reread=await readCMS('works',initialWorks);
  if(!isDeepStrictEqual(reread.draft,draft)||!isDeepStrictEqual(reread.published,published))throw Error('CMS readback differs.');
  console.log(JSON.stringify({savedRevision:saved.revision,verified:true,existingRecordsPreserved:true,homepagePreserved:true,routes:additions.map(item=>item.url)}));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
