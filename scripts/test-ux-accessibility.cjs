const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const React=require('react'),{load:html}=require('cheerio'),{runtime}=require('./cms-script-runtime.cjs');

function harness(file,mocks={}){
  let cursor=0;const cells=[];
  const hooks={...React,useState(initial){const i=cursor++;if(!(i in cells))cells[i]=typeof initial==='function'?initial():initial;return [cells[i],value=>{cells[i]=typeof value==='function'?value(cells[i]):value;}];},
    useRef(initial){const i=cursor++;return cells[i]??(cells[i]={current:initial});},useId:()=> 'qa-dialog',useCallback:fn=>fn,useEffect(){}};
  const module={exports:{}};
  const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',source)(name=>name==='react'?hooks:name==='lucide-react'?new Proxy({},{get:()=>()=>null}):name in mocks?mocks[name]:name.endsWith('.css')?{}:require(name),module,module.exports);
  return {module:module.exports,render(fn){cursor=0;return fn();}};
}
function nodes(element,predicate){
  if(!element||typeof element!=='object')return [];
  return [...(predicate(element)?[element]:[]),...React.Children.toArray(element.props?.children).flatMap(child=>nodes(child,predicate))];
}
const find=(tree,predicate)=>nodes(tree,predicate)[0];

test('trash confirmation resolves only after cancellation or explicit confirmation and restores focus',async()=>{
  const original=global.document;let focused=0;global.document={activeElement:{isConnected:true,focus(){focused++;}}};
  try{
    const h=harness('components/admin/ConfirmDialog.tsx');
    let api=h.render(()=>h.module.useConfirm()),settled=false;
    const decision=api.ask('Karya akan hilang dari website. Pulihkan dalam 72 jam.','Ya, Pindahkan ke Sampah',true).then(value=>{settled=true;return value;});
    await Promise.resolve();assert.equal(settled,false);
    api=h.render(()=>h.module.useConfirm());
    assert.match(find(api.confirmation,el=>el.type==='button'&&el.props.className)?.props.className,/cms-confirm-danger/);
    let prevented=false;api.confirmation.props.onCancel({preventDefault(){prevented=true;}});
    assert.equal(await decision,false);assert.equal(prevented,true);assert.equal(focused,1);
    api=h.render(()=>h.module.useConfirm());
    const accepted=api.ask('Pindahkan?','Ya, Pindahkan ke Sampah',true);
    api=h.render(()=>h.module.useConfirm());
    find(api.confirmation,el=>el.type==='button'&&el.props.className).props.onClick();
    assert.equal(await accepted,true);
  }finally{global.document=original;}
});

test('cover uploads expose a pending skeleton then a toast; repeated uploads still notify and invalid files never transfer',async()=>{
  const original=global.fetch,notices=[],uploaded=[],busy=[];
  const h=harness('components/admin/FileDrop.tsx',{
    './AdminSkeleton':{AdminSkeleton:()=>null},'./AdminToasts':{useAdminToast:()=> (message,options)=>notices.push({message,options})},
    '@/lib/work-images':{},'@/lib/video-upload':{}
  });
  let complete,calls=0;global.fetch=()=>{calls++;return new Promise(resolve=>{complete=()=>resolve({ok:true,json:async()=>({url:'/api/media/cover.png',filename:'cover.png',type:'image/png'})});});};
  const props={onUploaded:files=>uploaded.push(...files),onBusyChange:value=>busy.push(value)};
  const render=()=>h.render(()=>h.module.FileDrop(props));
  try{
    let tree=render();const upload=find(tree,el=>el.type==='input'&&el.props.type==='file').props.onChange;
    const file=new File(['real image fixture'],'cover.png',{type:'image/png'});
    const pending=upload({target:{files:[file]}});tree=render();
    assert.ok(find(tree,el=>el.type?.name==='UploadFeedback'));
    assert.equal(uploaded.length,0);assert.deepEqual(busy,[true]);
    complete();await pending;tree=render();
    assert.equal(uploaded.length,1);assert.equal(notices.length,1);assert.deepEqual(busy,[true,false]);
    assert.equal(find(tree,el=>el.type?.name==='UploadFeedback'),undefined);
    const again=find(tree,el=>el.type==='input'&&el.props.type==='file').props.onChange({target:{files:[file]}});
    complete();await again;assert.equal(notices.length,2);
    tree=render();
    await find(tree,el=>el.type==='input'&&el.props.type==='file').props.onChange({target:{files:[new File([new Uint8Array(4*1024*1024+1)],'large.png',{type:'image/png'})]}});
    assert.equal(calls,2);assert.equal(notices.at(-1).options.tone,'error');
    assert.match(notices.at(-1).message,/Maksimal 4 MB/);
  }finally{global.fetch=original;}
});

test('login password visibility preserves the typed value and authentication has a pending spinner',async()=>{
  const original=global.fetch;let complete;
  const h=harness('components/admin/AdminLoginForm.tsx',{'next/navigation':{useRouter:()=>({replace(){},refresh(){}})}});
  const render=()=>h.render(()=>h.module.AdminLoginForm());
  try{
    let tree=render();find(tree,el=>el.props?.id==='admin-password').props.onChange({target:{value:'fixture-only'}});
    find(tree,el=>el.props?.className==='admin-password-toggle').props.onClick();tree=render();
    assert.equal(find(tree,el=>el.props?.id==='admin-password').props.type,'text');
    assert.equal(find(tree,el=>el.props?.id==='admin-password').props.value,'fixture-only');
    global.fetch=()=>new Promise(resolve=>{complete=()=>resolve({ok:false,json:async()=>({error:'Coba lagi.'})});});
    const pending=find(tree,el=>el.type==='form').props.onSubmit({preventDefault(){}});
    tree=render();assert.ok(find(tree,el=>el.props?.className==='admin-login-spinner'));
    assert.equal(find(tree,el=>el.props?.type==='submit').props.disabled,true);
    complete();await pending;tree=render();
    assert.equal(find(tree,el=>el.props?.type==='submit').props.disabled,false);
    assert.equal(find(tree,el=>el.props?.role==='alert').props.children,'Coba lagi.');
  }finally{global.fetch=original;}
});

test('stored visual case summaries precede visual documentation, preserve evidence and remain idempotent',()=>{
  const {editorialCaseLayout}=runtime()('lib/case-layout.ts');
  const layout={html:'<main><header class="case-intro"><h1>Real project</h1></header><figure class="case-cover-art"><img src="/real-cover.webp" alt="Real cover"></figure><div class="case-narrative"><p>Evidence remains.</p></div></main>',css:'.custom{color:red}'};
  const summary={problem:'Actual problem',solution:'Actual approach',impact:'Actual result'};
  const result=editorialCaseLayout(layout,summary),$=html(result.html);
  assert.deepEqual($('.case-summary-step').map((i,el)=>$(el).find('h2,h3').text()).get(),['Problem','Approach','Result']);
  assert.equal($('.case-intro').next().hasClass('case-overview'),true);
  assert.equal($('.case-overview').next().hasClass('case-cover-art'),true);
  assert.equal($('.case-narrative p').text(),'Evidence remains.');
  assert.equal(result.css,layout.css);assert.equal(layout.html.includes('case-overview'),false);
  assert.equal(html(editorialCaseLayout(result,summary).html)('.case-overview').length,1);
});

test('CMS homepage enhancements use the owner email once and preserve collection structure and copy',async()=>{
  const db=runtime({'./cms':{}})('lib/db/site.ts'),site=await db.initialSite();site.cv.email='owner@example.com';
  const result=await db.renderHomepage(site),$=html(result);
  assert.equal($('[data-work-filters]').length,1);assert.equal($('#portfolio-results').length,1);
  assert.equal($('#portfolio-results>[data-work-kind]').length,3);
  assert.equal($('[data-filter-kind]').length,4);assert.equal($('[data-copy-email]').attr('data-email'),'owner@example.com');
  assert.equal($('[data-copy-email]').text().trim(),'Salin Email');
  site.layout={html:result,css:''};
  const again=html(await db.renderHomepage(site));
  assert.equal(again('[data-work-filters]').length,1);assert.equal(again('#portfolio-results').length,1);assert.equal(again('[data-copy-email]').length,1);
});

test('secondary text, process numbers and destructive labels meet AA contrast',()=>{
  const luminance=hex=>hex.match(/\w\w/g).map(value=>parseInt(value,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
  for(const [fg,bg] of [['a1a1aa','0d0d0d'],['b6b8ae','141613'],['ffffff','b91c1c'],['060706','ff5a1f']]){
    const [light,dark]=[luminance(fg),luminance(bg)].sort((a,b)=>b-a);
    assert.ok((light+.05)/(dark+.05)>=4.5,`${fg} on ${bg}`);
  }
});
