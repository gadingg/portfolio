const test=require('node:test'),assert=require('node:assert/strict');
const {runtime}=require('./cms-script-runtime.cjs');
const load=runtime(),works=load('lib/works.ts');
const base={id:'poster',kind:'design',title:'Poster set',description:'',image:'/assets/work/sample-design-1.svg',imageAlt:'Cover',url:'',published:true,demo:false,artwork:'sample'};
test('lightbox expands individual artwork in order and preserves cover fallback',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),source=fs.readFileSync('public/assets/js/works.js','utf8');
 const code=source.slice(source.indexOf('  function designArtwork('),source.indexOf('  const imageRatios'));
 const expand=vm.runInNewContext(code+';designArtwork');
 const result=expand([{...base,designImages:[{url:'/one.svg',alt:'First'},{url:'/two.svg',alt:''}]},{...base,id:'fallback'}]);
 assert.equal(result.length,3);assert.equal(result[0].image,'/one.svg');assert.equal(result[0].imageAlt,'First');assert.equal(result[1].image,'/two.svg');assert.equal(result[2].image,base.image);
 assert.equal(result.findIndex(item=>item.id==='fallback'),2);
});
test('individual artwork survives draft and public projection with guarded media URLs',()=>{
 const item={...base,designImages:[{url:'/assets/work/sample-design-2.svg',alt:'Individual poster'}]};
 const parsed=works.WorksSchema.parse({items:[item]}).items[0];
 assert.deepEqual(works.publicWork(parsed).designImages,item.designImages);
 assert.equal(works.WorksDraftSchema.safeParse({items:[{...item,designImages:[{url:'javascript:alert(1)',alt:''}]}]}).success,false);
 assert.equal(works.WorksDraftSchema.safeParse({items:[{...item,designImages:[{url:'',alt:''}]}]}).success,false);
 assert.equal(works.WorksDraftSchema.safeParse({items:[{...item,designImages:Array(21).fill(item.designImages[0])}]}).success,false);
});
test('publication review names individual artwork changes and recursive media access retains them',()=>{
 const next={...base,designImages:[{url:'/api/media/gallery/123-file.webp',alt:'Poster'}]};
 const summary=load('lib/publish-summary.ts').summarizeWorks([next],[base]);
 assert.ok(summary.entries[0].changes.includes('Desain satuan'));
 assert.ok(summary.counts.some(value=>value.includes('perubahan gambar')));
 assert.equal(load('lib/cms-media.ts').referencesMedia(next,next.designImages[0].url),true);
});
test('draft CMS reads have a bounded signal while preserving storage failures',async()=>{
 let signal;
 const query={select(){return this;},eq(){return this;},abortSignal(value){signal=value;return this;},maybeSingle:async()=>({data:{draft:{},published:{},revision:1},error:null})};
 const db=runtime({'@/lib/supabase/admin':{createAdminClient:()=>({from:()=>query})},'next/cache':{}})('lib/db/cms.ts');
 assert.equal((await db.readCMS('works',async()=>({}))).revision,1);
 assert.ok(signal instanceof AbortSignal);assert.equal(signal.aborted,false);
});
test('known repetitive story introductions are removed after canonical copy mapping; owner copy remains',()=>{
 const copy=load('lib/public-copy.ts'),heading={id:'h',block_type:'heading',block_order:0,content_json:{text:'From waiting to requesting.'}},paragraph={id:'p',block_type:'paragraph',block_order:1,content_json:{text:'Dashboard untuk pengajuan listing dan penjadwalan video properti.'}};
 const item={...base,kind:'webapp',caseStudy:{slug:'reqvideo',problem:'Custom problem',solution:'Custom approach',impact:'Custom outcome',blocks:[heading,paragraph]}};
 const refined=copy.refineWorkCopy(item);assert.equal(refined.caseStudy.blocks.length,0);assert.equal(item.caseStudy.blocks.length,2);
 const custom=copy.refineWorkCopy({...item,caseStudy:{...item.caseStudy,blocks:[heading,{...paragraph,content_json:{text:'An owner-authored introduction.'}}]}});
 assert.equal(custom.caseStudy.blocks.length,2);assert.deepEqual(copy.refineWorkCopy(custom),custom);
});
