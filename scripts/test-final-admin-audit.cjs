const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{load}=require('cheerio');
const {runtime}=require('./cms-script-runtime.cjs'),{componentRuntime}=require('./admin-component-runtime.cjs');
const lib=runtime(),ui=componentRuntime(),{PublicationBar}=ui('components/admin/PublicationBar.tsx');
const work=(id,patch={})=>({id,kind:'webapp',title:id,description:'',image:'',imageAlt:'',url:'https://example.com',published:true,demo:false,artwork:'hub',...patch});
test('pending collection includes removals while ignoring technical timestamps and property order',()=>{
 const old=[work('keep'),work('removed')];
 const summary=lib('lib/admin-overview.ts').summarizeWorks([work('keep',{updatedAt:'2026-11-07T00:00:00Z'})],old);
 assert.equal(summary.changed,true);assert.equal(summary.review.length,0);assert.equal(summary.pending.entries.length,1);assert.equal(summary.pending.entries[0].title,'removed');
 assert.equal(lib('lib/admin-overview.ts').summarizeWorks([work('keep',{updatedAt:'2026-11-07T00:00:00Z'})],[work('keep')]).changed,false);
});
const base={dirty:true,unpublished:false,busy:false,publishing:false,offline:false,failed:false,publishLabel:'Simpan & terbitkan',onPublish(){}};
const render=patch=>load(renderToStaticMarkup(React.createElement(PublicationBar,{...base,...patch})));
test('publication bar shows the action without a redundant change status or scope',()=>{
 const $=render({visibility:{checked:false,onChange(){}},publishLabel:'Simpan tanpa tayang'});
 assert.equal($('.admin-action-label > span[aria-hidden=false]').text(),'Simpan tanpa tayang');
 assert.equal($('input[type=checkbox]:checked').length,0);
 assert.equal($('[role=status], .wm-save-scope').length,0);
});
test('offline and failed saves are explicit and only the main action offers retry',()=>{
 let $=render({offline:true});assert.equal($('button:disabled').length,1);assert.match($('[role=status]').text(),/Tidak ada koneksi/);
 $=render({failed:true,dirty:false});assert.equal($('button').length,1);assert.equal($('.admin-action-label > span[aria-hidden=false]').text(),'Coba lagi');assert.equal($('button:disabled').length,0);
});
const ts=require('typescript'),fs=require('node:fs');
test('manual save observes real connectivity and failed retry without browser storage',async()=>{
 let cursor=0;const cells=[],effects=[],listeners={},unsafeRefs=[];
 const hooks={useRef:v=>{const i=cursor++;return cells[i]||(cells[i]={current:v});},useState:v=>{const i=cursor++;if(!(i in cells))cells[i]=v;return [cells[i],v=>cells[i]=v];},useEffect:fn=>effects.push(fn)};
 const module={exports:{}};const source=ts.transpileModule(fs.readFileSync('components/admin/useManualSave.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',source)(name=>name==='react'?hooks:name==='./AdminChanges'?{useRegisterAdminDirty:ref=>unsafeRefs.push(ref)}:{sameDraftContent:(a,b)=>a===b},module,module.exports);
 const oldWindow=global.window,oldNavigator=Object.getOwnPropertyDescriptor(global,'navigator');
 global.window={addEventListener:(key,fn)=>listeners[key]=fn,removeEventListener:key=>delete listeners[key]};Object.defineProperty(global,'navigator',{configurable:true,value:{onLine:true}});
 const render=()=>{cursor=0;return module.exports.useManualSave({value:'changed',baseline:'saved',save:async()=>false});};
 try{
 let result=render();const cleanups=effects.splice(0).map(fn=>fn());assert.equal(result.unsafe.current,true);
 navigator.onLine=false;listeners.offline();result=render();assert.equal(result.online,false);assert.match(result.status,/Tidak ada koneksi/);
 navigator.onLine=true;listeners.online();result=render();assert.equal(result.online,true);
 await result.retry();result=render();assert.equal(result.failed,true);assert.equal(result.status,'Belum tersimpan');
 cleanups.forEach(cleanup=>cleanup?.());
 }finally{global.window=oldWindow;Object.defineProperty(global,'navigator',oldNavigator);}
});
