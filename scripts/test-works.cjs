const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const {NextRequest}=require('next/server');
const root=path.resolve(__dirname,'..');
function loader(mocks={}){const cache=new Map();function load(file){file=path.resolve(root,file);if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function('require','module','exports',source)(name=>{if(name in mocks)return mocks[name];if(name==='server-only')return {};if(name.startsWith('@/')||name.startsWith('.')){const base=name.startsWith('@/')?path.join(root,name.slice(2)):path.resolve(path.dirname(file),name);return load(fs.existsSync(base+'.ts')?base+'.ts':base);}return require(name);},module,module.exports);return module.exports;}return load;}
const schema=loader()('lib/works.ts');
const work={id:'video',kind:'video',title:'Real video',description:'',image:'/assets/work/sample-design-1.svg',imageAlt:'Cover',url:'https://www.instagram.com/reel/abc_123/',published:true,demo:false,artwork:'sample'};
const request=(body,origin='https://portfolio.test')=>new NextRequest('https://portfolio.test/api/admin/works',{method:'PUT',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});

test('Instagram destinations and publication requirements are validated independently from drafts',()=>{
 assert.equal(schema.instagramURL(work.url+'?utm_source=share'),work.url);
 for(const url of ['https://instagram.com.evil.test/reel/a/','https://www.instagram.com@evil.test/reel/a/','javascript:alert(1)','https://www.instagram.com/name/','http://instagram.com/reel/a/'])assert.equal(schema.instagramURL(url),null);
 assert.equal(schema.WorksDraftSchema.safeParse({items:[{...work,url:''}]}).success,true);
 assert.equal(schema.WorksSchema.safeParse({items:[{...work,url:''}]}).success,false);
 assert.equal(schema.WorksSchema.safeParse({items:[work,work]}).success,false);
});
test('content blocks reject incompatible payloads and unsafe destinations',()=>{
 const {CMSBlockSchema}=loader()('lib/content-blocks.ts');
 assert.equal(CMSBlockSchema.safeParse({id:'b',block_type:'gallery',content_json:{images:'wrong'}}).success,false);
 assert.equal(CMSBlockSchema.safeParse({id:'b',block_type:'link',content_json:{label:'Open',url:'javascript:alert(1)'}}).success,false);
 assert.equal(CMSBlockSchema.safeParse({id:'b',block_type:'paragraph',content_json:{text:'Actual paragraph'}}).success,true);
});
test('CMS compare-and-swap prevents stale writes and public reads select only the published snapshot',async()=>{
 let row={id:'works',draft:{items:[{...work,title:'Draft'}]},published:{items:[work]},revision:1,published_at:null};let selection='';
 const client={from:()=>{let filter={},patch;const q={select:value=>{selection=value;return q;},eq:(key,value)=>{filter[key]=value;return q;},update:value=>{patch=value;return q;},insert:value=>{patch=value;return q;},maybeSingle:async()=>{if(patch){if(filter.revision!==undefined&&filter.revision!==row.revision)return {data:null,error:null};row={...row,...patch};}return {data:selection==='published'?{published:structuredClone(row.published)}:structuredClone(row),error:null};}};return q;}};
 const cms=loader({'@/lib/supabase/admin':{createAdminClient:()=>client},'next/cache':{unstable_noStore(){}}})('lib/db/cms.ts');
 const first=await cms.readCMS('works',async()=>({items:[]}));const other=structuredClone(first);
 await cms.writeCMS('works',first,{items:[{...work,title:'Changed draft'}]});
 assert.equal((await cms.readPublishedCMS('works',async()=>({items:[]}))).items[0].title,work.title);
 assert.equal(selection,'published');
 await assert.rejects(cms.writeCMS('works',other,{items:[]}),cms.CMSConflict);
 const current=await cms.readCMS('works',async()=>({items:[]}));await cms.writeCMS('works',current,current.draft,current.draft);
 assert.equal((await cms.readPublishedCMS('works',async()=>({items:[]}))).items[0].title,'Changed draft');
});
test('reordering changes only the draft until explicit publication, preserving live text and visibility',async()=>{
 let doc={draft:{items:[{...work,title:'Private edit',published:false},{...work,id:'second'}]},published:{items:[work,{...work,id:'second',title:'Public second'}]},revision:4,published_at:null};
 class Conflict extends Error{}
 const db=loader({'./cms':{readCMS:async()=>structuredClone(doc),readPublishedCMS:async()=>structuredClone(doc.published),CMSConflict:Conflict,writeCMS:async(_id,current,draft,published=doc.published)=>{assert.equal(current.revision,doc.revision);doc={...doc,draft,published,revision:doc.revision+1};return structuredClone(doc);}},'./public-projects':{},'./gallery':{},'@/lib/supabase/public':{},'@/lib/supabase/admin':{},'@/lib/project-presentation':{}})('lib/db/works.ts');
 await db.changeWorks({action:'order',revision:4,ids:['second','video']});
 assert.deepEqual(doc.published.items.map(item=>item.id),['video','second']);
 assert.equal(doc.published.items[0].title,'Real video');assert.equal(doc.published.items[0].published,true);assert.equal(doc.draft.items[1].title,'Private edit');
 await assert.rejects(db.changeWorks({action:'save',revision:4,items:[]}),Conflict);
 await assert.rejects(db.changeWorks({action:'order',revision:5,ids:['video']}));
 await db.changeWorks({action:'publish',revision:5,items:doc.draft.items});
 assert.deepEqual(doc.published.items.map(item=>item.id),['second','video']);
 assert.equal(doc.published.items[1].title,'Private edit');
 assert.equal(doc.published.items[1].published,false);
});
test('authenticated media endpoint accepts Works uploads, rejects spoofed files and preserves storage errors',async()=>{
 let auth=false,stored=0,listFailure=false;
 const storage={upload:async()=>{stored++;return {error:null};},getPublicUrl:path=>({data:{publicUrl:`https://portfolio.supabase.co/storage/v1/object/public/portfolio-public/${path}`}}),list:async()=>listFailure?{error:new Error('Storage unavailable')}:{data:[],error:null}};
 const load=loader({'@/lib/auth/session':{verifyAdminSession:async()=>auth},'@/lib/supabase/admin':{createAdminClient:()=>({storage:{from:()=>storage}})},'next/cache':{unstable_noStore(){}}});
 const route=load('app/api/admin/media/route.ts');
 function upload(type='image/png',bytes=Buffer.from([137,80,78,71,13,10,26,10]),origin='https://portfolio.test',folder='works'){const form=new FormData();form.append('file',new Blob([bytes],{type}),'cover.png');form.append('folder',folder);return new NextRequest('https://portfolio.test/api/admin/media',{method:'POST',headers:{origin},body:form});}
 assert.equal((await route.POST(upload())).status,401);auth=true;
 assert.equal((await route.POST(upload('image/png',Buffer.from('spoof')))).status,400);
 assert.equal((await route.POST(upload('image/png',undefined,'https://evil.test'))).status,403);
 assert.equal((await route.POST(upload('image/png',undefined,'https://portfolio.test','invalid'))).status,400);
 assert.equal((await route.POST(upload())).status,200);assert.equal(stored,1);
 listFailure=true;assert.equal((await route.GET(new NextRequest('https://portfolio.test/api/admin/media?folder=all'))).status,503);
});
test('Works API rejects unauthenticated/cross-origin requests and malformed revisions',async()=>{
 let auth=false;
 const route=loader({'@/lib/auth/session':{verifyAdminSession:async()=>auth},'@/lib/db/works':{getWorks:async()=>({items:[work],revision:1,published:[work]}),changeWorks:async()=>({draft:{items:[work]},published:{items:[work]},revision:2})},'next/cache':{unstable_noStore(){}}})('app/api/admin/works/route.ts');
 assert.equal((await route.GET()).status,401);auth=true;
 assert.equal((await route.PUT(request({revision:1,items:[work]},'https://evil.test'))).status,403);
 assert.equal((await route.PUT(request({revision:'one',items:[]}))).status,400);
 assert.equal((await route.PUT(request({revision:1,items:[work],action:'save'}))).status,200);
});
test('public Works errors do not silently produce an empty collection',async()=>{
 const route=loader({'@/lib/db/works':{getPublicWorks:async()=>({items:[work]})}})('app/api/works/route.ts');const r=await route.GET();assert.equal(r.headers.get('cache-control'),'no-store');assert.equal((await r.json()).items.length,1);
 const broken=loader({'@/lib/db/works':{getPublicWorks:async()=>{throw Error('offline');}}})('app/api/works/route.ts');assert.equal((await broken.GET()).status,503);
});
test('site content is escaped and the original public sections survive rendering',async()=>{
 const site=loader({'./cms':{}})('lib/db/site.ts');const initial=await site.initialSite();initial.values.headline='<script>alert(1)</script>\nKeep the visual';initial.values.seoTitle='A < B';
 const rendered=await site.renderHomepage(initial);assert.ok(rendered.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));assert.ok(rendered.includes('id="work"'));assert.ok(rendered.includes('id="about"'));assert.ok(rendered.includes('<title>A &lt; B</title>'));
 const $=require('cheerio').load(rendered);assert.equal($('.hero-signoff, .hero .work-strip').length,0);assert.equal($('.hero').next().attr('id'),'work');
});
test('private media is exposed only by a visible published reference',async()=>{
 const url='/api/media/works/1-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png';let docs=[{id:'works',published:{items:[{published:false,image:url}]}}];
 const helper=loader({'./supabase/admin':{createAdminClient:()=>({from:()=>({select:async()=>({data:docs,error:null})})})}})('lib/cms-media.ts');
 assert.equal(await helper.publishedMedia(url),false);docs[0].published.items[0].published=true;assert.equal(await helper.publishedMedia(url),true);
 docs=[{id:'site',published:{values:{heroImage:url+'?version=1'}}}];assert.equal(await helper.publishedMedia(url),true);assert.equal(await helper.publishedMedia(url+'x'),false);
});
test('renaming a published case preserves its former slug as an alias',async()=>{
 const item={...work,id:'case',kind:'webapp',url:'/work/original',caseStudy:{slug:'original',problem:'Problem',solution:'Solution',impact:'Outcome',appUrl:'',blocks:[]}};
 let doc={draft:{items:[item]},published:{items:[item]},revision:1};
 const db=loader({'./cms':{readCMS:async()=>structuredClone(doc),CMSConflict:Error,writeCMS:async(_id,current,draft,published)=>{doc={draft,published,revision:current.revision+1};return doc;}},'./public-projects':{},'./gallery':{},'@/lib/supabase/public':{},'@/lib/supabase/admin':{},'@/lib/project-presentation':{}})('lib/db/works.ts');
 await db.changeWorks({action:'publish',revision:1,items:[{...item,caseStudy:{...item.caseStudy,slug:'renamed'}}]});assert.deepEqual(doc.published.items[0].aliases,['original']);assert.equal(doc.published.items[0].url,'/work/renamed');
});
test('built-in CV PDF paginates long content and escapes PDF operators',()=>{
 const {cvPDF}=loader()('lib/cv-pdf.ts');const data=cvPDF(Array.from({length:120},()=>'(Experience) \\ text')).toString();assert.ok(data.includes('/Count 3'));assert.ok(data.includes('\\(Experience\\)'));assert.ok(data.startsWith('%PDF-1.4'));
});
