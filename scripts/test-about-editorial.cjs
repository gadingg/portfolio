const test=require('node:test'),assert=require('node:assert/strict'),{load}=require('cheerio');
const {runtime}=require('./cms-script-runtime.cjs');
const get=runtime({'./cms':{}}),db=get('lib/db/site.ts');
const work=(id,kind)=>({id,kind,title:id,image:`/assets/work/${id}.webp`,imageAlt:`Artwork ${id}`,published:true,demo:false,url:'https://example.com',description:'',artwork:'sample'});
test('About pairs only ready published work, keeps responsive images, and preserves the title and CV action',async()=>{
 const site=await db.initialSite(),before=structuredClone(site);
 const works=[{...work('hidden','design'),published:false},work('poster','design'),work('app','webapp')];
 const $=load(await db.renderHomepage(site,[],works));
 assert.deepEqual(site,before);assert.equal($('.about-introduction').length,1);assert.equal($('.about-heading #about-title').length,1);
 assert.deepEqual($('.about-action-line').map((i,e)=>$(e).text()).get(),['Plan campaigns.','Design visuals.','Build useful tools.']);
 assert.equal($('.about-workboard img').length,2);assert.ok($('.about-work-poster img').attr('src').includes('poster.webp'));assert.ok(!$('.about-workboard').html().includes('hidden'));
 $('.about-workboard img').each((i,e)=>{assert.equal($(e).attr('loading'),'lazy');assert.ok($(e).attr('srcset'));assert.ok($(e).attr('width'));assert.ok($(e).attr('height'));});
 assert.equal($('.about-copy>a').attr('href'),'/cv');assert.equal($('.browser-progress').length,1);assert.equal($('.ai-packet').length,1);
});
test('missing artwork leaves no empty collage, saved layouts remain stable, and owner removals are respected',async()=>{
 const site=await db.initialSite(),works=[work('poster','design'),work('app','webapp')];
 assert.equal(load(await db.renderHomepage(site,[],[]))('.about-workboard').length,0);
 const $=load(await db.renderHomepage(site,[],works));
 site.layout={html:$('body').html(),css:''};
 let again=load(await db.renderHomepage(site,[],works));assert.equal(again('.about-workboard').length,1);assert.equal(again('.about-introduction').length,1);assert.equal(again('.browser-progress').length,1);
 again('.about-workboard').remove();site.layout={html:again('body').html(),css:''};
 again=load(await db.renderHomepage(site,[],works));assert.equal(again('.about-workboard').length,0);
});
test('new About copy migration works on the previous copy edition without resetting unrelated or later custom text',async()=>{
 const {refineSiteCopy}=get('lib/public-copy.ts'),site=await db.initialSite();
 site.values.publicCopyEdition='2026-11-01-public-copy';site.values.aboutBody1='I take part in planning campaigns, designing the visuals, and building the tools the team needs.';site.values.heroPrimary='Custom CTA';
 const migrated=refineSiteCopy(site);assert.equal(migrated.values.aboutBody1,'Plan campaigns. Design visuals. Build useful tools.');assert.equal(migrated.values.heroPrimary,'Custom CTA');assert.equal(site.values.aboutEditorialVersion,undefined);
 migrated.values.aboutBody1=site.values.aboutBody1;assert.equal(refineSiteCopy(migrated).values.aboutBody1,site.values.aboutBody1);
 const custom={...site,values:{...site.values,aboutBody1:'Owner bio.'}};assert.equal(refineSiteCopy(custom).values.aboutBody1,'Owner bio.');
});
