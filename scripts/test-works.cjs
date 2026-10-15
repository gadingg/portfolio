const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { NextRequest } = require('next/server');
const root = path.resolve(__dirname, '..');

function load(file, mocks = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const module = {exports:{}};
  new Function('require','module','exports',source)(name => name in mocks ? mocks[name] : require(name),module,module.exports);
  return module.exports;
}
const schema = load('lib/works.ts');
const work = {id:'real-video',kind:'video',title:'My video',description:'',image:'/assets/work/sample-design-1.svg',imageAlt:'Cover',url:'https://www.instagram.com/reel/abc_123/',published:true,demo:false,artwork:'sample'};

test('only canonical Instagram hosts and post paths are accepted',()=>{
  assert.equal(schema.instagramURL(work.url+'?utm_source=share'),'https://www.instagram.com/reel/abc_123/');
  for(const url of ['https://instagram.com.evil.test/reel/abc/','https://www.instagram.com@evil.test/reel/abc/','javascript:alert(1)','https://www.instagram.com/username/','https://www.instagram.com/reel/abc/embed/','http://www.instagram.com/reel/abc/']) assert.equal(schema.instagramURL(url),null,url);
});
test('published real works need a destination; hidden unfinished works can be saved',()=>{
  assert.equal(schema.WorkItemSchema.safeParse({...work,url:''}).success,false);
  assert.equal(schema.WorkItemSchema.safeParse({...work,url:'',published:false}).success,true);
  assert.equal(schema.WorkItemSchema.safeParse({...work,kind:'design',image:''}).success,false);
  assert.equal(schema.WorkItemSchema.safeParse({...work,kind:'webapp',url:'javascript:alert(1)'}).success,false);
  assert.equal(schema.WorksSchema.safeParse({items:[work,work]}).success,false);
});

test('admin route protects reads/writes, rejects stale edits, and persists valid input',async()=>{
  let auth=false, items=[work], revision='one', saves=0;
  const db={getWorks:async()=>({items,revision,initialized:true}),saveWorks:async next=>{items=next;revision='two';saves++;return {items,revision,initialized:true};}};
  const route=load('app/api/admin/works/route.ts',{'@/lib/auth/session':{verifyAdminSession:async()=>auth},'@/lib/db/works':db,'@/lib/works':schema});
  const request=(body,origin='https://portfolio.test')=>new NextRequest('https://portfolio.test/api/admin/works',{method:'PUT',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await route.GET()).status,401);assert.equal((await route.PUT(request({items:[],revision}))).status,401);
  auth=true;
  assert.equal((await route.PUT(request({items:[],revision},'https://evil.test'))).status,403);
  assert.equal((await route.PUT(request({items:[{...work,url:'https://evil.test'}],revision}))).status,400);
  assert.equal((await route.PUT(request({items:[],revision:'old'}))).status,409);
  assert.equal(saves,0);
  assert.equal((await route.PUT(request({items:[{...work,title:'Edited'}],revision}))).status,200);
  assert.equal((await (await route.GET()).json()).items[0].title,'Edited');assert.equal(saves,1);
  assert.equal((await route.PUT(request({items:[],revision:'two'}))).status,200);assert.deepEqual(items,[]);
});

test('public endpoint excludes hidden works and reports storage outages',async()=>{
  const route=load('app/api/works/route.ts',{'@/lib/db/works':{getWorks:async()=>({items:[work,{...work,id:'hidden',published:false}]})}});
  const response=await route.GET();assert.equal(response.headers.get('cache-control'),'no-store');assert.equal((await response.json()).items.length,1);
  const broken=load('app/api/works/route.ts',{'@/lib/db/works':{getWorks:async()=>{throw Error('storage');}}});assert.equal((await broken.GET()).status,503);
});

test('storage roundtrip preserves ordering, empty collections and hidden state; failures do not seed silently',async()=>{
  let stored=JSON.stringify({items:[]}), failure=null;
  const client={storage:{from:()=>({download:async()=>({data:stored?new Blob([stored]):null,error:failure}),upload:async(name,content)=>{stored=content;return {error:null};}})}};
  const db=load('lib/db/works.ts',{'server-only':{},'@/lib/supabase/admin':{createAdminClient:()=>client},'@/lib/supabase/public':{createPublicClient:()=>client},'./public-projects':{getPublishedProjects:async()=>[]},'./gallery':{getPublicGalleryItems:async()=>[]},'@/lib/project-presentation':{projectPresentations:{},useBriefArtwork:()=>false},'@/lib/works':schema});
  assert.deepEqual((await db.getWorks()).items,[]);
  await db.saveWorks([{...work,id:'second',published:false},work]);
  const loaded=await db.getWorks();assert.deepEqual(loaded.items.map(i=>i.id),['second','real-video']);assert.equal(loaded.items[0].published,false);
  failure={statusCode:'503',message:'Unavailable'};await assert.rejects(db.getWorks);
  failure={statusCode:'403',message:'Forbidden'};await assert.rejects(db.getWorks);
  failure={statusCode:'404',message:'Object not found'};assert.equal((await db.getWorks()).initialized,false);
});
