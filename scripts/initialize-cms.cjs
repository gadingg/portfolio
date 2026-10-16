const {env,runtime}=require('./cms-script-runtime.cjs');
env();
const load=runtime();
(async()=>{
 const client=load('lib/supabase/admin.ts').createAdminClient();
 const privateBucket=await client.storage.getBucket('portfolio-cms-media');
 if(privateBucket.error){const created=await client.storage.createBucket('portfolio-cms-media',{public:false,fileSizeLimit:4*1024*1024,allowedMimeTypes:['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','application/pdf']});if(created.error)throw created.error;console.log('INITIALIZED private media bucket');}
 else if(privateBucket.data.public)throw Error('CMS media bucket must be private.');
 for(const [id,initial,schema] of [
  ['works',load('lib/db/works.ts').initialWorks,load('lib/works.ts').WorksDraftSchema],
  ['site',load('lib/db/site.ts').initialSite,load('lib/site.ts').SiteSchema]
 ]){
  const existing=await client.from('portfolio_cms_documents').select('id').eq('id',id).maybeSingle();if(existing.error)throw existing.error;if(existing.data){console.log(`PRESERVED ${id}`);continue;}
  const content=schema.parse(await initial());const {error}=await client.from('portfolio_cms_documents').insert({id,draft:content,published:content,revision:1,published_at:new Date().toISOString()});if(error)throw error;console.log(`INITIALIZED ${id}`);
 }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
