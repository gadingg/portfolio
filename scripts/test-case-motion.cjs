const test=require('node:test'),assert=require('node:assert/strict'),{load}=require('cheerio');
const {runtime}=require('./cms-script-runtime.cjs'),run=runtime();
test('case walkthrough defaults cover six existing cases and explicit settings win',()=>{
 const {caseMotion,withCaseMotion}=run('lib/case-motion.ts');
 for(const slug of ['listinghub','metaads','mbg','dailyapp','mydaily','reqvideo']){
  const motion=caseMotion({slug});assert.equal(motion.enabled,true);assert.equal(motion.video,`/assets/motion/${slug}${['metaads','dailyapp'].includes(slug)?'-clean':''}.mp4`);assert.equal(motion.mobileVideo,`/assets/motion/${slug}-mobile${['metaads','dailyapp'].includes(slug)?'-clean':''}.mp4`);
 }
 assert.equal(caseMotion({slug:'unknown'}),null);
 const item={id:'kept',caseStudy:{slug:'listinghub'}};const enriched=withCaseMotion(item);assert.equal(item.caseStudy.motion,undefined);assert.equal(caseMotion({...enriched.caseStudy,slug:'renamed'}).video,'/assets/motion/listinghub.mp4');
 const motion={enabled:false,title:'Hidden',description:'',video:'/api/media/works/custom.mp4',mobileVideo:'',poster:'',mobilePoster:''};
 assert.equal(caseMotion({slug:'listinghub',motion}),null);assert.equal(caseMotion({slug:'listinghub',motion:{...motion,enabled:true}}).video,motion.video);
 assert.equal(caseMotion({slug:'listinghub',motion:{...motion,enabled:true,video:''}}),null);
});
test('walkthrough data survives draft parsing and private media references without accepting unsafe media',()=>{
 const {CaseStudySchema}=run('lib/content-blocks.ts'),{referencesMedia}=run('lib/cms-media.ts');
 const motion={enabled:true,title:'Workflow',description:'One short flow.',video:'/api/media/works/demo.mp4',mobileVideo:'/api/media/works/mobile.mp4',poster:'/api/media/covers/poster.webp',mobilePoster:''};
 const parsed=CaseStudySchema.parse({slug:'listinghub',motion});assert.deepEqual(parsed.motion,motion);
 for(const value of [motion.video,motion.mobileVideo,motion.poster])assert.equal(referencesMedia({caseStudy:parsed},value),true);
 assert.equal(referencesMedia({caseStudy:{...parsed,motion:{...motion,enabled:false}}},motion.video),false);
 for(const video of ['javascript:alert(1)','//evil.example/demo.mp4','https://evil.example/demo.mp4','/assets/not-a-video.png'])assert.equal(CaseStudySchema.safeParse({slug:'listinghub',motion:{...motion,video}}).success,false);
});
test('custom case walkthrough mounts immediately after overview and does not duplicate or resurrect disabled motion',()=>{
 const {editorialCaseLayout}=run('lib/case-layout.ts');
 const layout={html:'<main><header class="case-intro"><h1>Title</h1></header><figure class="case-cover-art"><img src="/cover.webp"></figure><div class="case-narrative"><h2>Story</h2><p>Keep this.</p></div></main>',css:''};
 const study={slug:'mydaily',problem:'Problem',solution:'Approach',impact:'Outcome'};
 const result=editorialCaseLayout(layout,study),$=load(result.html);assert.equal($('.case-intro').next().is('.case-cover-art'),true);assert.equal($('.case-cover-art').next().is('.case-overview'),true);assert.equal($('.case-overview').next().is('[data-cms-motion-slot]'),true);assert.equal($('[data-cms-motion-slot]').length,1);assert.equal($('.case-narrative p').text(),'Keep this.');
 assert.equal(editorialCaseLayout(result,study).html,result.html);
 const disabled=editorialCaseLayout(result,{...study,motion:{enabled:false,video:'',poster:'',mobileVideo:'',mobilePoster:'',title:'',description:''}});assert.equal(load(disabled.html)('[data-cms-motion-slot]').length,0);
});
test('an unfinished walkthrough can be drafted but needs its video and poster before publication',()=>{
 const {WorkDraftItemSchema,WorkItemSchema}=run('lib/works.ts');
 const item={id:'motion-test',title:'Workflow',kind:'webapp',published:true,demo:false,url:'/work/workflow',caseStudy:{slug:'workflow',motion:{enabled:true,video:'',poster:''}}};
 assert.equal(WorkDraftItemSchema.safeParse(item).success,true);assert.equal(WorkItemSchema.safeParse(item).success,false);
 const ready={...item,caseStudy:{...item.caseStudy,motion:{enabled:true,video:'/assets/motion/listinghub.mp4',poster:'/assets/motion/listinghub.webp'}}};
 assert.equal(WorkItemSchema.safeParse(ready).success,true);
 assert.equal(WorkItemSchema.safeParse({...item,caseStudy:{...item.caseStudy,motion:{enabled:false,video:'',poster:''}}}).success,true);
});

test('legacy custom cover wrappers normalize once and keep imagery before overview',()=>{const {editorialCaseLayout}=run('lib/case-layout.ts');const input={html:'<main><header class="case-intro"><h1>Original</h1></header><div class="project-art"><img src="/original.webp" alt="Original"></div><div class="case-narrative"><p>Owner story.</p></div></main>',css:'.owner{padding:10px}'};const summary={slug:'listinghub',problem:'Problem',solution:'Approach',impact:'Result',appLinks:[{label:'Open All Database',url:'https://example.com/all'},{label:'Open Personal Listing',url:'https://example.com/agent'}]};const result=editorialCaseLayout(input,summary),$=load(result.html);assert.equal($('.case-intro').next().is('.case-cover-art'),true);assert.equal($('.case-cover-art').next().is('.case-overview'),true);assert.equal($('.case-cover-art img').attr('src'),'/original.webp');assert.equal($('.case-app-actions .text-link').length,2);assert.equal($('.case-app-actions .button').length,0);assert.equal($('.case-narrative p').text(),'Owner story.');assert.equal(result.css,input.css);assert.equal(editorialCaseLayout(result,summary).html,result.html);});
