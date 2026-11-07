const test=require('node:test'),assert=require('node:assert/strict');
const {runtime}=require('./cms-script-runtime.cjs'),load=runtime();
const {officeTools,officeToolIds}=load('lib/office-tools-content.ts'),{addPracticalTools}=load('lib/practical-tools-content.ts');
const {WorksSchema}=load('lib/works.ts'),{homepageWorks}=load('lib/homepage-works.ts');
test('three office studies have short routes, editable images and no enabled motion',()=>{
  const items=WorksSchema.parse({items:officeTools()}).items;assert.equal(items.length,3);
  assert.deepEqual(items.map(item=>item.caseStudy.slug),['parking','ulartangga','spin']);
  for(const item of items){assert.equal(item.caseStudy.motion.enabled,false);assert.equal(item.caseStudy.layout,undefined);assert.equal(item.homepageFeatured,undefined);assert.equal(item.demo,false);assert.ok(item.caseStudy.blocks.some(block=>block.block_type==='image'));assert.match(JSON.stringify(item),/data ilustrasi/);assert.ok(!/[\u2013\u2014]/.test(JSON.stringify(item)));}
  assert.match(items[0].caseStudy.solution,/PDF/);assert.match(items[0].caseStudy.solution,/nominal reimburse/);assert.match(items[2].caseStudy.appUrl,/AKfycbz8mW41/);
});
test('insertion retains unrelated snapshots, order and legacy or manual homepage selection',()=>{
  const app={...officeTools()[0],id:'existing',caseStudy:{...officeTools()[0].caseStudy,slug:'existing'}};
  for(const manual of [false,true]){
    const items=[0,1,2,3].map(i=>({...app,id:`existing-${i}`,homepageFeatured:manual?i<3:undefined,caseStudy:{...app.caseStudy,slug:`existing-${i}`}}));
    items.push({...app,id:'design',kind:'design',caseStudy:undefined});const original=structuredClone(items),next=addPracticalTools(items,officeTools());
    assert.deepEqual(items,original);assert.deepEqual(next.filter(item=>!officeToolIds.includes(item.id)),items);assert.deepEqual(homepageWorks(next).map(item=>item.id),homepageWorks(items).map(item=>item.id));assert.throws(()=>addPracticalTools(next,officeTools()),/sudah ada/);
  }
});
