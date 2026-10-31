const test=require('node:test'),assert=require('node:assert/strict'),{load}=require('cheerio');
const {runtime}=require('./cms-script-runtime.cjs'),run=runtime();
test('local recovery rejects invalid, expired and oversized snapshots and validates payloads before restoring',()=>{
 const {readLocalVersion}=run('lib/local-recovery.ts'),now=Date.now(),validate=value=>{if(!Array.isArray(value))throw Error();return value;};
 const payload={savedAt:now,revision:4,value:[{title:'Unsaved'}]};
 assert.deepEqual(readLocalVersion(JSON.stringify(payload),validate,now).value,payload.value);
 assert.equal(readLocalVersion('{broken',validate,now),null);assert.equal(readLocalVersion(JSON.stringify({...payload,value:'bad'}),validate,now),null);
 assert.equal(readLocalVersion(JSON.stringify({...payload,savedAt:now-8*86400000}),validate,now),null);assert.equal(readLocalVersion('x'.repeat(2500001),validate,now),null);
});
test('case actions distinguish the two Listing Hub apps, respect manual changes, and validate destinations',()=>{
 const {caseAppLinks}=run('lib/case-app-links.ts'),{CaseStudySchema}=run('lib/content-blocks.ts');
 const study={slug:'listinghub',appUrl:'https://listinghub-patos.vercel.app/all'};
 assert.deepEqual(caseAppLinks(study).map(link=>link.label),['Open All Database','Open Personal Listing']);
 assert.deepEqual(caseAppLinks({...study,appLinks:[]}),[]);assert.equal(caseAppLinks({...study,appUrl:'https://new.example'})[0].url,'https://new.example');
 assert.equal(CaseStudySchema.safeParse({...study,appLinks:[{label:'Unsafe',url:'javascript:alert(1)'}]}).success,false);
 const {editorialCaseLayout}=run('lib/case-layout.ts'),summary={...study,problem:'P',solution:'S',impact:'I'};
 const layout={html:'<main><header class="case-intro"><h1>Title</h1><a href="https://listinghub-patos.vercel.app/all">Open app</a></header><div class="case-narrative"><p>Story</p></div></main>',css:''};
 const rendered=editorialCaseLayout(layout,summary),$=load(rendered.html);assert.equal($('.case-app-actions a').length,2);assert.equal($('.case-intro>a').length,0);assert.equal($('.case-app-actions a').last().attr('href'),'https://listinghub-patos.vercel.app/gading');
 assert.equal(editorialCaseLayout(rendered,summary).html,rendered.html);
});
test('Listing Hub evidence appears beside narrative once and removal remains respected after saving',()=>{
 const {withWorkEvidence}=run('lib/work-evidence.ts');
 const item={id:'listing',caseStudy:{slug:'listinghub',blocks:[],layout:{html:'<main><div class="case-narrative"><h2>All Database</h2><p>Search workflow.</p><h2>Personal Listing</h2><p>Personal workflow.</p></div></main>',css:'.keep{color:red}'}}};
 const enriched=withWorkEvidence(item),$=load(enriched.caseStudy.layout.html);
 assert.equal($('.case-evidence-pair img').length,2);assert.equal($('.case-narrative>p').first().next().hasClass('case-evidence-pair'),true);assert.equal(enriched.caseStudy.layout.css,item.caseStudy.layout.css);
 assert.deepEqual(withWorkEvidence(enriched),enriched);assert.equal(item.evidenceEdition,undefined);
 const removed={...enriched,caseStudy:{...enriched.caseStudy,layout:{...enriched.caseStudy.layout,html:'<main><p>Edited story</p></main>'}}};assert.deepEqual(withWorkEvidence(removed),removed);
});
