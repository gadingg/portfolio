const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('cheerio'),{runtime}=require('./cms-script-runtime.cjs');
const get=runtime(),copy=get('lib/public-copy.ts'),edition=require('../lib/public-copy-content.json');
const base={id:'example',kind:'webapp',title:'Example',description:'',image:'/assets/example.png',imageAlt:'Example',url:'https://example.com',published:true,demo:false,artwork:'sample'};
test('copy migration preserves originals and later custom edits, and stays idempotent',async()=>{
 const site=await runtime({'./cms':{}})('lib/db/site.ts').initialSite();
 site.values.intro=edition.site.intro.from[0];site.values.heroPrimary='Custom CTA';
 const before=structuredClone(site),next=copy.refineSiteCopy(site);
 assert.deepEqual(site,before);assert.equal(next.values.intro,edition.site.intro.to);assert.equal(next.values.heroPrimary,'Custom CTA');assert.deepEqual(copy.refineSiteCopy(next),next);
 next.values.intro=edition.site.intro.from[0];assert.equal(copy.refineSiteCopy(next).values.intro,edition.site.intro.from[0]);
});
test('case layouts remove only exact redundant sections and preserve facts, links, media, and custom copy',()=>{
 const profile=edition.cases.mydaily,removed=profile.removeSections[0],illustration='Seluruh nominal, transaksi, tugas, dan riwayat kebiasaan pada mockup menggunakan data ilustrasi.';
 const layout={html:`<h2>${removed.heading}</h2><p>${removed.paragraph}</p><p>${illustration}</p><h2>Custom section</h2><p>Custom explanation.</p><a href="https://example.com">Open app</a><img src="/assets/example.png">`,css:'.custom{color:orange}'};
 const before=structuredClone(layout),next=copy.refineCopyLayout(layout,profile.text,profile.removeSections),$=load(next.html);
 assert.deepEqual(layout,before);assert.equal(next.css,layout.css);assert.ok($('body').text().includes(illustration));assert.ok($('body').text().includes('Custom explanation.'));assert.ok(!$('body').text().includes(removed.paragraph));assert.equal($('a').attr('href'),'https://example.com');assert.equal($('img').attr('src'),'/assets/example.png');
 const changed=copy.refineCopyLayout({html:`<h2>${removed.heading}</h2><p>Updated by owner.</p>`,css:''},profile.text,profile.removeSections);assert.match(changed.html,/Updated by owner/);
});
test('design naming is guarded by item and image and preserves owner edits',()=>{
 const design=edition.designs[0],item={...base,id:design.id,kind:'design',image:design.image,title:design.fromTitle,imageAlt:design.fromAlt[0]};
 const next=copy.refineWorkCopy(item);assert.equal(next.title,design.title);assert.equal(next.imageAlt,design.alt);assert.deepEqual(copy.refineWorkCopy(next),next);
 assert.equal(copy.refineWorkCopy({...item,image:'/different.png'}).title,item.title);
 assert.equal(copy.refineWorkCopy({...item,title:'Custom title'}).title,'Custom title');
 assert.equal(get('lib/works.ts').publicWork(next).copyEdition,undefined);
});
test('homepage count follows ready published items and remains independent of three-card preview',()=>{
 const render=get('lib/work-card-html.ts').withInitialWorks;
 const html='<section data-work-kind="webapp"><div class="works-heading"><h3>Website / Apps</h3><a href="/webapp">View all<svg></svg></a></div><div data-works-list></div></section>';
 const visible=Array.from({length:5},(_,i)=>({...base,id:`work-${i}`,caseStudy:{slug:`work-${i}`}}));
 const items=[...visible,{...base,id:'hidden',published:false},{...base,id:'demo',demo:true},{...base,id:'incomplete',url:''}];
 const $=load(render(html,items));assert.equal($('.works-heading a').text(),'View all');assert.equal($('.works-count').text(),'5 case studies');assert.equal($('.works-heading svg').length,1);assert.equal($('.work-card').length,3);assert.match($('.works-heading a').attr('aria-label'),/View all web apps and case studies/);
 assert.equal(load(render(html,visible.slice(0,2)))('.works-count').text(),'2 case studies');
});

test('nested process headings retain their semantic and styling wrapper during layout migration',()=>{
 const next=copy.refineCopyLayout({html:'<ol><li><h3>Build</h3></li></ol>',css:''},{Build:'Design & Build'}),$=load(next.html);
 assert.equal($('li>h3').text(),'Design & Build');
});
test('a ready design with an old demo flag stays visible and counted',()=>{
 const html='<section data-work-kind="design"><div class="works-heading"><h3>Visual Design</h3><a>View all</a></div><div data-works-list></div></section>';
 const $=load(get('lib/work-card-html.ts').withInitialWorks(html,[{...base,kind:'design',demo:true}]));
 assert.equal($('.work-card').length,1);assert.equal($('.works-heading a').text(),'View all');assert.equal($('.works-count').text(),'1 design project');
});
test('all category headings separate count from action and repeated rendering does not duplicate count',()=>{
 const render=get('lib/work-card-html.ts').withInitialWorks;
 const html=['webapp','design','video'].map(kind=>`<section data-work-kind="${kind}"><div class="works-heading"><h3>${kind}</h3><a href="/${kind}">View all 9</a></div><div data-works-list></div></section>`).join('');
 const items=[base,{...base,id:'design',kind:'design'}];
 const $=load(render(render(html,items),items));
 assert.deepEqual($('.works-count').map((_,el)=>$(el).text()).get(),['1 project','1 design project','0 videos']);
 assert.equal($('.works-heading-copy').length,3);
 $('.works-heading > a').each((_,el)=>{assert.equal($(el).text(),'View all');assert.ok($(el).hasClass('button-outline'));assert.match($(el).find('use').attr('href'),/#arrow-right$/);});
 assert.equal($('[data-work-kind="design"] .works-heading > a').attr('href'),'/design');
});
test('Improve migrates the old process label independently without resetting saved About edits',async()=>{
 const site=await runtime({'./cms':{}})('lib/db/site.ts').initialSite();
 site.values.publicCopyEdition=edition.edition;site.values.aboutEditorialVersion='1';
 site.values.aboutBody1='I take part in planning campaigns, designing the visuals, and building the tools the team needs.';
 for(const previous of ['Ownership','Take ownership','Take Ownership']){
  const next=copy.refineSiteCopy({...site,values:{...site.values,processTitle4:previous},layout:{html:`<ol><li><h3>${previous}</h3></li></ol>`,css:''}});
  assert.equal(next.values.processTitle4,'Improve');assert.equal(next.values.aboutBody1,site.values.aboutBody1);assert.equal(load(next.layout.html)('li>h3').text(),'Improve');
  next.values.processTitle4='Custom step';assert.equal(copy.refineSiteCopy(next).values.processTitle4,'Custom step');
 }
});
