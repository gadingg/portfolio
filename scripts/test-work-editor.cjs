const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {renderToStaticMarkup}=require('react-dom/server'),{load:html}=require('cheerio');
const {componentRuntime}=require('./admin-component-runtime.cjs');
const runtime=componentRuntime(),{WorkEditor}=runtime('components/admin/WorkEditor.tsx');
const {workEditorErrors,focusWorkError}=runtime('lib/work-editor.ts');
const work=(kind,patch={})=>({id:'sample',kind,title:'Project',description:'Description',image:'/api/media/works/real.png',imageAlt:'Image',
  url:'https://example.com',published:true,demo:false,artwork:'hub',...patch});
const study={slug:'case',problem:'Problem',solution:'Solution',impact:'Outcome',appUrl:'',blocks:[]};
const props=item=>({item,items:[item],disabled:false,errors:{},onChange(){},async onKindChange(){},onBusyChange(){},onOpenVisual(){}});
const render=item=>html(renderToStaticMarkup(React.createElement(WorkEditor,props(item))));

test('each portfolio type has a focused primary form and moves settings out of the default reading flow',()=>{
  for(const kind of ['webapp','design','video']) {
    const $=render(work(kind,kind==='webapp'?{caseStudy:study}:kind==='video'?{videoSource:'file',videoFile:'/api/media/works/demo.mp4'}:{}));
    assert.equal($('.wm-card-preview').length,0);
    assert.equal($('select').closest('details').length,$('select').length);
    $('details,dialog').remove();
    assert.equal($('[data-work-field=title]').length,1);
    assert.equal($('select').length,0);
    assert.equal($('input[type=checkbox]').length,0);
    if(kind==='webapp') {
      assert.equal($('textarea').length,4);
      assert.equal($('[data-work-field="caseStudy.problem"]').length,1);
      assert.equal($('video').length,0);
    }
    if(kind==='design') {assert.equal($('textarea').length,0);assert.equal($('button').length,1);}
    if(kind==='video') {assert.equal($('video').length,1);assert.equal($('input[type=radio]').length,2);}
  }
});
test('video editor renders exactly its active source and keeps raw file links inside the media picker',()=>{
  let $=render(work('video',{videoSource:'instagram',url:'https://www.instagram.com/reel/real/',videoFile:'/api/media/works/old.mp4'}));
  assert.equal($('video').length,0);assert.equal($('[data-work-field=url]').length,1);
  $=render(work('video',{videoSource:'file',videoFile:'/api/media/works/active.mp4'}));
  assert.equal($('video').length,1);assert.equal($('[data-work-field=url]').length,0);
  assert.equal($('.cms-picker-link').closest('dialog').length,1);
  assert.equal($('button').filter((_,element)=>$(element).text()==='Ambil frame sekarang').length,1);
});
test('disabled video demos expose only their enable control, preserving configuration for reactivation',()=>{
  const {CaseMotionEditor}=runtime('components/admin/CaseMotionEditor.tsx');
  const value={...study,motion:{enabled:false,title:'Keep',video:'/assets/demo.mp4',poster:'/assets/image.png'}};
  let $=html(renderToStaticMarkup(React.createElement(CaseMotionEditor,{study:value,disabled:false,onChange(){},onBusyChange(){}})));
  assert.equal($('input[type=checkbox]').length,1);assert.equal($('input:not([type=checkbox])').length,0);assert.equal($('video').length,0);
  $=html(renderToStaticMarkup(React.createElement(CaseMotionEditor,{study:{...value,motion:{...value.motion,enabled:true}},disabled:false,onChange(){},onBusyChange(){}})));
  assert.equal($('video').length,1);assert.equal(value.motion.title,'Keep');
});
test('field handlers patch only their own content and category changes use the dedicated confirmation path',async()=>{
  const item=work('webapp',{caseStudy:study}),patches=[],kinds=[];
  const tree=WorkEditor({...props(item),onChange:patch=>patches.push(patch),onKindChange:async kind=>kinds.push(kind)});
  function nodes(element) {
    if(!element||typeof element!=='object')return [];
    return [element,...React.Children.toArray(element.props?.children).flatMap(nodes)];
  }
  const elements=nodes(tree);
  elements.find(el=>el.props?.['data-work-field']==='title').props.onChange({target:{value:'New title'}});
  elements.find(el=>el.props?.['data-work-field']==='caseStudy.problem').props.onChange({target:{value:'New problem'}});
  await elements.find(el=>el.type==='select').props.onChange({target:{value:'design'}});
  assert.deepEqual(patches[0],{title:'New title'});
  assert.equal(patches[1].caseStudy.problem,'New problem');assert.equal(patches[1].caseStudy.solution,'Solution');
  assert.deepEqual(kinds,['design']);assert.equal(item.title,'Project');
});
test('publication errors identify missing story fields, thumbnails and active video sources',()=>{
  let errors=workEditorErrors(work('webapp',{caseStudy:{...study,problem:'',solution:'',impact:''}}));
  for(const key of ['problem','solution','impact'])assert.ok(errors['caseStudy.'+key]);
  errors=workEditorErrors(work('video',{videoSource:'file',videoFile:'',image:''}));
  assert.ok(errors.videoFile);assert.equal(errors.url,undefined);
  errors=workEditorErrors(work('video',{videoSource:'file',videoFile:'/api/media/works/demo.mp4',image:''}));
  assert.ok(errors.image);
  assert.deepEqual(workEditorErrors(work('webapp',{caseStudy:study})),{});
});
test('error recovery opens its containing disclosure before focusing and respects reduced motion',()=>{
  const previous=global.window;global.window={matchMedia:()=>({matches:true})};
  let focused=false,scrolled;
  const details={tagName:'DETAILS',open:false,parentElement:null};
  const input={parentElement:details,focus(){assert.equal(details.open,true);focused=true;}};
  const field={dataset:{workField:'caseStudy.motion'},parentElement:null,matches:()=>false,querySelector:()=>input,scrollIntoView:value=>scrolled=value};
  try {
    focusWorkError({'caseStudy.motion.poster':'Add poster'},{querySelectorAll:()=>[field]});
    assert.equal(focused,true);assert.equal(scrolled.behavior,'instant');
  } finally {global.window=previous;}
});
test('study preview reserves its tab during the click, waits for save, and closes it if save fails',async()=>{
  const {openStudyPreview}=runtime('lib/work-editor.ts');
  const old=global.window, events=[];
  const tab={opener:{},closed:false,location:{replace:url=>events.push(url)},close:()=>events.push('close')};
  global.window={open:()=>{events.push('open');return tab;},location:{assign:url=>events.push(url)}};
  try {
    await openStudyPreview('case',async()=>{events.push('save');return 8;});
    assert.deepEqual(events,['open','save','/admintgadink/preview/case?revision=8']);assert.equal(tab.opener,null);
    events.length=0;await openStudyPreview('case',async()=>null);assert.deepEqual(events,['open','close']);
    global.window.open=()=>null;events.length=0;
    await openStudyPreview('case',async()=>9);assert.deepEqual(events,['/admintgadink/preview/case?revision=9']);
  } finally {global.window=old;}
});
