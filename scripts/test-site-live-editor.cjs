const test=require('node:test');
const assert=require('node:assert/strict');
const {load}=require('cheerio');
const {runtime}=require('./cms-script-runtime.cjs');
const {NextRequest,NextResponse}=require('next/server');

test('live editor preview renders the unsaved snapshot without a database write or executable scripts',async()=>{
  const base=runtime({'./cms':{},'@/lib/db/works':{getPublicWorks:async()=>({items:[]})}});
  const {initialSite,renderHomepage}=base('lib/db/site.ts');
  const {renderSiteEditorPreview}=base('lib/db/site-editor-preview.ts');
  const current=await initialSite();
  const draft={...current,values:{...current.values,headline:'Draft heading\nDraft line'}};
  const preview=load(await renderSiteEditorPreview(draft));
  assert.match(preview('#hero-title').text(),/Draft heading/);
  assert.notEqual(load(await renderHomepage(current))('#hero-title').text(),preview('#hero-title').text());
  assert.equal(preview('body').attr('data-cms-preview'),'true');
  assert.equal(preview('script,iframe').length,0);
  assert.equal(preview('video[autoplay]').length,0);
});

test('live preview rejects unauthenticated, cross-origin, and invalid requests',async()=>{
  let allowed=false,renders=0;
  const base=runtime({
    './cms':{},
    '@/lib/auth/session':{verifyAdminSession:async()=>allowed},
    '@/lib/db/site':{},
    '@/lib/db/works':{},
    '@/lib/db/site-editor-preview':{renderSiteEditorPreview:async()=>{renders++;return '<h1>Draft</h1>';}},
  });
  const route=base('app/api/admin/preview/site/route.ts');
  const seed=await runtime({'./cms':{}})('lib/db/site.ts').initialSite();
  const req=(origin,content=seed)=>new NextRequest('https://portfolio.test/api/admin/preview/site',{
    method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(content),
  });
  assert.equal((await route.POST(req('https://portfolio.test'))).status,401);
  allowed=true;
  assert.equal((await route.POST(req('https://external.test'))).status,403);
  assert.equal((await route.POST(req('https://portfolio.test',{}))).status,400);
  assert.equal(renders,0);
  const ready=await route.POST(req('https://portfolio.test'));
  assert.equal(ready.status,200);
  assert.equal(renders,1);
  assert.equal(ready.headers.get('cache-control'),'no-store');
});

test('section mapping puts capabilities and footer with their actual preview regions',()=>{
  const base=runtime();
  const {siteFields}=base('lib/site.ts');
  const {websiteSectionForField}=base('lib/site-editor.ts');
  const section=key=>websiteSectionForField(siteFields.find(field=>field.key===key));
  assert.equal(section('capabilitiesTitle'),'capabilities');
  assert.equal(section('footerName'),'footer');
  assert.equal(section('linkedin'),'contact');
  assert.equal(section('seoTitle'),'settings');
});
