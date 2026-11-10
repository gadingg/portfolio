const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('cheerio'),{runtime}=require('./cms-script-runtime.cjs');
const modules=runtime({'./cms':{}}),{homepagePreview}=modules('lib/homepage-works.ts'),{withInitialWorks}=modules('lib/work-card-html.ts');
const app=(id,kind='webapp')=>({id,kind,title:id,description:'Real project copy',image:'/cover.webp',imageAlt:id,url:kind==='video'?'https://www.instagram.com/reel/Abc123/':kind==='webapp'?`/work/${id}`:'',caseStudy:kind==='webapp'?{slug:id}:undefined,published:true,demo:false,artwork:'hub'});
const items=[...Array.from({length:12},(_,i)=>({...app(`app-${i}`),homepageFeatured:[1,4,7].includes(i)})),...Array.from({length:4},(_,i)=>app(`design-${i}`,'design')),...Array.from({length:7},(_,i)=>app(`video-${i}`,'video'))];
test('home preview respects curated apps, mixes artwork, caps each category and does not mutate collection data',()=>{
 const original=structuredClone(items),selected=homepagePreview(items);
 assert.equal(selected.length,6);assert.deepEqual(selected.slice(0,3).map(item=>item.id),['app-1','app-4','app-7']);assert.ok(selected.some(item=>item.kind==='design'));assert.ok(selected.some(item=>item.kind==='video'));
 for(const kind of ['webapp','design','video'])assert.equal(homepagePreview(items,kind).length,Math.min(6,items.filter(item=>item.kind===kind).length));
 assert.deepEqual(items,original);assert.equal(homepagePreview([{...app('private'),published:false},{...app('unfinished'),demo:true}]).length,0);
});
test('fresh and stored home layouts render one content-first grid without search or repeated headings',async()=>{
 const db=modules('lib/db/site.ts'),site=await db.initialSite();
 const first=await db.renderHomepage(site,[],items),$=load(withInitialWorks(first,items));
 assert.equal($('#work [data-work-search],#work .works-heading,#work [data-carousel]').length,0);
 assert.equal($('#work [data-work-kind]').length,1);assert.equal($('#work [data-filter-kind]').length,4);assert.equal($('#work .work-card').length,6);
 assert.equal($('#work .work-card h3').length,6);assert.equal($('#work .work-card-description').length,3);assert.equal($('#work .work-card-design .work-card-description,#work .work-card-video .work-card-description').length,0);assert.equal($('#work .work-card-link').length,6);assert.equal($('#work .work-card-video .video-bottom').length,0);assert.equal($('#work .work-card-interactive .work-media').length,3);assert.equal($('#work button button,#work a a').length,0);assert.equal($('#work [data-view-all-works]').length,1);assert.equal($('#work [data-view-all-works]').attr('href'),'/works');
 for(const id of ['web-apps','visuals','videos'])assert.equal($(`#work button#${id}`).length,1);
 site.layout={html:first,css:''};const again=load(await db.renderHomepage(site,[],items));assert.equal(again('#work [data-work-filters]').length,1);assert.equal(again('#portfolio-results').length,1);assert.equal(again('#work [data-view-all-works]').length,1);
 const short=load(withInitialWorks(first,[app('one')]));assert.equal(short('.works-all-footer').is('[hidden]'),true);
});
test('archives keep their search input and complete cards',()=>{
 const {workFiltersHTML}=modules('lib/work-filters.ts');assert.equal(load(workFiltersHTML())('[data-work-search]').length,1);assert.equal(load(workFiltersHTML())('.work-search span').text(),'Search portfolio');assert.equal(load(workFiltersHTML())('[data-work-search]').attr('placeholder'),'Search by title or topic…');assert.equal(load(workFiltersHTML('all',true))('[data-work-search]').length,0);assert.equal(load(workFiltersHTML('all',false,true))('[data-filter-status]').length,0);assert.equal(load(workFiltersHTML('all',false,true))('[data-work-search]').length,1);
 const archive=load(withInitialWorks('<section data-work-kind="all" data-collection="true"><div data-works-list></div></section>',items));assert.equal(archive('.work-card').length,items.length);
});
