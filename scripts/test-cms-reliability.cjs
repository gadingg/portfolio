const test=require('node:test'),assert=require('node:assert/strict');
const {runtime}=require('./cms-script-runtime.cjs');
const {NextRequest}=require('next/server');
const schema=runtime()('lib/works.ts');
const study={slug:'workflow',problem:'Original problem',solution:'Original solution',impact:'Original result',appUrl:'https://example.com/',blocks:[{id:'block',block_type:'paragraph',block_order:0,content_json:{text:'Keep this story'}}],layout:{html:'<h1>Keep this visual layout</h1>',css:'h1{color:#fff}'}};
const work={id:'workflow',kind:'webapp',title:'Workflow',description:'',image:'',imageAlt:'',url:'/work/workflow',published:true,demo:false,artwork:'hub',caseStudy:study};
test('uncheck, save, reload and recheck preserves the entire case study and visual layout',()=>{
 const disabled=schema.setCaseStudyEnabled(work,false);
 assert.equal(disabled.caseStudy,undefined);assert.deepEqual(disabled.archivedCaseStudy,study);assert.equal(disabled.url,study.appUrl);
 const reloaded=schema.WorksSchema.parse(JSON.parse(JSON.stringify({items:[disabled]}))).items[0];
 const enabled=schema.setCaseStudyEnabled(reloaded,true);
 assert.deepEqual(enabled.caseStudy,study);assert.equal(enabled.url,'/work/workflow');assert.equal(enabled.archivedCaseStudy,undefined);
 assert.deepEqual(work.caseStudy,study);
 assert.equal(schema.setCaseStudyEnabled({...work,caseStudy:{...study,appUrl:''}},false).url,'');
});
test('category changes preserve the study, and public projections never disclose archived content',()=>{
 for(const kind of ['design','video']){
  const moved=schema.setWorkKind(work,kind);assert.equal(moved.caseStudy,undefined);assert.deepEqual(moved.archivedCaseStudy,study);
  const restored=schema.setCaseStudyEnabled(schema.setWorkKind(moved,'webapp'),true);assert.deepEqual(restored.caseStudy,study);
  assert.equal(schema.publicWork(moved).archivedCaseStudy,undefined);
 }
 const media=runtime()('lib/cms-media.ts');assert.equal(media.referencesMedia({archivedCaseStudy:{image:'/api/media/private.png'}},'/api/media/private.png'),false);
 assert.equal(media.referencesMedia({caseStudy:{image:'/api/media/private.png'}},'/api/media/private.png'),true);
});
test('draft saving a disabled study does not alter the public snapshot; publishing retains private restoration data',async()=>{
 let doc={revision:3,draft:{items:[work]},published:{items:[work]}};
 const db=runtime({'./cms':{readCMS:async()=>structuredClone(doc),readPublishedCMS:async()=>structuredClone(doc.published),CMSConflict:class extends Error{},writeCMS:async(_id,current,draft,published)=>{doc={revision:current.revision+1,draft,published};return doc;}},'./public-projects':{},'./gallery':{},'@/lib/supabase/public':{},'@/lib/supabase/admin':{},'@/lib/project-presentation':{}})('lib/db/works.ts');
 await db.changeWorks({revision:3,action:'save',items:[schema.setCaseStudyEnabled(work,false)]});
 assert.deepEqual(doc.published.items[0].caseStudy,study);
 await db.changeWorks({revision:4,action:'publish',items:doc.draft.items});
 const publicItems=(await db.getPublicWorks()).items;assert.equal(publicItems[0].caseStudy,undefined);assert.equal(publicItems[0].archivedCaseStudy,undefined);
 assert.deepEqual(doc.published.items[0].archivedCaseStudy,study);
 const restored=schema.setCaseStudyEnabled(JSON.parse(JSON.stringify(doc.draft.items[0])),true);
 await db.changeWorks({revision:5,action:'publish',items:[restored]});assert.deepEqual((await db.getPublicWorks()).items[0].caseStudy,study);
});
test('engagement rejects foreign origins, invalid IDs, demo events, wrong categories and oversized payloads',async()=>{
 let saved=[],rpcError=null;
 const route=runtime({'@/lib/db/works':{getPublicWorks:async()=>({items:[work,{...work,id:'demo',demo:true}]})},'@/lib/supabase/admin':{createAdminClient:()=>({rpc:async(name,input)=>{saved.push(input);return {data:true,error:rpcError};}})}})('app/api/engagement/route.ts');
 const payload={eventId:'f7e4f4d6-4b3a-4e1f-82ca-0808255b8001',type:'work_open',workId:work.id};
 const req=(data,origin='https://portfolio.test')=>new NextRequest('https://portfolio.test/api/engagement',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(data)});
 assert.equal((await route.POST(req(payload,'https://evil.test'))).status,403);
 for(const data of [{...payload,workId:'missing'},{...payload,workId:'demo'},{...payload,type:'video_open'},{...payload,eventId:'no'},{...payload,ip:'1.2.3.4'}])assert.equal((await route.POST(req(data))).status,400);
 assert.equal((await route.POST(req({...payload,workId:'x'.repeat(1200)}))).status,413);
 assert.equal(saved.length,0);assert.equal((await route.POST(req(payload))).status,204);assert.deepEqual(Object.keys(saved[0]).sort(),['event_key','event_kind','work_key']);
 assert.equal((await route.POST(req({eventId:payload.eventId,type:'contact_click'}))).status,204);
 rpcError={message:'Offline'};assert.equal((await route.POST(req(payload))).status,503);
});
test('analytics failure remains unavailable, while real zero is a valid empty period',async()=>{
 const unavailable=runtime({'@/lib/supabase/admin':{createAdminClient:()=>({rpc:async()=>({data:null,error:{message:'Missing table'}})})}})('lib/db/engagement.ts');
 assert.deepEqual(await unavailable.getEngagementSummary(30),{available:false,data:null});
 const empty={total:0,daily:[{date:'2026-10-17',clicks:0}],types:{},popular:[],firstEventAt:null};
 const available=runtime({'@/lib/supabase/admin':{createAdminClient:()=>({rpc:async()=>({data:empty,error:null})})}})('lib/db/engagement.ts');
 assert.deepEqual((await available.getEngagementSummary(7)).data,empty);
});
test('form edits replace nested visual copy exactly once and preserve action icons',async()=>{
 const site=runtime({'./cms':{}})('lib/db/site.ts');const initial=await site.initialSite();initial.layout={html:'<div class="hero-bottom"><p><span>Old copy</span></p><a class="button"><span>Old label</span><svg class="icon"></svg></a></div>',css:''};initial.values.intro='New copy';initial.values.heroPrimary='View works';
 const $=require('cheerio').load(await site.renderHomepage(initial));assert.equal($('.hero-bottom > p').text(),'New copy');assert.equal($('.hero-bottom .button').text(),'View works');assert.equal($('.hero-bottom .button svg').length,1);
});

test('older clients omitting a study cannot erase its recovery copy on the server',async()=>{
 let doc={revision:1,draft:{items:[work]},published:{items:[work]}};
 const db=runtime({'./cms':{readCMS:async()=>structuredClone(doc),CMSConflict:Error,writeCMS:async(_id,current,draft,published)=>{doc={revision:current.revision+1,draft,published};return doc;}},'./public-projects':{},'./gallery':{},'@/lib/supabase/public':{},'@/lib/supabase/admin':{},'@/lib/project-presentation':{}})('lib/db/works.ts');
 const {caseStudy,...without}=work;await db.changeWorks({action:'save',revision:1,items:[{...without,url:study.appUrl}]});assert.deepEqual(doc.draft.items[0].archivedCaseStudy,study);
 await db.changeWorks({action:'save',revision:2,items:[{...without,url:study.appUrl}]});assert.deepEqual(doc.draft.items[0].archivedCaseStudy,study);
});

test('the click collector excludes previews, localhost, privacy preferences, examples and rapid double clicks',async()=>{
 const vm=require('node:vm'),source=require('node:fs').readFileSync('public/assets/js/engagement.js','utf8');
 async function setup(overrides={}){
  let handler;const calls=[];class Element{constructor(dataset={},href=''){this.dataset=dataset;this.href=href;this.tagName='A';}closest(){return this;}getAttribute(){return this.href;}}
  const window={};window.self=window.top=window;
  const context={window,location:{hostname:'portfolio.test',pathname:'/',origin:'https://portfolio.test'},document:{body:{dataset:{}},addEventListener:(_type,fn)=>handler=fn},navigator:{},Element,URL,Map,Date,crypto:require('node:crypto'),fetch:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({items:[]})};},...overrides};
  vm.runInNewContext(source,context);return {calls,click:(dataset,href)=>handler?.({isTrusted:true,target:new Element(dataset,href)})};
 }
 for(const overrides of [{location:{hostname:'localhost',pathname:'/'}},{location:{hostname:'portfolio.test',pathname:'/admintgadink/dashboard'}},{navigator:{doNotTrack:'1'}},{navigator:{globalPrivacyControl:true}},{document:{body:{dataset:{cmsPreview:'true'}}}}])assert.equal((await setup(overrides)).calls.length,0);
 const app=await setup();app.click({engagement:'work_open',workId:work.id,demo:'true'});assert.equal(app.calls.filter(x=>x.options).length,0);
 app.click({engagement:'work_open',workId:work.id});app.click({engagement:'work_open',workId:work.id});assert.equal(app.calls.filter(x=>x.options).length,1);
 app.click({},'https://wa.me/62812345678');assert.equal(JSON.parse(app.calls.at(-1).options.body).type,'contact_click');
 assert.deepEqual(Object.keys(JSON.parse(app.calls[1].options.body)).sort(),['eventId','type','workId']);
});

test('logout reports authentication failures and rejects cross-origin requests',async()=>{
 let failure=false;
 const route=runtime({'@/lib/auth/session':{destroyAdminSession:async()=>{if(failure)throw Error('Offline');}}})('app/api/admin/logout/route.ts');
 const req=origin=>new NextRequest('https://portfolio.test/api/admin/logout',{method:'POST',headers:{origin}});
 assert.equal((await route.POST(req('https://evil.test'))).status,403);
 assert.equal((await route.POST(req('https://portfolio.test'))).status,200);
 failure=true;assert.equal((await route.POST(req('https://portfolio.test'))).status,503);
});
