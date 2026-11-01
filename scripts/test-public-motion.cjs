const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('public/assets/js/capabilities-motion.js','utf8');
function fixture({reduced=false,preview=false,gsapAvailable=true,kinds=['strategy','work']}={}){
 const listeners=new Map(),pageEvents=new Map(),calls=[],observers=[],timelines=[];let cleanup,reverted=0;
 const card=(kind='work')=>({kind,isConnected:true,parts:new Map(),
  matches(selector){return selector==='.capability-card'?!['work','about'].includes(kind):selector==='.about-layout'?kind==='about':selector===`.capability-${kind}`;},
  querySelectorAll(selector){if(!this.parts.has(selector))this.parts.set(selector,[{selector,style:{}}]);return this.parts.get(selector);},
  closest(){return this;},contains(target){return target===this;}
 });
 const cards=kinds.map(card),[first,project]=cards;
 const gsap={
  matchMedia:()=>({add(query,fn){assert.match(query,/no-preference/);if(!reduced)cleanup=fn();},revert(){cleanup?.();}}),
  context:()=>({add:fn=>fn(),revert:()=>reverted++}),
  from:(target,options)=>calls.push({target,options}),set(){},
  timeline(options){const tl={options,steps:[],active:true,from(target,vars,at){this.steps.push({method:'from',target,vars,at});return this;},to(target,vars,at){this.steps.push({method:'to',target,vars,at});return this;},fromTo(target,from,vars,at){this.steps.push({method:'fromTo',target,from,vars,at});return this;},isActive(){return this.active;},kill(){this.killed=true;this.active=false;},complete(){this.active=false;options.onComplete();}};timelines.push(tl);return tl;}
 };
 class Observer{constructor(callback,options){this.callback=callback;this.options=options;this.items=new Set();observers.push(this);}observe(item){this.items.add(item);}unobserve(item){this.items.delete(item);}disconnect(){this.items.clear();}}
 vm.runInNewContext(source,{window:{gsap:gsapAvailable?gsap:undefined,IntersectionObserver:Observer,addEventListener:(name,fn)=>pageEvents.set(name,fn)},IntersectionObserver:Observer,document:{body:{dataset:preview?{cmsPreview:'true'}:{}},querySelectorAll:()=>cards,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)}});
 return {first,project,cards,card,observers,listeners,calls,timelines,pageEvents,get reverted(){return reverted;}};
}
const enter=(observer,target,ratio=.6)=>observer.callback([{target,isIntersecting:true,intersectionRatio:ratio}]);
test('capability scenes wait until half visible and each receives a finite, distinct sequence',()=>{
 const f=fixture({kinds:['strategy','brand','web','ai']}),observer=f.observers[0];
 enter(observer,f.first,.2);assert.equal(f.timelines.length,0);
 for(const card of f.cards){enter(observer,card);enter(observer,card);}
 assert.equal(f.timelines.length,4);assert.equal(observer.items.size,0);
 const selectors=f.timelines.map(tl=>tl.steps.map(step=>step.target[0].selector));
 assert.ok(selectors[0].includes('.strategy-cursor'));assert.ok(selectors[1].includes('.brand-palette i'));assert.ok(selectors[2].includes('.browser-progress'));assert.ok(selectors[3].includes('.ai-packet'));
 for(const tl of f.timelines){assert.ok(tl.steps.length>=4);assert.ok(tl.steps.every(step=>(step.vars.repeat||0)<=1));assert.ok(Math.max(...tl.steps.map(step=>step.at+(step.vars.duration||.7)*(1+(step.vars.repeat||0))))>=1.5);}
});
test('About assembles real-work fragments while Works card caption behavior stays small',()=>{
 const f=fixture({kinds:['about','work']}),observer=f.observers[0];enter(observer,f.first,.2);assert.equal(f.timelines.length,0);enter(observer,f.first,.4);
 assert.ok(f.timelines[0].steps.some(step=>step.target[0].selector==='.about-work-app'));
 enter(observer,f.project,.2);assert.equal(f.calls.length,1);assert.equal(f.calls[0].options.duration,.4);
});
test('mouse hover replays a completed visible scene without stacking or hijacking touch',()=>{
 const f=fixture(),observer=f.observers[0],hover=event=>f.listeners.get('pointerover')({target:f.first,relatedTarget:null,...event});
 hover({pointerType:'mouse'});assert.equal(f.timelines.length,0);enter(observer,f.first);hover({pointerType:'mouse'});assert.equal(f.timelines.length,1);
 f.timelines[0].complete();hover({pointerType:'touch'});assert.equal(f.timelines.length,1);hover({pointerType:'mouse',relatedTarget:f.first});assert.equal(f.timelines.length,1);
 hover({pointerType:'mouse'});assert.equal(f.timelines.length,2);assert.equal(f.timelines[0].killed,true);
});
test('replaced cards disconnect while new Works cards remain observed',()=>{
 const f=fixture(),observer=f.observers[0];f.project.isConnected=false;f.cards.splice(1,1,f.card());f.listeners.get('portfolio:works-ready')();assert.equal(observer.items.has(f.project),false);assert.equal(observer.items.size,2);
});
test('reduced motion, CMS preview and missing GSAP keep all content static and visible',()=>{
 for(const options of [{reduced:true},{preview:true},{gsapAvailable:false}]){const f=fixture(options);assert.equal(f.observers.length,0);assert.equal(f.calls.length,0);assert.equal(f.timelines.length,0);}
});
test('exit removes observers and replay listeners; bfcache retains its observer',()=>{
 const f=fixture();f.pageEvents.get('pagehide')({persisted:true});assert.equal(f.reverted,0);f.pageEvents.get('pagehide')({persisted:false});assert.equal(f.observers[0].items.size,0);assert.equal(f.listeners.size,0);assert.equal(f.reverted,1);
});
