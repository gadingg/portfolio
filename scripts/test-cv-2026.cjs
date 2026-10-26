const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {runtime}=require('./cms-script-runtime.cjs');
const latest=require('../lib/cv-2026.json');
const legacy={values:{headline:'Custom headline'},cv:{name:'Old profile',profile:'Old',role:'Old',capabilities:'Old',pdf:'',experience:[]}};
function site(draft,published=draft){return runtime({'./cms':{readCMS:async()=>({draft,published,revision:4}),readPublishedCMS:async()=>published}})('lib/db/site.ts');}

test('existing public and admin documents adopt the supplied CV edition without changing other site fields',async()=>{
  const db=site(legacy);const publicSite=await db.getPublicSite(),admin=await db.getSiteDocument();
  for(const entry of [publicSite,admin.draft,admin.published]){
    assert.deepEqual(entry.cv,latest);assert.equal(entry.values.headline,'Custom headline');
  }
  assert.equal(legacy.cv.name,'Old profile');
});
test('edits and uploaded PDFs for the current edition survive subsequent reads and validation',async()=>{
  const current={...legacy,cv:{...latest,profile:'My updated profile',pdf:'/assets/custom.pdf',education:[]}};
  assert.deepEqual((await site(current).getPublicSite()).cv,current.cv);
  const load=runtime();const {SiteSchema}=load('lib/site.ts');const initial=await load('lib/db/site.ts').initialSite();
  const result=SiteSchema.parse({...initial,cv:current.cv});
  assert.equal(result.cv.profile,'My updated profile');assert.equal(result.cv.pdf,'/assets/custom.pdf');assert.deepEqual(result.cv.education,[]);
});
test('download endpoint returns the original PDF bytes with an attachment filename',async()=>{
  const route=runtime({'@/lib/db/site':{getPublicSite:async()=>({cv:latest,values:{}})},'@/lib/auth/session':{verifyAdminSession:async()=>false}})('app/api/cv/route.ts');
  const response=await route.GET({nextUrl:new URL('https://portfolio.test/api/cv'),url:'https://portfolio.test/api/cv'});
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.equal(response.headers.get('Content-Type'),'application/pdf');
  assert.match(response.headers.get('Content-Disposition'),/attachment; filename="CV Gading Utama 2026.pdf"/);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'8446bfbf6555c578f14068980f6200413a29c8674547e9b70cffa28c4d7be446');
  assert.deepEqual(bytes,fs.readFileSync('public/assets/cv/cv-gading-utama-2026.pdf'));
  const denied=await route.GET({nextUrl:new URL('https://portfolio.test/api/cv?preview=1')});assert.equal(denied.status,401);
});
test('custom uploaded PDF and authorized draft preview keep their own destinations',async()=>{
  const route=runtime({'@/lib/db/site':{getPublicSite:async()=>({cv:{...latest,pdf:'/custom-live.pdf'}}),getSiteDocument:async()=>({draft:{cv:{...latest,pdf:'/custom-draft.pdf'}}})},'@/lib/auth/session':{verifyAdminSession:async()=>true}})('app/api/cv/route.ts');
  for(const [query,path] of [['','/custom-live.pdf'],['?preview=1','/custom-draft.pdf']]){
    const url=`https://portfolio.test/api/cv${query}`;const response=await route.GET({nextUrl:new URL(url),url});assert.equal(response.headers.get('Location'),`https://portfolio.test${path}`);
  }
});
