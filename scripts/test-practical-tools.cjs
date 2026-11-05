const test=require('node:test'),assert=require('node:assert/strict');
const {runtime}=require('./cms-script-runtime.cjs'),load=runtime();
const {practicalTools,addPracticalTools,practicalToolIds}=load('lib/practical-tools-content.ts');
const {WorksSchema}=load('lib/works.ts'),{homepageWorks}=load('lib/homepage-works.ts');
test('three new cases validate and remain fully editable without custom-layout ownership',()=>{
 const items=WorksSchema.parse({items:practicalTools()}).items;
 assert.equal(items.length,3);assert.equal(new Set(items.map(item=>item.caseStudy.slug)).size,3);
 for(const item of items){assert.ok(item.caseStudy.slug.length<=12);assert.ok(item.caseStudy.blocks.some(block=>block.block_type==='image'));assert.equal(item.caseStudy.layout,undefined);assert.ok(item.caseStudy.motion.video);assert.equal(item.homepageFeatured,undefined);assert.ok(!/[\u2013\u2014]/.test(JSON.stringify(item)));}
 const ella=items.find(item=>item.id==='rekap-ella');assert.match(JSON.stringify(ella),/data ilustrasi/);assert.match(JSON.stringify(ella),/Telegram/);assert.match(JSON.stringify(ella),/PDF/);
});
test('insertion preserves all prior drafts, order and homepage choices and rejects duplicates',()=>{
 const app={...practicalTools()[0],id:'existing',caseStudy:{...practicalTools()[0].caseStudy,slug:'existing'},homepageFeatured:true};
 const draft=[app,{...app,id:'other',kind:'design',caseStudy:undefined}],snapshot=structuredClone(draft),next=addPracticalTools(draft);
 assert.deepEqual(draft,snapshot);assert.deepEqual(next.filter(item=>!practicalToolIds.includes(item.id)),draft);assert.deepEqual(next.map(item=>item.id),['existing',...practicalToolIds,'other']);
 assert.deepEqual(homepageWorks(next).map(item=>item.id),homepageWorks(draft).map(item=>item.id));assert.throws(()=>addPracticalTools(next),/sudah ada/);
 const legacy=[0,1,2,3].map(i=>({...app,id:`legacy-${i}`,homepageFeatured:undefined,caseStudy:{...app.caseStudy,slug:`legacy-${i}`}}));
 assert.deepEqual(homepageWorks(addPracticalTools(legacy)).map(item=>item.id),homepageWorks(legacy).map(item=>item.id));
 assert.throws(()=>addPracticalTools([{...app,id:'different',caseStudy:{...app.caseStudy,slug:'prompt'}}]),/sudah ada/);
});
