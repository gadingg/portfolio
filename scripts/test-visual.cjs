const test=require('node:test'),assert=require('node:assert/strict');
const {runtime}=require('./cms-script-runtime.cjs');
const {NextRequest}=require('next/server');
const clean=runtime()('lib/visual-layout.ts').cleanVisualLayout;
test('visual layouts preserve content and dynamic collection hooks while removing executable markup',()=>{
 const layout=clean({html:'<section data-work-kind="webapp" data-carousel="true"><div data-works-list></div><h1 onclick="alert(1)">Real title</h1><script>alert(2)</script><img src="javascript:alert(3)" onerror="alert(4)"><a href="//evil.test">Link</a><iframe src="https://evil.test"></iframe></section>',css:'@import "https://evil.test";#hero{color:#fff;behavior:url(/bad)}@media(max-width:600px){#hero{width:100%}}'});
 assert.match(layout.html,/data-work-kind="webapp"/);assert.match(layout.html,/data-works-list/);assert.match(layout.html,/Real title/);assert.doesNotMatch(layout.html,/onclick|onerror|javascript|iframe|<script|evil/);assert.doesNotMatch(layout.css,/@import|behavior/);assert.match(layout.css,/@media/);
 for(const css of ['x{background:url(javascript:alert(1))}','x{content:"</style><script>"}','x{background:url(data:text/html,abc)}'])assert.throws(()=>clean({html:'<p>Text</p>',css}));
 const menu=clean({html:'<dialog id="mobile-menu"><button data-close-dialog>Close</button><nav><a href="#about">About</a></nav></dialog>',css:''});assert.match(menu.html,/<dialog id="mobile-menu">/);assert.match(menu.html,/data-close-dialog/);
});
test('visual case publication changes only the selected work and rejects stale revisions',async()=>{
 const {WorksDraftSchema}=runtime()('lib/works.ts');
 const item=id=>({id,kind:'webapp',title:id,description:'Original',image:'',imageAlt:'',url:'/work/'+id,published:true,demo:false,artwork:'sample',caseStudy:{slug:id,problem:'Problem',solution:'Solution',impact:'Result',appUrl:'',blocks:[]}});
 const initial={id:'works',revision:8,draft:{items:[item('one'),{...item('two'),description:'Private draft'}]},published:{items:[item('one'),item('two')]}};
 let written;
 const handler=runtime({'@/lib/cms-http':{cmsAccess:async()=>null,cmsError:error=>{throw error;}},'@/lib/db/works':{getWorksDocument:async()=>initial},'@/lib/db/cms':{CMSConflict:class extends Error{},writeCMS:async(_id,_current,draft,published)=>{written={draft,published,revision:9};return written;}}})('app/api/admin/visual/route.ts');
 const req=revision=>new NextRequest('https://portfolio.test/api/admin/visual',{method:'PUT',body:JSON.stringify({target:'one',revision,action:'publish',layout:{html:'<h1>Visual title</h1>',css:'h1{color:#fff}'}})});
 const response=await handler.PUT(req(8));assert.equal(response.status,200);assert.match(written.published.items[0].caseStudy.layout.html,/Visual title/);assert.equal(written.published.items[1].description,'Original');assert.equal(written.draft.items[1].description,'Private draft');assert.equal(WorksDraftSchema.safeParse(written.draft).success,true);await assert.rejects(()=>handler.PUT(req(7)));
});
test('visual endpoints require an actual admin session before reading or writing documents',async()=>{
 const handler=runtime({'@/lib/cms-http':{cmsAccess:async()=>new Response('Unauthorized',{status:401})}})('app/api/admin/visual/route.ts');
 assert.equal((await handler.GET(new NextRequest('https://portfolio.test/api/admin/visual?target=home'))).status,401);assert.equal((await handler.PUT(new NextRequest('https://portfolio.test/api/admin/visual',{method:'PUT'}))).status,401);
});
test('private media references work inside published HTML and CSS without substring collisions',()=>{
 const media=runtime()('lib/cms-media.ts'),url='/api/media/works/example.png';
 assert.equal(media.referencesMedia({layout:{html:`<img src="${url}?v=1">`,css:''}},url),true);
 assert.equal(media.referencesMedia({layout:{html:'',css:`.cover{background-image:url('${url}');}`}},url),true);
 assert.equal(media.referencesMedia(`<img src="${url}-other">`,url),false);
});
test('homepage visual save synchronizes copy without duplicating copyright or publishing drafts',async()=>{
 const base=await runtime({'./cms':{}})('lib/db/site.ts').initialSite();let written;
 const handler=runtime({'@/lib/cms-http':{cmsAccess:async()=>null,cmsError:error=>{throw error;}},'@/lib/db/site':{getSiteDocument:async()=>({revision:2,draft:base,published:base})},'@/lib/db/cms':{CMSConflict:class extends Error{},writeCMS:async(_id,_doc,draft,published)=>{written={revision:3,draft,published};return written;}}})('app/api/admin/visual/route.ts');
 const response=await handler.PUT(new NextRequest('https://portfolio.test/api/admin/visual',{method:'PUT',body:JSON.stringify({target:'home',revision:2,action:'save',layout:{html:'<h1 id="hero-title">Changed<br>headline</h1><footer class="site-footer"><p>© 2026 <span>R. Gading Utama</span></p></footer>',css:''}})}));
 assert.equal(response.status,200);assert.equal(written.draft.values.headline,'Changed\nheadline');assert.equal(written.draft.values.footerName,'R. Gading Utama');assert.equal(written.published,base);
 const site=runtime({'./cms':{}})('lib/db/site.ts');const rendered=await site.renderHomepage(written.draft);assert.match(rendered,/Changed/);assert.equal((rendered.match(/© 2026/g)||[]).length,1);assert.doesNotMatch(rendered,/<section class="hero/);
});
test('converting the incumbent homepage preserves menu and carousel runtime hooks',()=>{
 const fs=require('node:fs'),cheerio=require('cheerio');
 const original=cheerio.load(fs.readFileSync('public/index.html','utf8')),converted=cheerio.load(clean({html:original('body').html(),css:''}).html);
 for(const selector of ['dialog#mobile-menu','[data-close-dialog]','[data-carousel-toggle]','[data-carousel-prev]','[data-carousel-next]','[data-retry-works]','[data-works-list]','[data-work-kind]'])assert.equal(converted(selector).length,original(selector).length,selector);
});

test('multiline copy and its line-break styling survive sanitization, draft saving and public rendering with icons intact',async()=>{
 const site=runtime({'./cms':{}})('lib/db/site.ts'),base=await site.initialSite();let written;
 const handler=runtime({'@/lib/cms-http':{cmsAccess:async()=>null,cmsError:error=>{throw error;}},'@/lib/db/site':{getSiteDocument:async()=>({revision:3,draft:base,published:base})},'@/lib/db/cms':{CMSConflict:class extends Error{},writeCMS:async(_id,_doc,draft,published)=>{written={revision:4,draft,published};return written;}}})('app/api/admin/visual/route.ts');
 const layout={html:'<div class="hero-bottom"><p id="multiline">First line\nSecond line</p><a href="#contact">Talk <svg><use href="/assets/icons/lucide.svg#arrow-up-right"></use></svg></a></div>',css:'#multiline{white-space:pre-line}'};
 const response=await handler.PUT(new NextRequest('https://portfolio.test/api/admin/visual',{method:'PUT',body:JSON.stringify({target:'home',revision:3,action:'save',layout})}));
 assert.equal(response.status,200);assert.equal(written.published,base);
 const rendered=await site.renderHomepage(written.draft);
 assert.match(rendered,/First line\nSecond line/);assert.match(rendered,/white-space:pre-line/);assert.match(rendered,/lucide\.svg#arrow-up-right/);
});
