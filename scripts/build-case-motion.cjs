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

async function build(slug, data, mobile) {
  const dir = path.join(root, 'motion/case-studies', slug + (mobile ? '-mobile' : ''));
  fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'compositions'), { recursive: true });
  for (let i = 0; i < data.order.length; i++) {
    const number = String(data.order[i]).padStart(2, '0');
    const filename = slug + (data.desktop && mobile ? '-mobile' : '') + '-' + number + '.png';
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
  const cards = desktop
    ? Array.from({ length: 5 }, (_, i) => '<div id="state-' + i + '" class="clip state" data-start="0" data-duration="12" data-track-index="' + (i + 1) + '" data-track-kind="graphics"><div class="screen"><img src="assets/screen-' + (i % 4) + '.webp" alt="' + escape(data.beats[i % 4]) + '" data-var-src="screen-' + (i % 4) + '"></div></div>').join('\n')
    : Array.from({ length: 7 }, (_, i) => '<div id="state-' + i + '" class="screen" style="left:' + (left + (i - 1) * step) + 'px;top:' + top + 'px"><img src="assets/screen-' + ((i + 3) % 4) + '.webp" alt="' + escape(data.beats[(i + 3) % 4]) + '" data-var-src="screen-' + ((i + 3) % 4) + '"></div>').join('\n');
  const timeline = desktop ? [
    "tl.set('.state .screen',{opacity:0},0);tl.set('#state-0 .screen',{opacity:1},0);",
    "for(let i=1;i<=4;i++){const time=i===4?11.4:i*3-.6;",
    "tl.fromTo('#state-'+i+' .screen',{y:22,opacity:0},{y:0,opacity:1,duration:.6,ease:'power3.out'},time);",
    "tl.to('#state-'+(i-1)+' .screen',{opacity:0,duration:.45},time);}"
  ].join('\n') : "tl.set('.screen',{opacity:.42,scale:.88,transformOrigin:'50% 50%'},0);tl.set('#state-1',{opacity:1,scale:1},0);for(let i=1;i<=4;i++){const time=i===4?11.25:i*3-.75;tl.to('#rail-inner',{x:-i*" + step + ",duration:.75,ease:'power3.inOut'},time);tl.to('#state-'+i,{opacity:.42,scale:.88,duration:.75},time);tl.to('#state-'+(i+1),{opacity:1,scale:1,duration:.75},time);}";
  const html = '<template><style>*{box-sizing:border-box}#root{position:absolute;inset:0;overflow:hidden;background:' + data.background + '}.screen{position:absolute;width:' + screenWidth + 'px;height:' + screenHeight + 'px;overflow:hidden;border-radius:' + (desktop ? 18 : 28) + 'px;background:' + (slug === 'mydaily' ? '#0b1017' : '#fff') + ';border:1px solid #ffffff24}.screen img{display:block;width:100%;height:100%;object-fit:contain}.state{position:absolute;inset:0}.state .screen{left:' + left + 'px;top:' + top + 'px}#rail-inner{position:absolute;inset:0}</style><div id="root" data-composition-id="workflow" data-width="' + width + '" data-height="' + height + '">' + (desktop ? cards : '<div id="rail" class="clip" data-start="0" data-duration="12" data-track-index="1" data-track-kind="graphics"><div id="rail-inner" data-layout-allow-overflow="true">' + cards + '</div></div>') + '</div><script>const tl=gsap.timeline({paused:true});' + timeline + 'window.__timelines=window.__timelines||{};window.__timelines.workflow=tl;</script></template>';
  fs.writeFileSync(path.join(dir, 'compositions/workflow.html'), html);
  const variables = data.beats.map((beat, i) => ({ id: 'screen-' + i, type: 'string', label: beat, default: 'assets/screen-' + i + '.webp' }));
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><html lang="en" data-composition-variables=\'' + JSON.stringify(variables) + '\'><head><meta charset="utf-8"><script src="assets/gsap.min.js"></script><style>html,body{margin:0;width:' + width + 'px;height:' + height + 'px;overflow:hidden}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="12" data-width="' + width + '" data-height="' + height + '"><div id="workflow" class="clip" data-composition-id="workflow" data-composition-src="compositions/workflow.html" data-start="0" data-duration="12" data-width="' + width + '" data-height="' + height + '" data-track-kind="graphics"></div></div><script>window.__timelines=window.__timelines||{};window.__timelines.main=gsap.timeline({paused:true});</script></body></html>');
  fs.writeFileSync(path.join(dir, 'SPEC.md'), '# ' + data.title + '\n\n12 seconds, 30 fps, ' + width + ' x ' + height + '. Four distinct live UI states, silent loop. No captions or playback controls. Screen proportions are preserved. ' + (desktop ? 'Single desktop panel, 0.6s state reveals.' : 'Aligned portrait screens, 0.75s horizontal transitions, matching cyclic end state.') + '\n\nCaptured on 2026-11-04:\n' + data.urls.join('\n') + '\n\n' + data.beats.map((beat, i) => i * 3 + 's: ' + beat).join('\n') + '\n\nAuthored transitions between real captured states, not a continuous screen recording. No live writes or submitted forms. Personal finance is excluded. My Daily sample tasks are typed in an unsaved form.\n');
}
(async () => {
  for (const [slug, data] of Object.entries(cases)) for (const mobile of [false, true]) await build(slug, data, mobile);
  console.log('Built 8 compositions with four distinct live screens each. Meta Ads and office Daily App remain unchanged by user instruction.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
