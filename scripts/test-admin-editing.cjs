const test=require('node:test'),assert=require('node:assert/strict'),{load}=require('cheerio');
const {runtime}=require('./cms-script-runtime.cjs');
const {syncCaseIdentity}=runtime()('lib/case-layout.ts');
const work={id:'one',title:'Original',description:'Original intro',image:'/cover.webp',imageAlt:'Original cover',caseStudy:{appUrl:'https://old.example',layout:{html:'<main><header class="case-intro"><h1>Original</h1><p>Original intro</p><a href="https://old.example">Open app</a></header><figure class="project-art"><img src="/cover.webp" srcset="/old.webp 2x" sizes="100vw" width="1200" height="800"></figure><section class="case-narrative"><h2>A <strong>real</strong> story</h2><img src="/screenshot.webp"><p>Unchanged detail</p></section></main>',css:'.original{color:orange}'}}};
test('form replacements synchronize custom case cover and identity without touching story screenshots or formatting',()=>{
 const input=structuredClone(work),next={...input,title:'New <title>',description:'New introduction',image:'/new.webp',imageAlt:'New cover',caseStudy:{...input.caseStudy,appUrl:'https://new.example'}};
 const result=syncCaseIdentity(input,next),$=load(result.caseStudy.layout.html);
 assert.equal($('.case-intro h1').text(),'New <title>');assert.equal($('.case-intro h1 title').length,0);assert.equal($('.case-intro p').text(),'New introduction');assert.equal($('.case-intro a').attr('href'),'https://new.example');
 assert.equal($('.project-art img').attr('src'),'/new.webp');assert.equal($('.project-art img').attr('alt'),'New cover');
 for(const attribute of ['srcset','sizes','width','height'])assert.equal($('.project-art img').attr(attribute),undefined);
 assert.equal($('.case-narrative img').attr('src'),'/screenshot.webp');assert.equal($('.case-narrative strong').text(),'real');assert.equal($('.case-narrative p').text(),'Unchanged detail');assert.equal(result.caseStudy.layout.css,work.caseStudy.layout.css);assert.deepEqual(input,work);
});
test('custom visual edits survive an unrelated save; app link can be removed and restored',()=>{
 const edited=structuredClone(work);edited.caseStudy.layout.html=edited.caseStudy.layout.html.replace('/cover.webp','/separate-detail.webp');assert.equal(syncCaseIdentity(work,edited),edited);
 const removed=syncCaseIdentity(work,{...work,caseStudy:{...work.caseStudy,appUrl:''}});assert.equal(load(removed.caseStudy.layout.html)('.case-intro a').length,0);
 const restored=syncCaseIdentity(removed,{...removed,caseStudy:{...removed.caseStudy,appUrl:'https://restored.example'}});const $=load(restored.caseStudy.layout.html);assert.equal($('.case-intro a').length,1);assert.equal($('.case-intro a').attr('href'),'https://restored.example');
});
