const test=require('node:test'),assert=require('node:assert/strict');
const {runtime}=require('./cms-script-runtime.cjs');const load=runtime();
const {applyRequestedWorks}=load('lib/work-content-update.ts'),{WorksSchema,WorkDraftItemSchema}=load('lib/works.ts');
const base=id=>({id,kind:'webapp',title:id,description:'Original',image:'',imageAlt:'',url:'https://patosser.my.id/'+id,published:true,demo:false,artwork:id==='mega-app'?'hub':'schedule'});
test('requested cases and seven video slots are valid, stable, and preserve unrelated edits',()=>{
 const items=[base('mega-app'),base('req-video'),{...base('other'),description:'Unpublished user edit'},...Array.from({length:3},(_,i)=>({...base(`sample-video-${i+1}`),kind:'video',demo:true}))];
 const result=applyRequestedWorks(items);assert.equal(WorksSchema.safeParse({items:result}).success,true);
 assert.deepEqual(applyRequestedWorks(result),result);assert.equal(result.find(x=>x.id==='other').description,'Unpublished user edit');
 assert.equal(result.filter(x=>x.kind==='video').length,7);assert.equal(result.find(x=>x.id==='sample-video-1').url,'https://www.instagram.com/reel/DeBkwyszNoi/');assert.equal(result.find(x=>x.id==='sample-video-1').demo,false);
 assert.equal(result.find(x=>x.id==='mega-app').caseStudy.slug,'daily-app-gading');assert.equal(result.find(x=>x.id==='req-video').caseStudy.slug,'req-video-bareng-patosser');
 const edited=result.map(x=>x.id==='mega-app'?{...x,caseStudy:{...x.caseStudy,problem:'User refinement'}}:x);assert.equal(applyRequestedWorks(edited)[0].caseStudy.problem,'User refinement');
});
test('optional autoplay media accepts supported files and rejects executable or unrelated sources',()=>{
 const item=base('video');for(const videoFile of ['/api/media/works/clip.mp4','/api/media/works/clip.webm',''])assert.equal(WorkDraftItemSchema.safeParse({...item,videoFile}).success,true);
 for(const videoFile of ['javascript:alert(1)','https://evil.test/clip.mp4','/assets/cover.jpg'])assert.equal(WorkDraftItemSchema.safeParse({...item,videoFile}).success,false);
 assert.equal(WorksSchema.safeParse({items:[{...item,kind:'video',image:'/assets/cover.webp',url:'',videoFile:'/api/media/works/clip.mp4'}]}).success,true);
});
