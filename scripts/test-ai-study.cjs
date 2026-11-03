const test=require('node:test'),assert=require('node:assert/strict');
const {NextRequest,NextResponse}=require('next/server');
const {load}=require('cheerio');
const {runtime}=require('./cms-script-runtime.cjs');
const study=()=>({title:'One place for the work',description:'Satu tempat untuk catatan harian.',slug:'daily',problem:'Catatan tersebar.',approach:'Menyatukan catatan dan tugas.',outcome:'',sections:[{heading:'Keep daily tasks together.',body:'Daftar tugas dan catatan berada dalam satu aplikasi.'}],confirmations:['Apa hasil yang sudah terlihat?'],screenshots:[{afterSection:0,description:'Halaman daftar tugas asli.',caption:'Daftar tugas harian.'}]});
const work=(id='original',patch={})=>({id,kind:'webapp',title:'Original title',description:'Original copy',image:'/cover.jpg',imageAlt:'Cover',url:'/work/'+id,published:true,demo:false,artwork:'sample',caseStudy:{slug:id,problem:'P',solution:'S',impact:'I',appUrl:'https://example.com',blocks:[{id:'h',block_type:'heading',block_order:0,content_json:{text:'Old heading',level:2}},{id:'image',block_type:'image',block_order:1,content_json:{url:'/screen.jpg',alt:'Real screen',caption:'Original caption'}},{id:'p',block_type:'paragraph',block_order:2,content_json:{text:'Old story'}}]},...patch});
const input=(patch={})=>({revision:4,brief:'Saya menggabungkan catatan dan daftar tugas dalam satu aplikasi.',result:study(),image:'/cover.jpg',imageAlt:'Cover',appUrl:'https://example.com',...patch});
const request=(path,body,origin='https://portfolio.test')=>new NextRequest('https://portfolio.test'+path,{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});

test('AI review schema bounds input, normalizes banned punctuation and keeps unsupported details private',()=>{
  const {AIGenerateSchema,normalizeAIStudy}=runtime()('lib/ai-study.ts');
  assert.equal(AIGenerateSchema.safeParse({brief:'short'}).success,false);
  assert.equal(AIGenerateSchema.safeParse({brief:'x'.repeat(30001)}).success,false);
  assert.equal(AIGenerateSchema.safeParse({brief:input().brief,target:'section:99'}).success,false);
  assert.equal(normalizeAIStudy({...study(),title:'Tasks — together'}).title,'Tasks, together');
  assert.throws(()=>normalizeAIStudy({...study(),slug:'way-too-long-'.repeat(5)}));
  assert.throws(()=>normalizeAIStudy({...study(),screenshots:[{afterSection:7,description:'Screen',caption:''}]}));
});

test('accepting one field or section preserves every other manually edited field',()=>{
  const {mergeAIRevision}=runtime()('lib/ai-study.ts');
  const current={...study(),title:'My manual title',sections:[...study().sections,{heading:'My manual heading',body:'My manual story'}]};
  const proposal={...study(),title:'Replacement',problem:'New problem',sections:[{heading:'New section',body:'New story'},{heading:'Overwrite',body:'Overwrite'}]};
  const one=mergeAIRevision(current,proposal,'problem');assert.equal(one.problem,'New problem');assert.equal(one.title,current.title);assert.deepEqual(one.sections,current.sections);
  const section=mergeAIRevision(current,proposal,'section:0');assert.equal(section.title,current.title);assert.equal(section.sections[1],current.sections[1]);assert.equal(section.sections[0].body,'New story');
  assert.equal(current.sections[0].body,study().sections[0].body);
});

test('new AI case is a hidden draft; revising preserves original URLs, screenshot assets, other projects and order',()=>{
  const {applyAIStudy}=runtime()('lib/ai-apply.ts'),{publicWork}=runtime()('lib/works.ts');
  const original=[work(),work('second')],before=structuredClone(original);
  const fresh=applyAIStudy(original,input());assert.equal(fresh.items.length,3);assert.equal(fresh.items[2].published,false);assert.equal(fresh.items[2].caseStudy.slug,'daily');
  assert.deepEqual(fresh.items.slice(0,2),original);
  const changed=applyAIStudy(original,input({id:'original'}));assert.equal(changed.items[0].caseStudy.slug,'original');assert.deepEqual(changed.items[1],original[1]);
  assert.deepEqual(changed.items[0].caseStudy.blocks.find(block=>block.id==='image'),original[0].caseStudy.blocks[1]);
  assert.equal(changed.items[0].aiDraft.brief,input().brief);assert.equal(changed.items[0].caseStudy.impact,'');assert.deepEqual(original,before);
  assert.equal(publicWork(changed.items[0]).aiDraft,undefined);
  assert.throws(()=>applyAIStudy(original,input({result:{...study(),slug:'second'}})),/Slug sudah dipakai/);
});

test('visual revisions retain CSS, screenshots and captions while updating the visible story safely',()=>{
  const {applyAIStudy}=runtime()('lib/ai-apply.ts');const current=work();
  current.caseStudy.layout={html:'<main><header class="case-intro"><h1>Old</h1><p>Old intro</p></header><figure class="case-cover-art"><img src="/cover.jpg"></figure><div class="case-narrative"><div class="study-case-blocks"><h2>Old heading</h2><figure><img src="/real.jpg"><figcaption>Real caption</figcaption></figure><p>Old text</p></div></div></main>',css:'.custom{color:red}'};
  const changed=applyAIStudy([current],input({id:current.id,result:{...study(),title:'<script>alert(1)</script>'}})).items[0];
  const $=load(changed.caseStudy.layout.html);assert.equal($('script').length,0);assert.equal($('h1').text(),'<script>alert(1)</script>');
  assert.equal($('.study-case-blocks p').text(),study().sections[0].body);assert.equal($('img[src="/real.jpg"]').length,1);assert.equal($('figcaption').text(),'Real caption');
  assert.equal(changed.caseStudy.layout.css,'.custom{color:red}');assert.equal($('.case-summary-step').length,2);assert.equal($('.case-intro a').attr('href'),'https://example.com');
  const unknown=work('unknown');unknown.caseStudy.layout={html:'<main><p>Custom private story</p></main>',css:''};assert.throws(()=>applyAIStudy([unknown],input({id:'unknown'})),/area cerita/);
});

test('private AI notes never grant public access to a media URL',()=>{
  const {referencesMedia}=runtime()('lib/cms-media.ts'),url='/api/media/works/123-00000000-0000-0000-0000-000000000000.jpg';
  assert.equal(referencesMedia({aiDraft:{brief:url}},url),false);assert.equal(referencesMedia({image:url},url),true);
});

test('API key encryption is authenticated, non-deterministic and public settings never include a credential',()=>{
  const previous=process.env.CMS_AI_ENCRYPTION_KEY;process.env.CMS_AI_ENCRYPTION_KEY='local-test-encryption-secret-only';
  try{
    const {encryptAIKey,decryptAIKey,publicAISettings}=runtime()('lib/ai-settings.ts'),key='test-provider-key-never-real';
    const first=encryptAIKey(key),second=encryptAIKey(key);assert.notEqual(first,second);assert.equal(decryptAIKey(first),key);assert.equal(first.includes(key),false);
    const tampered=Buffer.from(first,'base64');tampered[30]^=1;assert.throws(()=>decryptAIKey(tampered.toString('base64')),/Simpan ulang/);
    assert.deepEqual(publicAISettings({apiKey:key,model:'gemini-3.8-flash',updatedAt:'now'}),{configured:true,model:'gemini-3.8-flash',updatedAt:'now'});
  }finally{if(previous===undefined)delete process.env.CMS_AI_ENCRYPTION_KEY;else process.env.CMS_AI_ENCRYPTION_KEY=previous;}
});

test('settings save uses a private isolated bucket and stores only ciphertext',async()=>{
  const previous=process.env.CMS_AI_ENCRYPTION_KEY;process.env.CMS_AI_ENCRYPTION_KEY='local-test-encryption-secret-only';
  try{
    let stored,bucketPublic=false;const calls=[];
    const storage={getBucket:async id=>{calls.push(id);return {data:{public:bucketPublic},error:null};},from:id=>({upload:async(path,data,options)=>{stored=JSON.parse(data.toString());calls.push([id,path,options]);return {error:null};}})};
    const settings=runtime({'./supabase/admin':{createAdminClient:()=>({storage})}})('lib/ai-settings.ts');
    const status=await settings.saveAISettings({apiKey:'test-key',model:'gemini-3.8-flash'});assert.equal(status.configured,true);assert.equal(stored.secret.includes('test-key'),false);assert.equal(settings.decryptAIKey(stored.secret),'test-key');assert.equal(calls[0],'portfolio-ai-settings');
    bucketPublic=true;await assert.rejects(()=>settings.saveAISettings({apiKey:'x',model:'gemini-3.8-flash'}),/harus privat/);
  }finally{if(previous===undefined)delete process.env.CMS_AI_ENCRYPTION_KEY;else process.env.CMS_AI_ENCRYPTION_KEY=previous;}
});

test('Gemini requests use a fixed server endpoint, header-only key and structured output; provider failures never echo secrets',async()=>{
  const original=global.fetch,key='test-secret-key';
  try{
    let requestBody;global.fetch=async(url,options)=>{assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent');assert.equal(options.headers['x-goog-api-key'],key);requestBody=JSON.parse(options.body);assert.doesNotMatch(options.body,/test-secret-key/);return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(study())}]}}]});};
    const gemini=runtime({'./ai-settings':{getAISettings:async()=>({apiKey:key,model:'gemini-3.8-flash'})}})('lib/gemini-study.ts');
    const response=await gemini.generateAIStudy(input().brief,'all');assert.equal(response.result.title,study().title);assert.equal(requestBody.generationConfig.responseFormat.text.mimeType,'APPLICATION_JSON');assert.ok(requestBody.generationConfig.responseFormat.text.schema);assert.equal(requestBody.tools,undefined);
    assert.match(requestBody.systemInstruction.parts[0].text,/Do not invent/);
    for(const status of [400,403,404,429,500]){global.fetch=async()=>new Response('secret '+key,{status});await assert.rejects(()=>gemini.generateAIStudy(input().brief,'all'),error=>!error.message.includes(key)&&error.status===(status===500?503:status===403?400:status===404?400:status));}
    global.fetch=async()=>Response.json({candidates:[{finishReason:'MAX_TOKENS'}]});await assert.rejects(()=>gemini.generateAIStudy(input().brief,'all'),/draft lengkap/);
  }finally{global.fetch=original;}
});

test('AI endpoints require real admin authorization and same-origin writes',async()=>{
  const routes=['app/api/admin/ai/settings/route.ts','app/api/admin/ai/study-case/route.ts'];
  for(const route of routes){
    const handler=runtime({'@/lib/auth/session':{verifyAdminSession:async()=>false}})(route);
    assert.equal((await handler.POST(request('/api/admin/ai',{}))).status,401);
    const allowed=runtime({'@/lib/auth/session':{verifyAdminSession:async()=>true}})(route);
    assert.equal((await allowed.POST(request('/api/admin/ai',{},'https://evil.test'))).status,403);
  }
});

test('apply checks the CMS revision and saves one draft without publishing',async()=>{
  const doc={revision:4,draft:{items:[work(),work('second')]},published:{items:[work(),work('second')]}};let saved;
  const handler=runtime({'@/lib/cms-http':{cmsAccess:async()=>null},'@/lib/db/works':{getWorksDocument:async()=>doc,changeWorks:async body=>{saved=body;return {revision:5,draft:{items:body.items}};}}})('app/api/admin/ai/study-case/route.ts');
  const path='/api/admin/ai/study-case';
  assert.equal((await handler.POST(request(path,{...input({revision:3}),action:'apply'}))).status,409);assert.equal(saved,undefined);
  const response=await handler.POST(request(path,{...input({id:'original'}),action:'apply'}));assert.equal(response.status,200);assert.equal(saved.action,'save');assert.equal(saved.revision,4);assert.deepEqual(saved.items[1],doc.draft.items[1]);assert.deepEqual(doc.published.items,[work(),work('second')]);
  assert.equal((await response.json()).item.aiDraft.brief,input().brief);
});

test('settings API never reads a key back to browser and returns sanitized provider errors',async()=>{
  const settings={apiKey:'test-secret-key-never-returned',model:'gemini-3.8-flash',updatedAt:'now'};
  const handler=runtime({'@/lib/cms-http':{cmsAccess:async()=>null},'@/lib/ai-settings':{...runtime()('lib/ai-settings.ts'),getAISettings:async()=>settings,getAISettingsStatus:async()=>({configured:true,model:settings.model,updatedAt:settings.updatedAt})},'@/lib/gemini-study':{AIProviderError:class extends Error{},testGemini:async()=>{throw Error(settings.apiKey);}}})('app/api/admin/ai/settings/route.ts');
  const got=await handler.GET();assert.equal((await got.json()).apiKey,undefined);
  const accepted = await handler.POST(request('/api/admin/ai/settings', {action:'test', apiKey:'AQ.example_authorization_key-123', model:'gemini-flash-latest'}));
  assert.equal(accepted.status, 503); // The request reached the mocked provider, which throws.
  const tested=await handler.POST(request('/api/admin/ai/settings',{action:'test'}));assert.doesNotMatch(await tested.text(),/test-secret-key-never-returned/);
});
