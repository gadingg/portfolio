const fs=require('node:fs'),path=require('node:path');
const {isDeepStrictEqual}=require('node:util');
const {env,runtime,root}=require('./cms-script-runtime.cjs');env();
(async()=>{
 const load=runtime(),{getWorksDocument}=load('lib/db/works.ts'),{writeCMS}=load('lib/db/cms.ts'),{applyRequestedWorks}=load('lib/work-content-update.ts'),{WorksDraftSchema,WorksSchema}=load('lib/works.ts');
 const current=await getWorksDocument();
 const draft=WorksDraftSchema.parse({items:applyRequestedWorks(current.draft.items)}),published=WorksSchema.parse({items:applyRequestedWorks(current.published.items)});
 if(!process.argv.includes('--apply')){console.log(JSON.stringify({mode:'preview',draftItems:draft.items.length,publishedItems:published.items.length,newCaseStudies:published.items.filter(item=>['mega-app','req-video'].includes(item.id)).map(item=>item.caseStudy?.slug),videos:published.items.filter(item=>item.kind==='video').length}));return;}
 if(isDeepStrictEqual(draft,current.draft)&&isDeepStrictEqual(published,current.published)){console.log('Already current; no write needed');return;}
 fs.mkdirSync(path.join(root,'.cms-backups'),{recursive:true});fs.writeFileSync(path.join(root,'.cms-backups',`before-requested-works-${Date.now()}.json`),JSON.stringify(current,null,2));
 const saved=await writeCMS('works',current,draft,published);console.log(`Updated requested Works content at revision ${saved.revision}; unrelated fields and draft/public separation preserved`);
})().catch(error=>{console.error(error.message);process.exitCode=1;});
