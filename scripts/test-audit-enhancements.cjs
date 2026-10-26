const test=require('node:test'),assert=require('node:assert/strict'),sharp=require('sharp');
const {runtime}=require('./cms-script-runtime.cjs');
const load=runtime(),{siteURL}=load('lib/site-url.ts'),{isReadyWork,presentWork}=load('lib/work-readiness.ts'),{withWorkEvidence}=load('lib/work-evidence.ts');
const item=patch=>({id:'work',kind:'design',title:'Artwork',image:'/art.png',imageAlt:'',published:true,demo:false,url:'',description:'',artwork:'sample',...patch});
test('production metadata never points to a localhost origin',()=>{
  const previous={mode:process.env.NODE_ENV,url:process.env.NEXT_PUBLIC_SITE_URL};
  try{process.env.NODE_ENV='production';process.env.NEXT_PUBLIC_SITE_URL='http://localhost:3000';assert.equal(siteURL(),'https://portfolio-gading.vercel.app');process.env.NEXT_PUBLIC_SITE_URL='https://gadingutama.dev/';assert.equal(siteURL(),'https://gadingutama.dev');}
  finally{for(const [key,value] of [['NODE_ENV',previous.mode],['NEXT_PUBLIC_SITE_URL',previous.url]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
test('unfinished media stays private to the editing experience while real artwork and reels are ready',()=>{
  assert.equal(isReadyWork(item({image:'/assets/work/sample-design-2.svg',demo:true})),false);
  assert.equal(isReadyWork(item({image:'/api/media/works/upload.png',demo:true})),true);
  assert.equal(isReadyWork(item({kind:'video',url:'https://www.instagram.com/reel/DEMO_VIDEO_2/'})),false);
  assert.equal(isReadyWork(item({kind:'video',videoFile:'/video.mp4'})),true);
  const reel=item({id:'sample-video-1',kind:'video',title:'Video Instagram 01',image:'/assets/work/sample-design-1.svg',url:'https://www.instagram.com/reel/DeBkwyszNoi/'});
  assert.equal(isReadyWork(reel),true);assert.equal(presentWork(reel).image,'/assets/work/branding-video-cover.svg');assert.equal(reel.title,'Video Instagram 01');
  const records=[item({id:'ready'}),item({id:'incomplete',kind:'video',demo:true})];
  const summary=load('lib/admin-overview.ts').summarizeWorks(records,records);
  assert.equal(summary.total,2);assert.equal(summary.live,1);assert.equal(summary.incomplete,1);
});
test('case evidence is inserted once, remains editable and never restores an intentionally removed block',()=>{
  const source=item({kind:'webapp',caseStudy:{slug:'metaads',problem:'',solution:'',impact:'',appUrl:'',blocks:[]}});
  const enhanced=withWorkEvidence(source);assert.equal(enhanced.caseStudy.blocks.length,2);assert.equal(source.caseStudy.blocks.length,0);
  assert.deepEqual(withWorkEvidence(enhanced),enhanced);
  const removed={...enhanced,caseStudy:{...enhanced.caseStudy,blocks:[]}};assert.equal(withWorkEvidence(removed).caseStudy.blocks.length,0);
  assert.equal(load('lib/works.ts').WorksDraftSchema.safeParse({items:[enhanced]}).success,true);
});
test('responsive derivatives still require published access; originals remain byte-for-byte intact',async()=>{
  const original=await sharp({create:{width:2400,height:1350,channels:3,background:'#ff5a1f'}}).png().toBuffer();
  let allowed=true,downloads=0;
  const route=runtime({'@/lib/auth/session':{verifyAdminSession:async()=>false},'@/lib/cms-media':{cmsMediaBucket:'private',publishedMedia:async()=>allowed},'@/lib/supabase/admin':{createAdminClient:()=>({storage:{from:()=>({download:async()=>{downloads++;return {data:new Blob([original],{type:'image/png'})};}})}})}})('app/api/media/[...path]/route.ts');
  const params={params:Promise.resolve({path:['works','1792212542785-50bd4dd1-2833-486d-ac27-bae92c807fd5.png']})};
  const request=w=>({nextUrl:new URL(`https://portfolio.test/api/media/works/image.png${w?'?w='+w:''}`)});
  const response=await route.GET(request(640),params),bytes=Buffer.from(await response.arrayBuffer()),metadata=await sharp(bytes).metadata();
  assert.equal(metadata.width,640);assert.equal(response.headers.get('Content-Type'),'image/webp');assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.deepEqual(Buffer.from(await (await route.GET(request(),params)).arrayBuffer()),original);
  allowed=false;assert.equal((await route.GET(request(640),params)).status,404);assert.equal(downloads,2);
});
