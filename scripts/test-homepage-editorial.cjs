const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('cheerio');
const runtime=require('./cms-script-runtime.cjs').runtime();
const {homepageWorks,setHomepageFeatured}=runtime('lib/homepage-works.ts');
const {withInitialWorks}=runtime('lib/work-card-html.ts');
const {WorksDraftSchema,publicWork}=runtime('lib/works.ts');
const {editorialCaseLayout}=runtime('lib/case-layout.ts');
const app=(id,patch={})=>({id,title:id,kind:'webapp',description:'Description',image:'/cover.webp',imageAlt:'Cover',published:true,demo:false,artwork:'hub',url:'https://example.com',...patch});

test('manual homepage selection persists through schemas and public projections without reordering the collection',()=>{
  const original=['a','b','c','d','e','f'].map(id=>app(id));
  assert.deepEqual(homepageWorks(original).map(item=>item.id),['a','b','c']);
  assert.equal(setHomepageFeatured(original,'d',true),original);
  const selected=setHomepageFeatured(setHomepageFeatured(original,'b',false),'e',true);
  assert.deepEqual(homepageWorks(selected).map(item=>item.id),['a','c','e']);
  assert.deepEqual(selected.map(item=>item.id),original.map(item=>item.id));
  assert.equal(original[0].homepageFeatured,undefined);
  const parsed=WorksDraftSchema.parse({items:selected}).items.map(publicWork);
  assert.deepEqual(homepageWorks(parsed).map(item=>item.id),['a','c','e']);
  assert.equal(WorksDraftSchema.safeParse({items:original.map(item=>({...item,homepageFeatured:true}))}).success,false);
});

test('explicit empty selection stays empty and hidden or unfinished projects cannot be featured',()=>{
  const items=[app('a',{homepageFeatured:false}),app('b',{homepageFeatured:false}),app('private',{published:false}),app('unfinished',{demo:true})];
  assert.deepEqual(homepageWorks(items),[]);
  assert.equal(setHomepageFeatured(items,'private',true),items);
  assert.equal(setHomepageFeatured(items,'unfinished',true),items);
});

test('homepage counts distinguish all apps and case studies while collections retain their full contents',()=>{
  const html='<section class="works-group" data-work-kind="webapp"><div class="works-heading"><h3>Website / Apps</h3><a href="/webapp">View all <svg></svg></a></div><div data-works-list></div></section>';
  const items=['a','b','c','d'].map((id,index)=>app(id,{homepageFeatured:index!==1,...(index===0?{caseStudy:{slug:'a'}}:{})}));
  const $=load(withInitialWorks(html,items));
  assert.deepEqual($('.work-card-title').map((_,el)=>$(el).text()).get(),['a','c','d']);
  assert.equal($('.work-collection-summary').text(),'3 selected projects from 4 web apps · 1 case study');
  assert.equal($('a[href="/webapp"]').text(),'View all 4 projects ');
  assert.equal($('a[href="/webapp"] svg').length,1);
  assert.equal(load(withInitialWorks(html.replace('data-work-kind','data-collection="true" data-work-kind'),items))('.work-card').length,4);
});

test('visual case summaries use the shared cards without changing the saved HTML, images, links or CSS',()=>{
  const source={html:'<main><figure class="case-cover-art"><img src="/cover.png"></figure><section class="border-y"><h2 id="problem-solving-title">Old summary</h2><div><div class="case-summary-step"><h3>Old</h3><p>A</p></div><div class="case-summary-step"><h3>Old</h3><p>B</p></div><div class="case-summary-step"><h3>Old</h3><p>C</p></div></div></section><div class="case-narrative"><hr><p>Story</p><a href="/next">Next</a></div></main>',css:'.custom{color:red}'};
  const edited=editorialCaseLayout(source,{problem:'New <problem>',solution:'Solution',impact:'Impact'}),$=load(edited.html);
  assert.equal($('.case-overview').length,1);assert.equal($('.case-summary-grid').children().length,3);
  assert.equal($('.case-summary-step p').first().text(),'New <problem>');
  assert.equal($('problem').length,0);assert.equal($('hr').length,0);
  assert.equal($('img').attr('src'),'/cover.png');assert.equal($('a').attr('href'),'/next');
  assert.equal(edited.css,source.css);assert.match(source.html,/Old summary/);
  assert.equal(editorialCaseLayout(edited,{problem:'New <problem>',solution:'Solution',impact:'Impact'}).html,edited.html);
});

test('custom visual pages gain one overview after their cover and retain the rest of the story',()=>{
  const layout={html:'<main><figure class="case-cover-art"><img src="/cover.png"></figure><p>Story</p></main>',css:''};
  const result=editorialCaseLayout(layout,{problem:'P',solution:'A',impact:'O'}),$=load(result.html);
  assert.equal($('.case-cover-art').next().hasClass('case-overview'),true);
  assert.equal($('main>p').text(),'Story');
});

test('legacy draft-preview layouts reuse their existing summary once, after the cover',()=>{
  const source={html:'<main><header class="case-intro"><h1>Title</h1></header><div class="project-art"><img src="/cover.png"></div><div class="case-narrative"><section><h2>The problem</h2><p>Original P</p></section><section><h2>The solution</h2><p>Original A</p></section><section><h2>The impact</h2><p>Original O</p></section><div class="study-case-blocks"><h2>Detailed story</h2><p>Story</p></div></div></main>',css:''};
  const rendered=editorialCaseLayout(source,{problem:'P',solution:'A',impact:'O'}),$=load(rendered.html);
  assert.equal($('.case-overview').length,1);assert.equal($('.case-summary-step').length,3);
  assert.equal($('.project-art').next().hasClass('case-overview'),true);
  assert.deepEqual($('.case-summary-step p').map((_,el)=>$(el).text()).get(),['P','A','O']);
  assert.equal($('.study-case-blocks p').text(),'Story');
  assert.equal($('h2').filter((_,el)=>$(el).text()==='The problem').length,0);
});
