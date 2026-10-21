const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('cheerio');
const runtime=require('./cms-script-runtime.cjs').runtime();
const {publicationState}=runtime('lib/publication-state.ts');
const {workCardsHTML,withInitialWorks,worksJSON}=runtime('lib/work-card-html.ts');
const {cleanPlaceholderCopy}=runtime('lib/placeholder-copy.ts');
const item=(patch={})=>({id:'one',title:'Project',description:'A useful project',image:'/assets/cover.webp',imageAlt:'Cover',kind:'webapp',url:'/work/one',published:true,demo:false,artwork:'hub',...patch});

test('all editor publication states require a saved unpublished draft, including busy and clean states',()=>{
  for(const dirty of [false,true])for(const pending of [false,true])for(const busy of [false,true]){
    const state=publicationState(dirty,pending,busy);
    assert.equal(state.canPublish,!dirty&&pending&&!busy);
    assert.equal(state.canSave,dirty&&!busy);
  }
  assert.equal(publicationState(false,false).visible,false);
});
test('server HTML contains usable case links before JavaScript and no nested interactive elements',()=>{
  const $=load(workCardsHTML([item()]));
  assert.equal($('.work-card-link').attr('href'),'/work/one');
  assert.equal($('.work-card-link').text().includes('Project'),true);
  assert.equal($('a a,a button,button a').length,0);
  assert.equal($('img').attr('src'),'/assets/cover.webp');
});
test('server cards and bootstrap escape untrusted copy and executable destinations',()=>{
  const dangerous=item({title:'</script><img src=x onerror=alert(1)>',description:'<script>alert(1)</script>',url:'javascript:alert(1)',image:'javascript:alert(1)'});
  const $=load(workCardsHTML([dangerous]));
  assert.equal($('script,[onerror],a[href^="javascript:"]').length,0);
  assert.equal(JSON.parse(worksJSON([dangerous])).items[0].title,dangerous.title);
  assert.equal(worksJSON([dangerous]).includes('</script>'),false);
});
test('placeholder copy disappears without removing media, flags or stored records',()=>{
  const original=item({demo:true,title:'Video contoh 02',description:'Data contoh. Ganti di admin.',imageAlt:'Cover video contoh'});
  const clean=cleanPlaceholderCopy(original);
  assert.equal(clean.title,'Video 02');assert.equal(clean.description,'');
  assert.equal(clean.image,original.image);assert.equal(clean.demo,true);assert.equal(original.title,'Video contoh 02');
  assert.equal(/contoh|dummy/i.test(load(workCardsHTML([original])).text()),false);
});
test('homepage snapshot respects visibility, collection limits and includes an accessible no-JS route',()=>{
  const html='<main id="main-content"><section data-work-kind="webapp"><div data-works-list></div></section></main>';
  const items=[...Array.from({length:8},(_,i)=>item({id:String(i),title:'Project '+i})),item({id:'hidden',published:false,title:'Private draft'})];
  const $=load(withInitialWorks(html,items));
  assert.equal($('.work-card').length,6);assert.equal($('a[href="#main-content"]').length,1);
  assert.equal($('[data-works-list]').attr('aria-busy'),'false');
  assert.equal($('#initial-works').text().includes('Private draft'),false);
});
