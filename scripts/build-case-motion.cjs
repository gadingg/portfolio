// Rebuild the four accessible projects from live UI captures, never portfolio thumbnails.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const cases = {
  listinghub: { title: 'Internal Listing Hub', background: '#e5ece7', order: [1, 2, 3, 4], urls: ['https://listinghub-patos.vercel.app/all', 'https://listinghub-patos.vercel.app/gading'], beats: ['Database', 'House results', 'Detailed filters', 'Personal listings'] },
  mbg: { title: 'PROGRAM MBG', background: '#080e25', order: [1, 2, 3, 4], urls: ['https://patosser.my.id/mbg/'], beats: ['Leaderboard', 'Point history', 'Point rules', 'Activity history'] },
  mydaily: { title: 'Literally... My Daily App', background: '#0b1017', order: [1, 2, 3, 4], urls: ['https://dailyappgading.vercel.app/'], beats: ['Tasks and links', 'Unsaved task draft', 'Link form', 'Focus timer'] },
  reqvideo: { title: 'Req Video Bareng Patosser', background: '#e9ebed', desktop: true, order: [4, 1, 2, 3], urls: ['https://patosser.my.id/reqvideo/', 'https://tally.so/r/D49VxZ'], beats: ['Request form', 'Request queue', 'Next request', 'Listing details'] },
};
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const focusRegions={
  listinghub:[[.21,.187,.23,.05],[.69,.25,.23,.05],[.04,.14,.90,.28],[.04,.24,.9,.30]],
  mbg:[[.40,.55,.19,.05],[.08,.5,.84,.24],[.04,.31,.92,.13],[.05,.32,.9,.18]],
  mydaily:[[.79,.83,.13,.06],[.50,.635,.45,.06],[.045,.465,.91,.225],[.35,.475,.25,.06]],
  reqvideo:[[.22,.52,.27,.07],[.90,.46,.05,.08],[.60,.55,.08,.045],[.27,.267,.45,.14]],
  'reqvideo-mobile':[[.04,.485,.91,.045],[.85,.48,.09,.05],[.60,.565,.22,.045],[.07,.23,.84,.15]],
};

async function build(slug, data, mobile) {
  const dir = path.join(root, 'motion/case-studies', slug + (mobile ? '-mobile' : ''));
  fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'compositions'), { recursive: true });
  const dimensions=[];
  for (let i = 0; i < data.order.length; i++) {
    const number = String(data.order[i]).padStart(2, '0');
    const filename = slug + (data.desktop && mobile ? '-mobile' : '') + '-' + number + '.png';
    dimensions.push(await sharp(path.join(root,'motion/live-captures',filename)).metadata());
    await sharp(path.join(root, 'motion/live-captures', filename)).webp({ quality: 90 }).toFile(path.join(dir, 'assets/screen-' + i + '.webp'));
  }
  const gsapFile = path.join(dir, 'assets/gsap.min.js');
  if (!fs.existsSync(gsapFile)) fs.copyFileSync(path.join(root, 'public/assets/vendor/gsap/gsap.min.js'), gsapFile);
  const width = mobile ? 1080 : 1920, height = mobile ? 1350 : 1080;
  const desktop = data.desktop && !mobile;
  const screenHeight = mobile ? 1220 : 920;
  const screenWidth = desktop ? 1640 : Math.round(screenHeight * 430 / 900);
  const left = Math.round((width - screenWidth) / 2), top = Math.round((height - screenHeight) / 2);
  const step = screenWidth + (mobile ? 110 : 124);
  function focus(index){
    const region=(focusRegions[slug+(mobile&&data.desktop?'-mobile':'')]||focusRegions[slug])[index];
    const size=dimensions[index],scale=Math.min(screenWidth/size.width,screenHeight/size.height),w=size.width*scale,h=size.height*scale;
    return '<span aria-hidden="true" class="feature-focus" style="left:'+((screenWidth-w)/2+region[0]*w)+'px;top:'+((screenHeight-h)/2+region[1]*h)+'px;width:'+region[2]*w+'px;height:'+region[3]*h+'px"></span>';
  }
  const cards = desktop
    ? Array.from({ length: 5 }, (_, i) => '<div id="state-' + i + '" class="clip state" data-start="0" data-duration="12" data-track-index="' + (i + 1) + '" data-track-kind="graphics"><div class="screen"><img src="assets/screen-' + (i % 4) + '.webp" alt="' + escape(data.beats[i % 4]) + '" data-var-src="screen-' + (i % 4) + '">'+focus(i%4)+'</div></div>').join('\n')
    : Array.from({ length: 7 }, (_, i) => '<div id="state-' + i + '" class="screen" style="left:' + (left + (i - 1) * step) + 'px;top:' + top + 'px"><img src="assets/screen-' + ((i + 3) % 4) + '.webp" alt="' + escape(data.beats[(i + 3) % 4]) + '" data-var-src="screen-' + ((i + 3) % 4) + '">'+focus((i+3)%4)+'</div>').join('\n');
  const timeline = desktop ? [
    "tl.set('.state .screen',{opacity:0},0);tl.set('#state-0 .screen',{opacity:1},0);",
    "for(let i=1;i<=4;i++){const time=i===4?11.4:i*3-.6;",
    "tl.fromTo('#state-'+i+' .screen',{y:22,opacity:0},{y:0,opacity:1,duration:.6,ease:'power3.out'},time);",
    "tl.to('#state-'+(i-1)+' .screen',{opacity:0,duration:.45},time);}"
  ].join('\n') : "tl.set('.screen',{opacity:.42,scale:.88,transformOrigin:'50% 50%'},0);tl.set('#state-1',{opacity:1,scale:1},0);for(let i=1;i<=4;i++){const time=i===4?11.25:i*3-.75;tl.to('#rail-inner',{x:-i*" + step + ",duration:.75,ease:'power3.inOut'},time);tl.to('#state-'+i,{opacity:.42,scale:.88,duration:.75},time);tl.to('#state-'+(i+1),{opacity:1,scale:1,duration:.75},time);}";
  const focusTimeline="for(let i=0;i<4;i++){const target='#state-'+(i+"+(desktop?0:1)+")+' .feature-focus';tl.fromTo(target,{opacity:0,scale:.98},{opacity:1,scale:1,duration:.3,ease:'power2.out'},i*3+.9);tl.to(target,{opacity:0,duration:.3},i*3+1.95);}";
  const html = '<template><style>*{box-sizing:border-box}#root{position:absolute;inset:0;overflow:hidden;background:' + data.background + '}.screen{position:absolute;width:' + screenWidth + 'px;height:' + screenHeight + 'px;overflow:hidden;border-radius:' + (desktop ? 18 : 28) + 'px;background:' + (slug === 'mydaily' ? '#0b1017' : '#fff') + ';border:1px solid #ffffff24}.screen img{display:block;width:100%;height:100%;object-fit:contain}.feature-focus{position:absolute;opacity:0;border:3px solid '+(slug==='mbg'?'#43e0d6':slug==='mydaily'?'#90abc9':'#038e93')+';border-radius:10px;pointer-events:none}.state{position:absolute;inset:0}.state .screen{left:' + left + 'px;top:' + top + 'px}#rail-inner{position:absolute;inset:0}</style><div id="root" data-composition-id="workflow" data-width="' + width + '" data-height="' + height + '">' + (desktop ? cards : '<div id="rail" class="clip" data-start="0" data-duration="12" data-track-index="1" data-track-kind="graphics"><div id="rail-inner" data-layout-allow-overflow="true">' + cards + '</div></div>') + '</div><script>const tl=gsap.timeline({paused:true});' + timeline + focusTimeline + 'window.__timelines=window.__timelines||{};window.__timelines.workflow=tl;</script></template>';
  fs.writeFileSync(path.join(dir, 'compositions/workflow.html'), html);
  const variables = data.beats.map((beat, i) => ({ id: 'screen-' + i, type: 'string', label: beat, default: 'assets/screen-' + i + '.webp' }));
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><html lang="en" data-composition-variables=\'' + JSON.stringify(variables) + '\'><head><meta charset="utf-8"><script src="assets/gsap.min.js"></script><style>html,body{margin:0;width:' + width + 'px;height:' + height + 'px;overflow:hidden}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="12" data-width="' + width + '" data-height="' + height + '"><div id="workflow" class="clip" data-composition-id="workflow" data-composition-src="compositions/workflow.html" data-start="0" data-duration="12" data-width="' + width + '" data-height="' + height + '" data-track-kind="graphics"></div></div><script>window.__timelines=window.__timelines||{};window.__timelines.main=gsap.timeline({paused:true});</script></body></html>');
  fs.writeFileSync(path.join(dir, 'SPEC.md'), '# ' + data.title + '\n\n12 seconds, 30 fps, ' + width + ' x ' + height + '. Four distinct live UI states, silent loop. No captions or playback controls. Screen proportions are preserved. ' + (desktop ? 'Single desktop panel, 0.6s state reveals.' : 'Aligned portrait screens, 0.75s horizontal transitions, matching cyclic end state.') + '\n\nCaptured on 2026-11-04:\n' + data.urls.join('\n') + '\n\n' + data.beats.map((beat, i) => i * 3 + 's: ' + beat).join('\n') + '\n\nAuthored transitions between real captured states, not a continuous screen recording. No live writes or submitted forms. Personal finance is excluded. My Daily sample tasks are typed in an unsaved form.\n');
}
(async () => {
  const selected=process.argv[2],entries=Object.entries(cases).filter(([slug])=>!selected||slug===selected);
  if(!entries.length)throw Error('Unknown live capture project.');
  for (const [slug, data] of entries) for (const mobile of [false, true]) await build(slug, data, mobile);
  console.log('Built '+entries.length*2+' compositions with four distinct live screens each. Meta Ads and office Daily App remain unchanged by user instruction.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
