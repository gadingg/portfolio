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
    assert.equal($('.editor-tabs button[aria-pressed="true"]').length,1);
    const panels=$('fieldset.work-editor-fields > div');
    const basic=panels.not('[hidden]');
    const story=panels.has('.work-editor-story');
    const category=$('select').has('option[value="webapp"]');
    assert.equal(basic.length,1);
    assert.equal(basic.find('[data-work-field=title]').length,1);
    assert.equal(category.length,1);
    assert.equal(category.closest('details:not([open])').length,1);
    assert.equal(category.closest('fieldset > div').is('[hidden]'),true);
    assert.equal(basic.find('input[type=checkbox],select').length,0);
    if(kind==='webapp') {
      assert.equal(basic.find('textarea[data-work-field=description]').length,1);
      assert.equal(story.is('[hidden]'),true);
      assert.deepEqual(story.find('textarea[data-work-field]').map((_,el)=>$(el).attr('data-work-field')).get(),
        ['caseStudy.problem','caseStudy.solution','caseStudy.impact']);
      assert.equal(basic.find('video').length,0);
    }
    if(kind==='design') {
      assert.equal(basic.find('textarea').length,0);
      assert.equal(basic.find('section[aria-label="Gambar desain"] button').filter((_,button)=>$(button).text().trim()==='Ganti gambar').length,1);
    }
    if(kind==='video') {
      assert.equal(basic.find('video').length,1);
      assert.equal(basic.find('input[type=radio]').length,2);
    }
  }
});
test('video editor renders exactly its active source and keeps raw file links inside the media picker',()=>{
  let $=render(work('video',{videoSource:'instagram',url:'https://www.instagram.com/reel/real/',videoFile:'/api/media/works/old.mp4'}));
  assert.equal($('video').length,0);assert.equal($('[data-work-field=url]').length,1);
  $=render(work('video',{videoSource:'file',videoFile:'/api/media/works/active.mp4'}));
  assert.equal($('video').length,1);assert.equal($('[data-work-field=url]').length,0);
  assert.equal($('.cms-picker-link').closest('dialog').length,1);
  assert.equal($('button').filter((_,element)=>$(element).text()==='Jadikan thumbnail').length,1);
});
test('disabled video demos expose only their enable control, preserving configuration for reactivation',()=>{
  const {CaseMotionEditor}=runtime('components/admin/CaseMotionEditor.tsx');
  const value={...study,motion:{enabled:false,title:'Keep',video:'/assets/demo.mp4',poster:'/assets/image.png'}};
  let $=html(renderToStaticMarkup(React.createElement(CaseMotionEditor,{study:value,disabled:false,onChange(){},onBusyChange(){}})));
  assert.equal($('input[type=checkbox]').length,1);assert.equal($('input:not([type=checkbox])').length,0);assert.equal($('video').length,0);
  $=html(renderToStaticMarkup(React.createElement(CaseMotionEditor,{study:{...value,motion:{...value.motion,enabled:true}},disabled:false,onChange(){},onBusyChange(){}})));
  assert.equal($('video').length,1);assert.equal(value.motion.title,'Keep');
});
test('editor tabs expose the relevant fields and category changes delegate to the confirmation handler',()=>{
  const item=work('webapp',{caseStudy:study}),patches=[],kinds=[];
  let tab, pendingEffects=[];
  const {WorkEditor:InteractiveEditor}=componentRuntime({react:{
    ...React,
    useState(initial){tab??=initial;return [tab,value=>{tab=value;}];},
    useRef:initial=>({current:initial}),
    useEffect:effect=>pendingEffects.push(effect),
  }})('components/admin/WorkEditor.tsx');
  const editorProps={...props(item),onChange:patch=>patches.push(patch),onKindChange:async kind=>kinds.push(kind)};
  function render(errors={}){
    pendingEffects=[];
    return InteractiveEditor({...editorProps,errors});
  }
  function nodes(element) {
    if(!element||typeof element!=='object')return [];
    return [element,...React.Children.toArray(element.props?.children).flatMap(nodes)];
  }
  const field=(tree,path)=>nodes(tree).find(el=>el.props?.['data-work-field']===path);
  const activePanel=tree=>nodes(tree).find(el=>el.type==='fieldset').props.children.find(el=>el?.props?.hidden===false);
  function selectTab(tree,label){
    nodes(tree).find(el=>el.type==='button'&&el.props.children===label).props.onClick();
    return render();
  }
  let tree=render();
  field(activePanel(tree),'title').props.onChange({target:{value:'New title'}});
  tree=selectTab(tree,'Studi kasus');
  field(activePanel(tree),'caseStudy.problem').props.onChange({target:{value:'New problem'}});
  tree=selectTab(tree,'Galeri & link');
  nodes(activePanel(tree)).find(el=>el.type==='select').props.onChange({target:{value:'design'}});
  assert.deepEqual(patches[0],{title:'New title'});
  assert.equal(patches[1].caseStudy.problem,'New problem');assert.equal(patches[1].caseStudy.solution,'Solution');
  assert.deepEqual(kinds,['design']);assert.equal(item.title,'Project');
  const errors={'caseStudy.problem':'Lengkapi Problem'};
  render(errors);
  pendingEffects.forEach(effect=>effect());
  assert.equal(field(activePanel(render(errors)),'caseStudy.problem').props['aria-invalid'],true);
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
