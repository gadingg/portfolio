const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {runtime}=require('./cms-script-runtime.cjs');
function preview(thumbnails=[]){
 const created=[],timers=new Map();let clock=0;
 function node(tag,cls='',text=''){
  const classes=new Set(cls.split(' ')),listeners=new Map();
  const el={tag,textContent:text,children:[],attrs:{},naturalWidth:0,naturalHeight:0,complete:false,style:{values:{},setProperty(key,value){this.values[key]=value;}},
   classList:{add(...names){names.forEach(name=>classes.add(name));},contains:name=>classes.has(name)},
   append(...children){for(const child of children){child.parentElement=el;el.children.push(child);}},
   replaceChildren(...children){el.children.forEach(child=>child.parentElement=null);el.children=[];el.append(...children);},
   setAttribute(key,value){el.attrs[key]=value;},getAttribute:key=>el.attrs[key],
   removeAttribute(key){delete el[key];delete el.attrs[key];},
   addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);},
   removeEventListener(name,fn){listeners.get(name)?.delete(fn);},
   async emit(name){await Promise.all([...(listeners.get(name)||[])].map(fn=>fn()));},
   remove(){if(el.parentElement)el.parentElement.children=el.parentElement.children.filter(child=>child!==el);el.parentElement=null;},
   contains(target){return target===el||el.children.some(child=>child.contains(target));},
   querySelector(selector){return el.children.flatMap(child=>[child,...descendants(child)]).find(child=>child.classList.contains(selector.slice(1)))||null;},
   focus(){el.focused=true;},decode:async()=>{},
  };created.push(el);return el;
 }
 function descendants(el){return el.children.flatMap(child=>[child,...descendants(child)]);}
 const body=node('div'),bottom=node('div'),title=node('h2');
 const source=fs.readFileSync('public/assets/js/works.js','utf8');
 const code=source.slice(source.indexOf('  function showDesign('),source.indexOf("  modal.addEventListener('keydown'"));
 const context=vm.createContext({setupImageZoom:()=>({controls:node('div'),enable(){},destroy(){}}),shell:{querySelectorAll:()=>thumbnails},body,bottom,title,node,icon:()=>node('svg'),document:{activeElement:null},safeURL:value=>value?.startsWith('/')?value:'',setTimeout:fn=>{timers.set(++clock,fn);return clock;},clearTimeout:id=>timers.delete(id)});
 vm.runInContext("let imageItems=[{id:'one',title:'One',image:'/api/media/works/one.png'},{id:'two',title:'Two',image:'/two.jpg'}],imageIndex=0,cancelImage=()=>{},imageRatios=new Map();"+code,context);
 return {body,bottom,title,created,timers,open:index=>vm.runInContext(`showDesign(${index})`,context),cancel:()=>vm.runInContext('cancelImage()',context),frame:()=>body.children[0],image:()=>body.children[0].children.find(el=>el.tag==='img')};
}
test('preview has one stable frame, responsive eager image, and reveals only after decode',async()=>{
 const p=preview();p.open(0);const frame=p.frame(),image=p.image();
 assert.equal(p.body.children.length,1);assert.equal(frame.children.length,2);assert.equal(frame.attrs['aria-busy'],'true');
 assert.equal(image.loading,'eager');assert.equal(image.fetchPriority,'high');assert.match(image.src,/\?w=960$/);assert.match(image.srcset,/1280w/);assert.match(image.sizes,/100vw/);
 let decode;image.decode=()=>new Promise(resolve=>decode=resolve);image.naturalWidth=1080;image.naturalHeight=1350;
 const loading=image.emit('load');assert.equal(frame.classList.contains('is-ready'),false);decode();await loading;
 assert.equal(p.frame(),frame);assert.equal(frame.style.values['--preview-ratio'],'0.8');assert.equal(frame.classList.contains('is-ready'),true);assert.equal(frame.attrs['aria-busy'],'false');assert.equal(frame.children.length,1);assert.equal(p.timers.size,0);
});
test('failure and timeout offer retry inside the same frame, without retrying automatically',async()=>{
 const p=preview();p.open(0);const frame=p.frame();await p.image().emit('error');
 assert.equal(frame.attrs['aria-busy'],'false');const feedback=frame.children[1],retry=feedback.children.find(el=>el.tag==='button');
 assert.equal(retry.textContent,'Try again');assert.equal(feedback.children[0].attrs.role,'alert');assert.equal(p.created.filter(el=>el.tag==='img').length,1);
 await retry.emit('click');assert.notEqual(p.frame(),frame);assert.equal(p.frame().focused,true);assert.equal(p.created.filter(el=>el.tag==='img').length,2);
 [...p.timers.values()][0]();assert.equal(p.frame().attrs['aria-busy'],'false');assert.ok(p.frame().children[1].children.find(el=>el.tag==='button'));
});
test('rapid navigation and closing discard stale decode completion and image requests',async()=>{
 const p=preview();p.open(0);const first=p.image(),oldFrame=p.frame();let decode;
 first.decode=()=>new Promise(resolve=>decode=resolve);first.naturalWidth=1080;const loading=first.emit('load');
 p.open(1);const current=p.frame();decode();await loading;
 assert.notEqual(current,oldFrame);assert.equal(current.classList.contains('is-ready'),false);assert.equal(p.title.textContent,'Two');assert.equal(first.src,undefined);
 assert.match(p.image().src,/^\/_next\/image\?/);assert.equal(p.bottom.children[0].textContent,'2 / 2');
 const image=p.image();p.cancel();assert.equal(p.timers.size,0);assert.equal(image.src,undefined);image.naturalWidth=100;await image.emit('load');assert.equal(current.classList.contains('is-ready'),false);
});

test('image cache deduplicates in-flight work, retries errors, and respects memory and expiry bounds',async()=>{
 const {createImageCache}=runtime()('lib/media-image-cache.ts');let time=0,calls=0,release;
 const cache=createImageCache({maxBytes:4,maxEntries:2,ttl:10,now:()=>time});
 const load=async()=>{calls++;return {bytes:Uint8Array.of(1,2),type:'image/webp'};};
 const a=cache('a',()=>new Promise(resolve=>release=()=>{calls++;resolve({bytes:Uint8Array.of(1,2),type:'image/webp'});}));
 const again=cache('a',load);release();assert.equal((await a).etag,(await again).etag);assert.equal(calls,1);
 await cache('b',load);await cache('a',load);await cache('c',load);assert.equal(calls,3);await cache('b',load);assert.equal(calls,4);
 time=20;await cache('b',load);assert.equal(calls,5);
 await assert.rejects(cache('error',async()=>{throw Error('offline');}));assert.equal((await cache('error',load)).type,'image/webp');
});
test('cached and conditional image responses recheck publication access before returning bytes or 304',async()=>{
 let allowed=true,admin=false,downloads=0,missing=false;
 const original=await require('sharp')({create:{width:40,height:30,channels:3,background:'#ff5a1f'}}).png().toBuffer();
 const handler=runtime({'@/lib/auth/session':{verifyAdminSession:async()=>admin},'@/lib/cms-media':{cmsMediaBucket:'private',publishedMedia:async()=>allowed},'@/lib/supabase/admin':{createAdminClient:()=>({storage:{from:()=>({download:async()=>{downloads++;return missing?{error:Error('missing')}:{data:new Blob([original],{type:'image/png'})};}})}})}})('app/api/media/[...path]/route.ts');
 const params={params:Promise.resolve({path:['works','1792212542785-50bd4dd1-2833-486d-ac27-bae92c807fd5.png']})};
 const request=(etag,width=640)=>({nextUrl:new URL(`https://portfolio.test/api/media/image.png?w=${width}`),headers:new Headers(etag?{'if-none-match':etag}:{})});
 const first=await handler.GET(request(),params);assert.equal(first.status,200);assert.equal(first.headers.get('cache-control'),'private, no-cache');assert.equal(first.headers.get('vary'),'Cookie');
 const etag=first.headers.get('etag');assert.ok(etag);assert.equal((await handler.GET(request(etag),params)).status,304);assert.equal(downloads,1);
 allowed=false;const denied=await handler.GET(request(etag),params);assert.equal(denied.status,404);assert.equal(denied.headers.get('cache-control'),'no-store');assert.equal(downloads,1);
 admin=true;assert.equal((await handler.GET(request(etag),params)).status,304);
 missing=true;assert.equal((await handler.GET(request(null,960),params)).status,404);missing=false;assert.equal((await handler.GET(request(null,960),params)).status,200);assert.equal(downloads,3);
});

test('frame starts with the clicked artwork ratio and follows the decoded image for portrait and landscape',async()=>{
 const p=preview([{dataset:{workId:'one'},querySelector:()=>({naturalWidth:1080,naturalHeight:1350})}]);
 p.open(0);assert.equal(p.frame().style.values['--preview-ratio'],'0.8');
 p.image().naturalWidth=1080;p.image().naturalHeight=1350;await p.image().emit('load');
 assert.equal(p.frame().style.values['--preview-ratio'],'0.8');
 p.open(1);p.image().naturalWidth=1600;p.image().naturalHeight=900;await p.image().emit('load');
 assert.equal(Number(p.frame().style.values['--preview-ratio']),1600/900);
 p.open(0);assert.equal(p.frame().style.values['--preview-ratio'],'0.8');
});
