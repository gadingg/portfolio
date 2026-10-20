const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function gallery({mobile=true,reduced=false}={}){
 const source=fs.readFileSync('public/assets/js/works.js','utf8');
 const start=source.indexOf('  function setupEditorialGallery(group) {');
 const code=source.slice(start,source.indexOf('  groups.filter',start));
 const listeners={},styles={},classes=new Set();
 let captured=false,timer;
 const list={clientWidth:mobile?360:1200,scrollWidth:2200,scrollLeft:0,
  style:{setProperty:(key,value)=>styles[key]=value},
  classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)},
  setAttribute(key,value){this[key]=value;},
  querySelectorAll(selector){return selector==='img'?images:cards;},
  addEventListener(name,fn){listeners[name]=fn;},
  contains:target=>target===list,
  getBoundingClientRect:()=>({left:0}),
  setPointerCapture(){captured=true;},hasPointerCapture:()=>captured,releasePointerCapture(){captured=false;},
  scrollTo(value){this.scrollLeft=value.left;this.behavior=value.behavior;},
 };
 const images=[{naturalWidth:800,naturalHeight:1000,complete:true},{naturalWidth:1400,naturalHeight:1000,complete:true}];
 const ratios=[];
 const cards=images.map((img,i)=>({style:{setProperty:(key,value)=>ratios[i]=value},querySelector:()=>img,getBoundingClientRect:()=>({left:i*320-list.scrollLeft})}));
 const hint={id:'visual-gallery-hint'},group={querySelector:q=>q==='.gallery-hint'?hint:list};
 vm.runInNewContext(code+';setupEditorialGallery(group);',{
  group,window:{addEventListener(name,fn){listeners[name]=fn;}},reduced:{matches:reduced},matchMedia:()=>({matches:mobile}),
  ResizeObserver:class{observe(){}},setTimeout(fn){timer=fn;return 1;},clearTimeout(){timer=null;}
 });
 const event=extra=>({target:list,pointerType:'mouse',button:0,buttons:1,pointerId:1,clientX:200,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra});
 return {list,hint,styles,ratios,classes,listeners,event,flush:()=>timer?.()};
}
test('design showcase is a named focusable rail without an extra helper hint',()=>{
 const g=gallery();assert.equal(g.list.tabIndex,0);assert.equal(g.list['aria-label'],'Visual Design gallery');
 assert.equal(g.list['aria-describedby'],undefined);
});
test('desktop keyboard scrolling respects reduced motion and rail boundaries',()=>{
 const g=gallery({mobile:false,reduced:true});
 g.listeners.keydown(g.event({target:g.list,key:'ArrowRight'}));assert.equal(g.list.scrollLeft,320);assert.equal(g.list.behavior,'instant');
 g.listeners.keydown(g.event({target:g.list,key:'End'}));assert.equal(g.list.scrollLeft,1000);
 g.listeners.keydown(g.event({target:g.list,key:'Home'}));assert.equal(g.list.scrollLeft,0);
});
test('mouse drag scrolls without opening lightbox; subsequent deliberate click remains available',()=>{
 const g=gallery();g.listeners.pointerdown(g.event());
 g.listeners.pointermove(g.event({clientX:120}));assert.equal(g.list.scrollLeft,80);assert.ok(g.classes.has('is-dragging'));
 g.listeners.pointerup(g.event({buttons:0}));assert.equal(g.classes.has('is-dragging'),false);
 const click=g.event();g.listeners.click(click);assert.equal(click.prevented,true);assert.equal(click.stopped,true);
 g.listeners.pointerdown(g.event());g.listeners.pointerup(g.event({buttons:0}));
 const tap=g.event();g.listeners.click(tap);assert.equal(tap.prevented,undefined);
});
test('small mouse movements and native touch swipes do not suppress artwork clicks',()=>{
 const g=gallery();g.listeners.pointerdown(g.event());g.listeners.pointermove(g.event({clientX:197}));g.listeners.pointerup(g.event());
 const click=g.event();g.listeners.click(click);assert.equal(click.prevented,undefined);assert.equal(g.list.scrollLeft,0);
 g.listeners.pointerdown(g.event({pointerType:'touch'}));g.listeners.pointermove(g.event({pointerType:'touch',clientX:50}));assert.equal(g.list.scrollLeft,0);
 const key=g.event({target:{},key:'ArrowRight'});g.listeners.keydown(key);assert.equal(key.prevented,undefined);
});
