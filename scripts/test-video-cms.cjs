const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const {runtime}=require('./cms-script-runtime.cjs');
const {NextRequest,NextResponse}=require('next/server');
const path='video-staging/123-00000000-0000-0000-0000-000000000000.mp4';
const request=body=>new NextRequest('https://portfolio.test/api/admin/media/video',{method:'POST',headers:{origin:'https://portfolio.test','Content-Type':'application/json'},body:JSON.stringify(body)});
test('file-only video supports drafts and requires a thumbnail when published',()=>{
 const schema=runtime()('lib/works.ts');const item={id:'video',kind:'video',title:'Video',url:'',image:'',description:'',imageAlt:'',videoFile:'/api/media/works/video.mp4',published:false,demo:false};
 assert.equal(schema.WorkDraftItemSchema.safeParse(item).success,true);
 assert.equal(schema.WorkItemSchema.safeParse({...item,published:true}).success,false);
 assert.equal(schema.WorkItemSchema.safeParse({...item,published:true,image:'/assets/cover.jpg'}).success,true);
});
function api({denied=false}={}){
 const calls=[];
 const storage={createSignedUploadUrl:async name=>{calls.push(['sign',name]);return {data:{signedUrl:'https://project.supabase.co/storage/upload/sign',token:'temporary'},error:null};},createSignedUrl:async()=>({data:{signedUrl:'https://storage.test/signed'},error:null}),move:async(...args)=>{calls.push(['move',...args]);return {error:null};},remove:async(...args)=>{calls.push(['remove',...args]);return {error:null};}};
 const client={storage:{from:()=>storage,getBucket:async()=>({data:{file_size_limit:4194304,allowed_mime_types:['video/mp4','video/webm','image/jpeg']},error:null}),updateBucket:async(...args)=>{calls.push(['update',...args]);return {error:null};}}};
 const handler=runtime({'@/lib/cms-http':{cmsAccess:async()=>denied?NextResponse.json({error:'login'},{status:401}):null,cmsError:()=>NextResponse.json({error:'failed'},{status:500})},'@/lib/supabase/admin':{createAdminClient:()=>client},'@/lib/cms-media':{cmsMediaBucket:'portfolio-cms-media'}})('app/api/admin/media/video/route.ts');
 return {handler,calls};
}
test('signed video upload requires admin and rejects invalid formats, sizes and paths',async()=>{
 const blocked=api({denied:true});assert.equal((await blocked.handler.POST(request({action:'sign',type:'video/mp4',size:10}))).status,401);assert.equal(blocked.calls.length,0);
 const {handler,calls}=api();
 for(const body of [{action:'sign',type:'image/jpeg',size:10},{action:'sign',type:'video/mp4',size:41*1024*1024},{action:'complete',path:'../secret.mp4'}])assert.equal((await handler.POST(request(body))).status,400);
 assert.equal(calls.length,0);
});
test('valid upload receives only a scoped token and preserves private bucket/type settings',async()=>{
 const {handler,calls}=api();const response=await handler.POST(request({action:'sign',type:'video/mp4',size:8*1024*1024}));
 assert.equal(response.status,200);const data=await response.json();assert.match(data.path,/^video-staging\/.*\.mp4$/);assert.equal(data.signedUrl,'https://project.supabase.co/storage/upload/sign');assert.equal(data.token,undefined);
 const update=calls.find(call=>call[0]==='update')[2];assert.equal(update.public,false);assert.equal(update.fileSizeLimit,40*1024*1024);assert.deepEqual(update.allowedMimeTypes,['video/mp4','video/webm','image/jpeg']);
});
test('completion validates bounded range bytes before moving to publishable media',async()=>{
 const original=global.fetch;
 try{
   const bytes=new Uint8Array(16);bytes.set(Buffer.from('ftyp'),4);
   global.fetch=async(_url,options)=>{assert.equal(options.headers.Range,'bytes=0-15');return new Response(bytes,{status:206,headers:{'Content-Range':'bytes 0-15/8000000'}});};
   const {handler,calls}=api();const response=await handler.POST(request({action:'complete',path,filename:'sample.mp4'}));assert.equal(response.status,200);assert.equal((await response.json()).url,'/api/media/'+path.replace('video-staging/','works/'));assert.ok(calls.some(call=>call[0]==='move'));
   global.fetch=async()=>new Response(new Uint8Array(16),{status:206,headers:{'Content-Range':'bytes 0-15/100'}});
   const bad=api();assert.equal((await bad.handler.POST(request({action:'complete',path}))).status,400);assert.ok(bad.calls.some(call=>call[0]==='remove'));assert.ok(!bad.calls.some(call=>call[0]==='move'));
 }finally{global.fetch=original;}
});
test('video media gateway only signs visible published references or authenticated drafts',async()=>{
 let admin=false,published=false,signed=0;
 const handler=runtime({'@/lib/auth/session':{verifyAdminSession:async()=>admin},'@/lib/cms-media':{cmsMediaBucket:'private',publishedMedia:async()=>published},'@/lib/supabase/admin':{createAdminClient:()=>({storage:{from:()=>({createSignedUrl:async()=>{signed++;return {data:{signedUrl:'https://storage.test/video.mp4?token=short'},error:null};}})}})}})('app/api/media/[...path]/route.ts');
 const params={params:Promise.resolve({path:['works',path.split('/')[1]]})};
 assert.equal((await handler.GET({},params)).status,404);assert.equal(signed,0);
 published=true;const response=await handler.GET({},params);assert.equal(response.status,307);assert.match(response.headers.get('location'),/^https:\/\/storage.test/);assert.equal(response.headers.get('cache-control'),'no-store');
 published=false;admin=true;assert.equal((await handler.GET({},params)).status,307);
});
test('only the dominant visible preview plays; modal, reduced motion and hidden tabs pause it',async()=>{
 const source=fs.readFileSync('public/assets/js/works.js','utf8');
 const document={hidden:false},modal={open:false},reduced={matches:false};
 const code=source.slice(source.indexOf('  const videoPreviews'),source.indexOf('  const videoObserver'))+';({videoPreviews,syncVideoPreviews})';
 const state=vm.runInNewContext(code,{document,modal,reduced});
 const video=()=>({isConnected:true,paused:true,dataset:{src:'https://storage.test/video.mp4'},pause(){this.paused=true;},play(){this.paused=false;return Promise.resolve();},classList:{remove(){}}});
 const a=video(),b=video();state.videoPreviews.set(a,{ratio:.9});state.videoPreviews.set(b,{ratio:.7});state.syncVideoPreviews();assert.equal(a.paused,false);assert.equal(b.paused,true);assert.equal(b.src,undefined);
 state.videoPreviews.get(b).ratio=1;state.syncVideoPreviews();assert.equal(a.paused,true);assert.equal(b.paused,false);
 for(const target of [modal,reduced,document]){const key=target===modal?'open':target===reduced?'matches':'hidden';target[key]=true;state.syncVideoPreviews();assert.equal(b.paused,true);target[key]=false;state.syncVideoPreviews();assert.equal(b.paused,false);}
 b.play=()=>Promise.reject(Error('blocked'));b.paused=true;state.syncVideoPreviews();await new Promise(resolve=>setImmediate(resolve));
});
test('client transfer retries a disconnected upload and only then finalizes the scoped object',async()=>{
 const originalFetch=global.fetch,originalXHR=global.XMLHttpRequest;let transfers=0;const actions=[],progress=[];
 try{
   global.fetch=async(_url,options)=>{const data=JSON.parse(options.body);actions.push(data.action);return Response.json(data.action==='sign'?{path,signedUrl:'https://storage.test/upload/sign'}:{url:'/api/media/works/final.mp4'});};
   global.XMLHttpRequest=class{upload={};open(method,url){assert.equal(method,'PUT');assert.equal(url,'https://storage.test/upload/sign');}send(){transfers++;queueMicrotask(()=>{if(transfers===1)this.onerror();else{this.upload.onprogress({lengthComputable:true,loaded:100,total:100});this.status=200;this.onload();}});}};
   const {uploadPortfolioVideo}=runtime()('lib/video-upload.ts');const result=await uploadPortfolioVideo(new File(['video'],'qa.mp4',{type:'video/mp4'}),value=>progress.push(value));
   assert.equal(transfers,2);assert.deepEqual(actions,['sign','complete']);assert.equal(result.url,'/api/media/works/final.mp4');assert.deepEqual(progress,[0,100]);
 }finally{global.fetch=originalFetch;global.XMLHttpRequest=originalXHR;}
});
