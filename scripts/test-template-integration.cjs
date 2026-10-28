const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('cheerio'),{runtime}=require('./cms-script-runtime.cjs');
const {NextRequest,NextResponse}=require('next/server');

test('active homepage promotes only the four editorial capabilities and keeps portfolio navigation and contact',async()=>{
 const db=runtime({'./cms':{}})('lib/db/site.ts'),schema=runtime()('lib/site.ts');
 const site=await db.initialSite(),$=load(await db.renderHomepage(site));
 assert.deepEqual($('.expertise-heading h4').map((_,el)=>$(el).text()).get(),Object.values(schema.expertiseDefaults));
 assert.equal($('.expertise-card').length,4);assert.equal($('.expertise-card p,.capability-list,#drawerPanel,.contact-editorial').length,0);
 assert.equal($('#mobile-menu.menu-dialog').length,1);assert.equal($('.contact-layout .button').text().trim(),'Chat on WhatsApp');
 assert.equal($('.contact-section').length,1);assert.equal($('link[href="/assets/css/expertise.css"]').length,1);
 assert.equal(schema.siteFields.filter(field=>field.group==='Kemampuan').length,4);
 assert.equal(schema.SiteSchema.safeParse(site).success,true);
});

test('legacy saved layout migration preserves unrelated content and does not mutate draft or published input',async()=>{
 const db=runtime({'./cms':{}})('lib/db/site.ts'),schema=runtime()('lib/site.ts');
 const site=await db.initialSite();Object.keys(schema.expertiseDefaults).forEach(key=>delete site.values[key]);
 site.values.capabilityTitle0='Legacy marketing';site.values.capabilityBody0='Retain historical data';
 site.layout={html:'<header><button id="menu-toggle">Menu</button></header><main><section class="hero"><h1 id="hero-title">Old</h1></section><section id="work" data-custom="keep">Existing works</section><section id="about"><div class="about-copy"><p>Keep about</p></div><div class="capability-layout"><h3>What I do</h3><div class="capability-list"><details><summary>Old capability</summary><p>Old description</p></details></div></div></section><section id="contact"><div class="contact-layout"><p>Keep contact</p></div></section></main>',css:'#work { margin-top: 12px; }'};
 const before=JSON.stringify(site),$=load(await db.renderHomepage(site));
 assert.equal(JSON.stringify(site),before);assert.equal($('.expertise-card').length,4);assert.equal($('.capability-list').length,0);
 assert.equal($('#work').text(),'Existing works');assert.equal($('.contact-layout p').text(),'Keep contact');assert.equal($('style[data-cms-layout]').text(),site.layout.css);
 assert.equal($('.expertise-heading h4').first().text(),schema.expertiseDefaults.expertiseTitle0);
 assert.equal(schema.SiteSchema.safeParse(site).success,true);
 site.layout.html=$('body').html();site.values.expertiseTitle0='Edited strategy';
 const repeated=load(await db.renderHomepage(site));assert.equal(repeated('.expertise-card').length,4);assert.equal(repeated('.expertise-heading h4').first().text(),'Edited strategy');
 const sanitized=runtime()('lib/visual-layout.ts').cleanVisualLayout({html:repeated('body').html(),css:''});
 assert.equal(load(sanitized.html)('.expertise-art svg').length,5);
});

test('archive uses protected asset URLs and refuses traversal or arbitrary files',async()=>{
 const {archivedTemplate}=runtime()('lib/template-archive.ts');
 const html=await archivedTemplate(['index.html']);assert.match(html.body,/Arsip portfo/);assert.match(html.body,/\/api\/admin\/templates\/portfo\/assets\/css\/portfolio.css/);
 assert.doesNotMatch(html.body,/(?:src|href)=["'](?:\.\/)?\/assets\//);
 assert.equal((await archivedTemplate(['assets','fonts','inter-latin-variable.woff2'])).type,'font/woff2');
 for(const parts of [['..','README.md'],['assets','..','..','.env.local'],['assets','missing.jpg'],['README.md'],['index.html','extra'],[]])assert.equal(await archivedTemplate(parts),null);
 assert.equal(fs.existsSync('public/index.html'),false);assert.equal(fs.existsSync('public/assets/videos/hero-dark.mp4'),false);
 assert.equal(fs.existsSync('templates/portfo/source/assets/videos/hero-dark.mp4'),true);
});

test('every archive resource requires admin authentication and responses are private and unindexed',async()=>{
 const file='app/api/admin/templates/portfo/[...path]/route.ts',request=new NextRequest('http://localhost/api/admin/templates/portfo/index.html');
 let reads=0;
 const blocked=runtime({'@/lib/cms-http':{cmsAccess:async()=>NextResponse.json({error:'Login'},{status:401})},'@/lib/template-archive':{archivedTemplate:async()=>{reads++;}}})(file);
 assert.equal((await blocked.GET(request,{params:Promise.resolve({path:['index.html']})})).status,401);assert.equal(reads,0);
 const allowed=runtime({'@/lib/cms-http':{cmsAccess:async()=>null,cmsError:error=>{throw error;}}})(file);
 const response=await allowed.GET(request,{params:Promise.resolve({path:['index.html']})});
 assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');assert.match(response.headers.get('content-security-policy'),/connect-src 'none'/);
});
