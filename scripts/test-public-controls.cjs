const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {runtime}=require('./cms-script-runtime.cjs');
function carousel(kind='design',reducedMotion=false){
 const source=fs.readFileSync('public/assets/js/works.js','utf8');
 const start=source.indexOf('  function setupCarousel(group) {');
 const body=source.slice(start,source.indexOf('  groups.filter',start));
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
 const c=carousel(kind);c.advance(5000);assert.equal(c.list.scrollLeft,316);
 c.toggle.listeners.click();c.advance(10000);assert.equal(c.list.scrollLeft,316);assert.equal(c.toggle['aria-label'],'Resume slides');
 c.toggle.listeners.click();c.advance(4999);assert.equal(c.list.scrollLeft,316);c.advance(1);assert.equal(c.list.scrollLeft,632);assert.equal(c.toggle['aria-label'],'Pause slides');
 assert.equal(c.group.listeners,undefined); // Controls are outside the artwork's hover/focus pause region.
});
test('artwork focus pauses; Resume clears that pause; touch and reduced motion remain opt in',()=>{
 const c=carousel();c.list.listeners.focusin();c.advance(5000);assert.equal(c.list.scrollLeft,0);
 c.toggle.listeners.click();c.toggle.listeners.click();c.advance(5000);assert.equal(c.list.scrollLeft,316);
 c.list.listeners.pointerdown({pointerType:'touch'});c.advance(5000);assert.equal(c.list.scrollLeft,316);
 const r=carousel('design',true);r.advance(5000);assert.equal(r.list.scrollLeft,0);r.toggle.listeners.click();r.advance(5000);assert.equal(r.list.scrollLeft,316);
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
 assert.equal($('.pipeline-step-icon').length,5);assert.equal($('.pipeline-fill').first().attr('pathLength'),'1');
 assert.equal(site.values.heroImage,'/api/media/retained-image.png');assert.equal(siteFields.some(field=>field.key==='heroImage'||field.key==='processIntro'||field.key.startsWith('processBody')),false);
 assert.equal($('script[src="/assets/vendor/gsap/ScrollTrigger.min.js"]').length,1);
 const route=runtime({'@/lib/cms-http':{cmsAccess:async()=>null,cmsError:error=>{throw error;}},'@/lib/db/site':{getSiteDocument:async()=>({draft:site,revision:1}),renderHomepage:db.renderHomepage},'@/lib/db/works':{getWorksDocument:async()=>({draft:{items:[]}})}})('app/api/admin/visual/route.ts');
 const response=await route.GET(new (require('next/server').NextRequest)('http://localhost/api/admin/visual?target=home'));
 const editor=load((await response.json()).layout.html);assert.equal(editor('.work-strip').length,0);assert.equal(editor('.process-pipeline').length,1);assert.equal(editor('.process-section p').length,0);
});
