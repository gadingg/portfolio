const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function zoom(){
 const nodes=[];
 function node(tag,cls='',text=''){
  const listeners=new Map(),classes=new Set(cls.split(' ')),captured=new Set();
  const el={tag,textContent:text,style:{},attrs:{},children:[],
   classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);},contains:name=>classes.has(name)},
   append(...children){el.children.push(...children);},setAttribute(name,value){el.attrs[name]=value;},
   addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);},
   removeEventListener(name,fn){listeners.get(name)?.delete(fn);},
   emit(name,values={}){const event={target:el,pointerType:'touch',button:0,clientX:100,clientY:125,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;},...values};[...(listeners.get(name)||[])].forEach(fn=>fn(event));return event;},
   setPointerCapture:id=>captured.add(id),hasPointerCapture:id=>captured.has(id),releasePointerCapture:id=>captured.delete(id),
   getBoundingClientRect:()=>({left:0,top:0,width:200,height:250}),
   count:()=>[...listeners.values()].reduce((total,list)=>total+list.size,0),captured,
  };nodes.push(el);return el;
 }
 const frame=node('div'),artwork=node('img'),window=node('window');let resize,disconnected=false;
 const source=fs.readFileSync('public/assets/js/works.js','utf8'),code=source.slice(source.indexOf('  function setupImageZoom('),source.indexOf('  function showDesign('));
 const setup=vm.runInNewContext(code+';setupImageZoom',{node,icon:()=>node('svg'),window,ResizeObserver:class{constructor(fn){resize=fn;}observe(){}disconnect(){disconnected=true;}}});
 const controller=setup(frame,artwork),buttons=controller.controls.children;
 const transform=()=>artwork.style.transform.match(/translate3d\(([-\d.]+)px,([-\d.]+)px,0\) scale\(([-\d.]+)\)/).slice(1).map(Number);
 return {frame,artwork,window,controller,buttons,transform,resize:()=>resize(),disconnected:()=>disconnected};
}
test('zoom waits for decode, supports bounded buttons, and reset restores the image exactly',()=>{
 const z=zoom();assert.ok(z.buttons.every(button=>button.disabled));z.controller.enable();assert.equal(z.frame.tabIndex,0);assert.equal(z.artwork.draggable,false);
 z.buttons[2].emit('click');assert.deepEqual(z.transform(),[0,0,1.5]);assert.equal(z.buttons[1].textContent,'150%');
 for(let i=0;i<20;i++)z.buttons[2].emit('click');assert.equal(z.transform()[2],4);assert.equal(z.buttons[2].disabled,true);
 z.buttons[1].emit('click');assert.deepEqual(z.transform(),[0,0,1]);assert.equal(z.buttons[0].disabled,true);assert.equal(z.buttons[1].disabled,true);
});
test('two-pointer pinch zooms both ways, anchors to the gesture, and clamps single-pointer panning',()=>{
 const z=zoom();z.controller.enable();
 z.frame.emit('pointerdown',{pointerId:1,clientX:50});z.frame.emit('pointerdown',{pointerId:2,clientX:150});
 z.frame.emit('pointermove',{pointerId:2,clientX:250});assert.deepEqual(z.transform(),[50,0,2]);
 z.frame.emit('pointermove',{pointerId:2,clientX:150});assert.deepEqual(z.transform(),[0,0,1]);
 z.frame.emit('pointermove',{pointerId:2,clientX:250});z.frame.emit('pointerup',{pointerId:2});
 z.frame.emit('pointermove',{pointerId:1,clientX:1000,clientY:1000});assert.deepEqual(z.transform(),[100,125,2]);
 z.frame.emit('pointermove',{pointerId:1,clientX:990,clientY:990});assert.deepEqual(z.transform(),[90,115,2]);
 z.frame.emit('pointercancel',{pointerId:1});assert.equal(z.frame.captured.size,0);assert.equal(z.frame.classList.contains('is-dragging'),false);
});
test('trackpad pinch is local, normal scrolling and browser keyboard zoom remain available',()=>{
 const z=zoom();z.controller.enable();
 assert.equal(z.frame.emit('wheel',{deltaY:-70}).prevented,undefined);
 assert.equal(z.frame.emit('wheel',{deltaY:-70,ctrlKey:true}).prevented,true);assert.ok(z.transform()[2]>1);
 assert.equal(z.frame.emit('keydown',{key:'+',ctrlKey:true}).prevented,undefined);
 const key=z.frame.emit('keydown',{key:'ArrowRight'});assert.equal(key.stopped,true);assert.ok(z.transform()[0]<0);
 z.frame.emit('keydown',{key:'0'});assert.deepEqual(z.transform(),[0,0,1]);
 z.frame.emit('dblclick');assert.equal(z.transform()[2],2);z.frame.emit('dblclick');assert.equal(z.transform()[2],1);
});
test('pointer interruption, resizing, and destroy release captures and remove every listener',()=>{
 const z=zoom();z.controller.enable();z.buttons[2].emit('click');z.frame.emit('pointerdown',{pointerId:1});
 z.window.emit('blur');assert.equal(z.frame.captured.size,0);
 z.frame.emit('pointerdown',{pointerId:2});z.resize();assert.equal(z.frame.captured.size,0);
 z.frame.emit('pointerdown',{pointerId:3});z.controller.destroy();assert.equal(z.frame.captured.size,0);assert.equal(z.frame.count(),0);assert.equal(z.window.count(),0);assert.ok(z.buttons.every(button=>button.count()===0));assert.equal(z.disconnected(),true);
 const before=z.artwork.style.transform;z.frame.emit('pointermove',{pointerId:3,clientX:300});assert.equal(z.artwork.style.transform,before);
 const next=zoom();next.controller.enable();assert.deepEqual(next.transform(),[0,0,1]);
});
