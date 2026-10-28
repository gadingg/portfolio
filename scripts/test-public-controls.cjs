const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {runtime}=require('./cms-script-runtime.cjs');
test('hero uses approved English copy in legacy layouts, with the experience sentence on its own line',async()=>{
 const db=runtime({'./cms':{}})('lib/db/site.ts'),{load}=require('cheerio'),site=await db.initialSite();
 site.values.intro='Saya suka mengembangkan ide jadi sesuatu yang benar-benar kepakai. Mulai dari campaign, visual, sampai web-app yang bikin workflow\u00a0lebih simpel.';
 site.layout={html:'<main><section class="hero"><div class="hero-bottom"><p>Old introduction</p><div class="actions"><a href="#work">Works</a></div></div></section><section data-work-kind="webapp"><div class="works-heading"><h3>Website / Apps</h3><a href="/webapp">View all</a></div></section></main>',css:''};
 const $=load(await db.renderHomepage(site,[],6));
 assert.equal($('.hero-bottom > p').text(),'From creative concepts to thoughtful design and useful digital products.\n2+ years across creative marketing, design, and product development.');
 assert.match($('.hero-bottom > p').attr('style'),/white-space:\s*pre-line/);assert.equal($('.hero-bottom .actions a').attr('href'),'#work');
 assert.equal($('[data-works-count]').text(),'6 case studies');assert.equal($('.works-heading a').attr('href'),'/webapp');
 site.values.intro='Custom introduction';assert.equal(load(await db.renderHomepage(site))('.hero-bottom > p').text(),'Custom introduction');
});
test('homepage shows three previews but counts all published non-demo case studies; collection stays complete',()=>{
 const source=fs.readFileSync('public/assets/js/works.js','utf8'),start=source.indexOf('      groups.forEach(group=>{const list=group.querySelector'),end=source.indexOf('\n    } catch',start),body=source.slice(start,end);
 const item=(id,extra={})=>({id,kind:'webapp',published:true,demo:false,caseStudy:{slug:id},...extra});
 const data={items:[...Array.from({length:6},(_,i)=>item(String(i))),item('demo',{demo:true}),item('hidden',{published:false}),item('app',{caseStudy:undefined}),item('design',{kind:'design'})]};
 const make=(collection)=>{const list={replaceChildren(...items){this.items=items;},append(){},scrollLeft:0},heading={querySelector:()=>null,append(label){this.label=label;}};return {dataset:{workKind:'webapp',...(collection?{collection:'true'}:{})},querySelector:q=>q==='[data-works-list]'?list:heading,list,heading};};
 const home=make(false),collection=make(true);
 vm.runInNewContext(body,{groups:[home,collection],data,card:item=>item,node:()=>({setAttribute(){}})});
 assert.equal(home.list.items.length,3);assert.equal(home.heading.label.textContent,'6 case studies');assert.equal(collection.list.items.length,8);
 const empty=make(false);vm.runInNewContext(body,{groups:[empty],data:{items:[]},card:item=>item,node:()=>({setAttribute(){}})});assert.equal(empty.heading.label.textContent,'0 case studies');
});
test('process copy combines design and code, upgrades legacy values, and keeps custom edits',async()=>{
 const db=runtime({'./cms':{}})('lib/db/site.ts'),{load}=require('cheerio');
 const site=await db.initialSite();
 Object.assign(site.values,{processTitle:'How I work.',processTitle0:'Observe',processTitle1:'Brainstorm',processTitle2:'Build',processTitle3:'Collaborate',processTitle4:'Ownership'});
 const $=load(await db.renderHomepage(site));
 assert.equal($('#process-title').text(),'From idea to something useful.');
 assert.deepEqual($('.principles h3').map((_,el)=>$(el).text()).get(),['Understand','Explore','Design & Build','Test & Refine','Deliver']);
 assert.deepEqual($('.principles li').eq(2).find('use').map((_,el)=>$(el).attr('href')).get(),['/assets/icons/lucide.svg#pen-tool','/assets/icons/lucide.svg#code-2']);
 assert.equal($('.principles p').length,0);assert.equal($('.pipeline-step-icons').length,5);
 site.values.processTitle2='Custom process';assert.equal(load(await db.renderHomepage(site))('.principles h3').eq(2).text(),'Custom process');
});
test('homepage skip link survives stored layouts and targets a focusable main landmark',async()=>{
 const db=runtime({'./cms':{}})('lib/db/site.ts'),{load}=require('cheerio');
 const site=await db.initialSite();
 for(const html of [null,'<header><a href="#work">Works</a></header><main><section id="work">Work</section></main>','<a class="skip-link" href="#missing">Old</a><main id="custom-content">Content</main>','<section id="work">Legacy content without main</section>','']){
  const value=html===null?site:{...site,layout:{html,css:''}};
  const $=load(await db.renderHomepage(value)),link=$('body > .skip-link');
  assert.equal($('.skip-link').length,1);assert.equal(link.length,1);
  assert.equal($('body').children().first().hasClass('skip-link'),true);
  const target=$(link.attr('href'));assert.equal(target.length,1);assert.equal(target[0].tagName,'main');assert.equal(target.attr('tabindex'),'-1');
  if(html?.includes('custom-content'))assert.equal(link.attr('href'),'#custom-content');
  if(html?.includes('Legacy content'))assert.equal(target.find('#work').text(),'Legacy content without main');
 }
});
function carousel(kind='design',reducedMotion=false){
 const source=fs.readFileSync('public/assets/js/works.js','utf8');
 const body=source.slice(source.indexOf('  function setupCarousel(group) {'),source.indexOf('  groups.filter'));
 let now=0,sequence=0;const timers=new Map();
 const element=()=>({listeners:{},addEventListener(name,fn){this.listeners[name]=fn;},setAttribute(name,value){this[name]=value;},replaceChildren(){},getBoundingClientRect(){return {left:0,width:300};}});
 const list=Object.assign(element(),{scrollWidth:1400,clientWidth:600,scrollLeft:0,children:[element(),element(),element(),element()],contains:()=>false,scrollTo({left}){this.scrollLeft=left;}});
 const toggle=element(),prev=element(),next=element(),position={};
 const controls={querySelector:q=>q.includes('toggle')?toggle:q.includes('prev')?prev:q.includes('next')?next:position};
 const group={dataset:{workKind:kind},querySelector:q=>q==='[data-works-list]'?list:q==='.carousel-controls'?controls:{textContent:'Works'}};
 const document={hidden:false,querySelector:()=>null,addEventListener(){}};
 vm.runInNewContext(body+';setupCarousel(group)',{group,document,reduced:{matches:reducedMotion,addEventListener(){}},icon:()=>({}),ResizeObserver:class{observe(){}},IntersectionObserver:class{constructor(fn){this.fn=fn;}observe(){this.fn([{isIntersecting:true}]);}},setInterval(fn,ms){const id=++sequence;timers.set(id,{fn,ms,due:now+ms});return id;},clearInterval:id=>timers.delete(id)});
 const advance=ms=>{now+=ms;for(const timer of timers.values())if(timer.due<=now){timer.fn();timer.due=now+timer.ms;}};
 return {list,toggle,prev,next,group,document,advance};
}
for(const kind of ['design','video'])test(`${kind}: autoplay, pause, and resume while control keeps focus`,()=>{
 const c=carousel(kind);c.advance(5000);assert.equal(c.list.scrollLeft,324);
 c.toggle.listeners.click();c.advance(10000);assert.equal(c.list.scrollLeft,324);assert.equal(c.toggle['aria-label'],'Resume slides');
 c.toggle.listeners.click();c.advance(4999);assert.equal(c.list.scrollLeft,324);c.advance(1);assert.equal(c.list.scrollLeft,648);assert.equal(c.toggle['aria-label'],'Pause slides');
 assert.equal(c.group.listeners,undefined); // Controls are outside the artwork's hover/focus pause region.
});
test('artwork focus pauses; Resume clears that pause; touch and reduced motion remain opt in',()=>{
 const c=carousel();c.list.listeners.focusin();c.advance(5000);assert.equal(c.list.scrollLeft,0);
 c.toggle.listeners.click();c.toggle.listeners.click();c.advance(5000);assert.equal(c.list.scrollLeft,324);
 c.list.listeners.pointerdown({pointerType:'touch'});c.advance(5000);assert.equal(c.list.scrollLeft,324);
 const r=carousel('design',true);r.advance(5000);assert.equal(r.list.scrollLeft,0);r.toggle.listeners.click();r.advance(5000);assert.equal(r.list.scrollLeft,324);
});
test('legacy CMS layouts render icon-only menu and social links without losing copy or breaking old saves',async()=>{
 const db=runtime({'./cms':{}})('lib/db/site.ts'),schema=runtime()('lib/site.ts');
 const site=await db.initialSite();delete site.values.linkedin;
 const parsed=schema.SiteSchema.parse(site);assert.equal(parsed.values.linkedin,schema.defaultLinkedIn);
 site.layout={html:'<header><button id="menu-toggle" class="button button-outline menu-toggle">Menu</button></header><div class="contact-bottom"><span>Existing signature</span><a href="https://instagram.com/gadingg_">Instagram old label</a></div>',css:''};
 const {load}=require('cheerio'),$=load(await db.renderHomepage(site));
 assert.equal($('#menu-toggle').text(),'');assert.equal($('#menu-toggle').hasClass('button'),false);assert.equal($('#menu-toggle use').attr('href'),'/assets/icons/lucide.svg#menu');
 assert.equal($('.social-icon').length,2);assert.equal($('.social-icon').text(),'');assert.equal($('[data-social="linkedin"]').attr('href'),schema.defaultLinkedIn);
 assert.equal($('[data-social="instagram"]').attr('aria-label'),site.values.instagramLabel);assert.equal($('.contact-bottom > span').text(),site.values.footerSignature);
 site.values.linkedin='';const empty=load(await db.renderHomepage(site));assert.equal(empty('[data-social="linkedin"]').length,0);
});
test('homepage and stored layouts lead directly to Works and retain only editable process titles',async()=>{
 const db=runtime({'./cms':{}})('lib/db/site.ts'),{siteFields}=runtime()('lib/site.ts'),{load}=require('cheerio');
 const site=await db.initialSite();site.values.processTitle2='Prototype';
 site.values.heroImage='/api/media/retained-image.png';
 site.layout={html:'<main><section class="hero"><h1 id="hero-title">Intro</h1><div class="work-strip">Old artwork</div><div class="hero-signoff">Old tagline</div></section><section id="work">Works</section><section class="process-section"><div class="section-heading"><h2 id="process-title">How I work.</h2><p>Supporting intro</p></div><ol class="principles">'+Array.from({length:5},(_,i)=>`<li><h3>Step ${i}</h3><p>Supporting step</p></li>`).join('')+'</ol></section></main>',css:''};
 const $=load(await db.renderHomepage(site));assert.equal($('.hero').next().attr('id'),'work');assert.equal($('.hero .work-strip,.hero-signoff').length,0);
 assert.equal($('.process-pipeline .principles > li').length,5);assert.equal($('.pipeline-track .pipeline-fill').length,2);assert.equal($('.process-section p').length,0);assert.equal($('.principles li').eq(2).find('h3').text(),'Prototype');
 assert.equal($('.pipeline-step-icon').length,6);assert.equal($('.pipeline-fill').first().attr('pathLength'),'1');
 assert.equal(site.values.heroImage,'/api/media/retained-image.png');assert.equal(siteFields.some(field=>field.key==='heroImage'||field.key==='processIntro'||field.key.startsWith('processBody')),false);
 assert.equal($('script[src="/assets/vendor/gsap/ScrollTrigger.min.js"]').length,1);
 const route=runtime({'@/lib/cms-http':{cmsAccess:async()=>null,cmsError:error=>{throw error;}},'@/lib/db/site':{getSiteDocument:async()=>({draft:site,revision:1}),renderHomepage:db.renderHomepage},'@/lib/db/works':{getWorksDocument:async()=>({draft:{items:[]}})}})('app/api/admin/visual/route.ts');
 const response=await route.GET(new (require('next/server').NextRequest)('http://localhost/api/admin/visual?target=home'));
 const editor=load((await response.json()).layout.html);assert.equal(editor('.work-strip').length,0);assert.equal(editor('.process-pipeline').length,1);assert.equal(editor('.process-section p').length,0);
});
