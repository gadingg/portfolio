const assert=require('node:assert/strict'),http=require('node:http'),{spawn}=require('node:child_process');
const base='http://127.0.0.1:3010',upstreamPort=45110;
(async()=>{
 let calls=0,child;const sockets=new Set();
 const upstream=http.createServer(()=>{calls++;});
 upstream.on('connection',socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));});
 await new Promise(resolve=>upstream.listen(upstreamPort,'127.0.0.1',resolve));
 try{
  child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3010'],{cwd:process.cwd(),windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,SUPABASE_URL:`http://127.0.0.1:${upstreamPort}`,SUPABASE_SERVICE_ROLE_KEY:'fault-injection-test-key'}});
  child.stderr.on('data',()=>{});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Test server did not start')),12000);child.stdout.on('data',data=>{if(data.toString().includes('Ready')){clearTimeout(timer);resolve();}});child.on('error',reject);});
  const started=performance.now();
  const response=await fetch(base+'/work/reqvideo',{headers:{'user-agent':'Mozilla/5.0'},signal:AbortSignal.timeout(14000)});
  const firstByteMs=Math.round(performance.now()-started),reader=response.body.getReader(),decoder=new TextDecoder();
  let body='',skeletonMs;
  for(;;){const chunk=await reader.read();if(chunk.done)break;body+=decoder.decode(chunk.value,{stream:true});if(skeletonMs===undefined&&body.includes('case-skeleton'))skeletonMs=Math.round(performance.now()-started);}
  const totalMs=Math.round(performance.now()-started);
  assert.ok(body.includes('case-skeleton'),'Loading skeleton must be in streamed HTML');
  assert.ok(body.includes('digest')||body.includes('data-dgst'),'Timed-out read must terminate with an error boundary');
  assert.ok(totalMs<13000,'Read must not spin indefinitely');
  assert.ok(skeletonMs<2000,'Skeleton must stream before the stalled data read completes');
  assert.equal(calls,1,'Metadata and page must share one CMS read');
  console.log(JSON.stringify({mode:'local-hanging-upstream',firstByteMs,skeletonMs,totalMs,upstreamCalls:calls,skeleton:true,terminated:true}));
 }finally{
  child?.kill();for(const socket of sockets)socket.destroy();await new Promise(resolve=>upstream.close(resolve));
 }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
