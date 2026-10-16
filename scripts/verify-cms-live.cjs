const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {env,runtime,root}=require('./cms-script-runtime.cjs');
const {createClient}=require('@supabase/supabase-js');
const {NextRequest}=require('next/server');
env();
(async()=>{
 const load=runtime(),cms=load('lib/db/cms.ts'),works=load('lib/db/works.ts'),site=load('lib/db/site.ts');
 const publicClient=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
 for(const table of ['portfolio_cms_documents','portfolio_login_limits','portfolio_media']){const {error}=await publicClient.from(table).select('*');assert.equal(error?.code,'42501',`Public role can read ${table}`);}
 console.log('PASS private CMS tables deny anonymous reads');
 if(!process.argv.includes('--write-check'))return;
 const folder=path.join(root,'.cms-backups');fs.mkdirSync(folder,{recursive:true});
 const backup={works:await works.getWorksDocument(),site:await site.getSiteDocument()};fs.writeFileSync(path.join(folder,`before-live-qa-${Date.now()}.json`),JSON.stringify(backup,null,2));
 let expectedWorks=backup.works.revision,expectedSite=backup.site.revision;
 try{
  const edited=structuredClone(backup.works.draft.items);edited[0].title='CMS QA draft';
  const first=await works.changeWorks({action:'save',revision:expectedWorks,items:edited});expectedWorks=first.revision;
  assert.equal((await works.getPublicWorks()).items.find(item=>item.id===edited[0].id).title,backup.works.published.items.find(item=>item.id===edited[0].id).title);
  await assert.rejects(works.changeWorks({action:'save',revision:backup.works.revision,items:[]}));
  const ids=edited.map(item=>item.id).reverse();const ordered=await works.changeWorks({action:'order',revision:expectedWorks,ids});expectedWorks=ordered.revision;
  assert.equal((await works.getPublicWorks()).items.find(item=>item.id===edited[0].id).title,backup.works.published.items.find(item=>item.id===edited[0].id).title);
  const published=await works.changeWorks({action:'publish',revision:expectedWorks});expectedWorks=published.revision;assert.equal((await works.getPublicWorks()).items.find(item=>item.id===edited[0].id).title,'CMS QA draft');
  console.log('PASS real database draft isolation, stale-write rejection, order-only publication and explicit publish');
  const current=await site.getSiteDocument();const content=structuredClone(current.draft);content.values.headline='CMS QA draft';const saved=await cms.writeCMS('site',current,content);expectedSite=saved.revision;
  assert.equal((await site.getPublicSite()).values.headline,backup.site.published.values.headline);
  const publicSite=await cms.writeCMS('site',saved,content,content);expectedSite=publicSite.revision;assert.equal((await site.getPublicSite()).values.headline,'CMS QA draft');
  console.log('PASS real site draft/publish roundtrip');
 }finally{
  for(const [id,get,expected]of [['works',works.getWorksDocument,expectedWorks],['site',site.getSiteDocument,expectedSite]]){const current=await get();assert.equal(current.revision,expected,`${id}: external edit detected; restore manually from backup`);await cms.writeCMS(id,current,backup[id].draft,backup[id].published);const restored=await get();assert.deepEqual(restored.draft,backup[id].draft);assert.deepEqual(restored.published,backup[id].published);}
  console.log('PASS original draft and published content restored exactly');
 }
 const media=runtime({'@/lib/auth/session':{verifyAdminSession:async()=>true}})('app/api/admin/media/route.ts');
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6fWQAAAAASUVORK5CYII=','base64');const form=new FormData();form.append('file',new Blob([png],{type:'image/png'}),'cms-qa.png');form.append('folder','works');
 const response=await media.POST(new NextRequest('http://127.0.0.1:3001/api/admin/media',{method:'POST',headers:{origin:'http://127.0.0.1:3001'},body:form}));assert.equal(response.status,200,await response.clone().text());const uploaded=await response.json();
 const client=load('lib/supabase/admin.ts').createAdminClient();
 const proxy=runtime({'@/lib/auth/session':{verifyAdminSession:async()=>false}})('app/api/media/[...path]/route.ts');
 const mediaRequest=()=>proxy.GET(new NextRequest('http://127.0.0.1:3001'+uploaded.url),{params:Promise.resolve({path:uploaded.storage_path.split('/')})});
 const previousSite=await site.getSiteDocument();let changedSiteRevision=previousSite.revision;
 try{
  const privateRead=await publicClient.storage.from(uploaded.bucket).download(uploaded.storage_path);assert.ok(privateRead.error);
  assert.equal((await mediaRequest()).status,404);
  const snapshot=structuredClone(previousSite.published);snapshot.values.heroImage=uploaded.url;
  const next=await cms.writeCMS('site',previousSite,previousSite.draft,snapshot);changedSiteRevision=next.revision;
  const served=await mediaRequest();assert.equal(served.status,200);assert.equal(served.headers.get('content-type'),'image/png');
  console.log('PASS real private upload + anonymous media denial before publish + public media proxy after publish (admin authorization simulated, not a login test)');
 }finally{
  const current=await site.getSiteDocument();assert.equal(current.revision,changedSiteRevision);await cms.writeCMS('site',current,previousSite.draft,previousSite.published);
  const {error}=await client.storage.from(uploaded.bucket).remove([uploaded.storage_path]);if(error)throw error;console.log('PASS site snapshot restored and disposable private QA image removed');
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
