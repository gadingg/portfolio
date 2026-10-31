const test=require('node:test'),assert=require('node:assert/strict');
const {runtime}=require('./cms-script-runtime.cjs');
const {summarizeWorks,summarizeSite}=runtime()('lib/publish-summary.ts');
const work=(id,patch={})=>({id,kind:'webapp',title:id,description:'Original copy',image:'/cover.webp',imageAlt:'Cover',url:'https://example.com',published:true,demo:false,artwork:'sample',...patch});

test('publication review includes changes across categories, hidden additions, removals, images and order',()=>{
 const original=[work('one'),work('two',{kind:'design'}),work('remove')];
 const draft=[work('two',{kind:'design',description:'Edited design'}),work('one',{title:'New title',image:'/new.webp'}),work('hidden',{published:false})];
 const summary=summarizeWorks(draft,original);
 assert.deepEqual(summary.counts,['1 portfolio ditambah','2 portfolio diperbarui','1 portfolio dihapus','2 perubahan gambar','Urutan portfolio berubah']);
 assert.match(summary.scope,/seluruh perubahan koleksi/);assert.equal(summary.entries.find(entry=>entry.id==='work:hidden').status,'Disembunyikan');
 assert.deepEqual(summary.entries.find(entry=>entry.id==='work:one').changes,['Judul','Cover']);
 assert.deepEqual(summary.entries.find(entry=>entry.id==='work:remove').changes,['Dihapus dari koleksi']);assert.ok(summary.entries.some(entry=>entry.id==='collection-order'));
 assert.equal(original[0].title,'one');
});

test('order-only changes do not count as content edits; timestamps, object key order and insertions do not fabricate changes',()=>{
 const original=[work('one'),work('two')];
 const summary=summarizeWorks([{...original[1],updatedAt:'2026-10-30T00:00:00.000Z'},original[0]],original);
 assert.deepEqual(summary.counts,['Urutan portfolio berubah']);assert.equal(summary.entries.length,1);
 assert.deepEqual(summary.entries[0].order.map(item=>({id:item.id,from:item.from,to:item.to})),[{id:'two',from:2,to:1},{id:'one',from:1,to:2}]);
 assert.equal(summary.entries[0].order[0].image,original[1].image);assert.deepEqual(summary.entries[0].changes,[]);
 const inserted=summarizeWorks([work('new'),...original],original);assert.ok(!inserted.counts.includes('Urutan portfolio berubah'));
 const reorderedKeys=Object.fromEntries(Object.entries(original[0]).reverse());assert.equal(summarizeWorks([reorderedKeys],[original[0]]).entries.length,0);
});

test('review counts an image used in cover and custom layout once, retains gallery reorder semantics, and never copies private AI notes',()=>{
 const study={slug:'one',appUrl:'',problem:'P',solution:'A',impact:'O',blocks:[],layout:{html:'<main><img src="/cover.webp"><p>Story</p></main>',css:''}};
 const original=work('one',{caseStudy:study});
 const changed={...original,image:'/replacement.webp',caseStudy:{...study,layout:{...study.layout,html:study.layout.html.replace('/cover.webp','/replacement.webp')}}};
 assert.ok(summarizeWorks([changed],[original]).counts.includes('1 perubahan gambar'));
 const gallery={id:'gallery',block_type:'gallery',block_order:0,content_json:{images:[{url:'/a.webp',caption:'A'},{url:'/b.webp',caption:'B'}]}};
 const before={...original,caseStudy:{...study,blocks:[gallery]}},after=structuredClone(before);after.caseStudy.blocks[0].content_json.images.reverse();
 assert.ok(!summarizeWorks([after],[before]).counts.some(count=>count.includes('perubahan gambar')));
 const privateNotes={...original,aiDraft:{brief:'PRIVATE SOURCE',confirmations:['PRIVATE NOTE'],screenshots:[],generatedAt:'2026-10-30T00:00:00.000Z'}};
 const summary=summarizeWorks([privateNotes],[original]);assert.doesNotMatch(JSON.stringify(summary),/PRIVATE SOURCE|PRIVATE NOTE/);assert.match(summary.entries[0].changes[0],/tidak tampil di publik/);
});

test('website review names changed sections, CV fields and visual layout without implying portfolio publication',async()=>{
 const original=await runtime({'./cms':{}})('lib/db/site.ts').initialSite(),draft=structuredClone(original);
 draft.values.headline='New headline';draft.values.aboutBody2='New bio';draft.cv.pdf='/assets/cv/replaced.pdf';draft.layout={html:'<main>New layout</main>',css:''};
 const summary=summarizeSite(draft,original);
 assert.deepEqual(summary.entries.map(entry=>entry.title),['Hero','About','CV','Layout homepage']);assert.deepEqual(summary.entries.find(entry=>entry.title==='CV').changes,['File PDF CV']);
 assert.match(summary.scope,/Website & CV/);assert.equal(summarizeSite(original,original).entries.length,0);
});
