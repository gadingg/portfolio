// Editable HyperFrames projects; only rendered MP4s and posters ship to the site.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const cases={
 listinghub:{asset:'listing-hub-dual-mobile.webp',title:'Internal Listing Hub',steps:[['Search the database','Temukan properti dari database bersama.',.65,.29,2.2],['Narrow the options','Filter membantu mempersempit pilihan.',.65,.39,2.5],['Share the details','Salin spesifikasi atau kirim ke klien.',.65,.65,2.6],['Manage personal listings','Ruang terpisah untuk listing tiap agent.',.35,.54,1.8]]},
 metaads:{asset:'meta-report-focus.webp',title:'Meta Ads Report',steps:[['Read the report','Mulai dari ringkasan performa campaign.',.5,.38,1.35],['Compare the signals','Lihat hasil Meta Ads dan respons WhatsApp.',.52,.77,1.65],['Review the cost','Baca anggaran dan biaya per pesan.',.76,.43,1.8],['Plan the next action','Gunakan rekap sebagai dasar evaluasi.',.43,.28,1.4]]},
 mbg:{asset:'mbg-mobile-showcase.webp',title:'PROGRAM MBG',steps:[['Record an activity','Admin memilih agent dan jenis aktivitas.',.81,.51,2.1],['Follow the point rules','Setiap aktivitas punya bobot poin.',.18,.49,2.2],['See the progress','Poin membentuk ranking pada periode terkait.',.49,.54,2.0],['Review and redeem','Detail poin dan reward punya alur yang jelas.',.5,.68,2.4]]},
 dailyapp:{asset:'daily-app-grid.webp',title:'Daily App Gading',steps:[['Start with the task','Kelola pekerjaan melalui Kanban harian.',.4,.67,1.8],['Prepare the prompt','Susun informasi listing untuk kebutuhan visual.',.28,.21,1.65],['Add the watermark','Pilih format dan logo sebelum menyimpan.',.84,.75,1.9],['Keep resources together','Temukan kembali link dan materi kerja.',.8,.25,1.7]]},
 mydaily:{asset:'personal-daily.webp',title:'Literally... My Daily App',steps:[['Plan the day','Task dan ringkasan harian dalam satu tempat.',.5,.32,2.1],['Know where money goes','Lihat pengeluaran berdasarkan kategori.',.18,.51,2.25],['Keep the habit going','Check-in membantu membaca konsistensi.',.81,.54,2.1],['See the daily progress','Tinjau kebiasaan dan progress harian.',.5,.72,2.2]]},
 reqvideo:{asset:'req-take-video.webp',title:'Req Video Bareng Patosser',steps:[['Start with a request','Agent mengajukan listing melalui form.',.76,.8,1.85],['Review the queue','Submission masuk ke antrean request.',.76,.59,1.85],['Confirm the time','Admin follow-up dan fiksasi waktu take.',.31,.39,1.7],['See the schedule','Jadwal final terkumpul dalam satu halaman.',.31,.58,1.65]]},
};
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
for(const [slug,data] of Object.entries(cases))for(const mobile of [false,true]){
 const dir=path.join(root,'motion/case-studies',slug+(mobile?'-mobile':''));fs.mkdirSync(path.join(dir,'assets'),{recursive:true});fs.mkdirSync(path.join(dir,'compositions'),{recursive:true});
 fs.copyFileSync(path.join(root,'public/assets/work',data.asset),path.join(dir,'assets/ui.webp'));
 fs.writeFileSync(path.join(dir,'assets/gsap.min.js'),fs.readFileSync(path.join(root,'node_modules/gsap/dist/gsap.min.js'),'utf8').replace(/[ \t]+$/gm,'').trimEnd()+'\n');
 const W=mobile?1080:1920,H=mobile?1350:1080,sw=mobile?960:1120,sh=mobile?830:864,sx=mobile?60:740,sy=mobile?60:108;
 const labels=data.steps.map(([title,copy],i)=>`<div id="copy-${i}" class="clip copy" data-start="${i*3}" data-duration="3" data-track-index="${i+2}" data-track-kind="graphics" data-beat="${esc(title)}"><div class="copy-inner"><h2>${esc(title)}</h2><p>${esc(copy)}</p></div></div>`).join('');
 const ticks=data.steps.map((_,i)=>`<span id="tick-${i}"></span>`).join('');
 const scene=`<template><style>
 *{box-sizing:border-box;margin:0}#root{position:absolute;inset:0;background:#0b0c0b;color:#f3f0e8;font-family:Inter,sans-serif;overflow:hidden}
 .screen{position:absolute;left:${sx}px;top:${sy}px;width:${sw}px;height:${sh}px;overflow:hidden;border-radius:24px;background:#eff1f2}.screen img{position:absolute;left:0;top:0;width:${sw}px;height:auto;max-width:none;transform-origin:0 0}
 .copy{position:absolute;left:${mobile?60:96}px;top:${mobile?970:290}px;width:${mobile?960:570}px;height:${mobile?310:470}px}.copy h2{font-size:${mobile?76:82}px;font-weight:700;line-height:1.08;letter-spacing:-.035em;margin-bottom:28px}.copy p{font-size:${mobile?42:38}px;line-height:1.45;color:#c4c5bf;max-width:${mobile?900:530}px}
 .progress{position:absolute;left:${mobile?60:96}px;top:${mobile?925:850}px;display:flex;gap:14px}.progress span{display:block;width:${mobile?180:90}px;height:6px;border-radius:3px;background:#f3f0e838}
 </style><div id="root" data-composition-id="workflow" data-width="${W}" data-height="${H}">
 <div id="screen" class="clip" data-start="0" data-duration="12" data-track-index="1" data-track-kind="graphics"><div class="screen" data-layout-allow-overflow="true"><img id="ui" src="assets/ui.webp" alt="${esc(data.title)} UI" data-var-src="ui"/></div></div>
 ${labels}<div id="progress" class="clip" data-start="0" data-duration="12" data-track-index="7"><div class="progress">${ticks}</div></div>
 </div><script>
 const tl=gsap.timeline({paused:true});const img=document.querySelector('#ui');
 const steps=${JSON.stringify(data.steps)};const sw=${sw},sh=${sh};const ih=sw*${slug==='mydaily'?1024/1536:1086/1448};
 steps.forEach((step,i)=>{const scale=step[4],x=Math.min(0,Math.max(sw-sw*scale,sw/2-step[2]*sw*scale)),y=Math.min(0,Math.max(sh-ih*scale,sh/2-step[3]*ih*scale));
 if(i===0)tl.set(img,{x,y,scale},0);else tl.to(img,{x,y,scale,duration:.65,ease:'power3.inOut'},i*3);
 tl.fromTo('#copy-'+i+' .copy-inner',{y:24,opacity:i===0?1:0},{y:0,opacity:1,duration:.35,ease:'power3.out'},i*3);
 tl.to('#tick-'+i,{backgroundColor:'#ff5a1f',duration:.2},i*3);
 });
 const first=steps[0],scale=first[4];tl.to(img,{x:Math.min(0,Math.max(sw-sw*scale,sw/2-first[2]*sw*scale)),y:Math.min(0,Math.max(sh-ih*scale,sh/2-first[3]*ih*scale)),scale,duration:.35,ease:'power2.inOut'},11.65);
 window.__timelines=window.__timelines||{};window.__timelines.workflow=tl;
 </script></template>`;
 fs.writeFileSync(path.join(dir,'compositions/workflow.html'),scene);
 fs.writeFileSync(path.join(dir,'index.html'),`<!doctype html><html lang="en" data-composition-variables='[{"id":"ui","type":"string","label":"Project UI","default":"assets/ui.webp"}]'><head><meta charset="utf-8"><script src="assets/gsap.min.js"></script><style>html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#0b0c0b}#root{position:absolute;inset:0}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="12" data-width="${W}" data-height="${H}"><div id="workflow" class="clip" data-composition-id="workflow" data-composition-src="compositions/workflow.html" data-start="0" data-duration="12" data-width="${W}" data-height="${H}" data-track-kind="graphics"></div></div><script>window.__timelines=window.__timelines||{};window.__timelines.main=gsap.timeline({paused:true});</script></body></html>`);
 fs.writeFileSync(path.join(dir,'hyperframes.json'),JSON.stringify({authoringSkill:'hyperframes',paths:{assets:'assets',blocks:'compositions',components:'compositions/components'}},null,2));
 fs.writeFileSync(path.join(dir,'SPEC.md'),`# ${data.title}\n\n12 seconds, 30 fps, ${W} x ${H}. Silent UI walkthrough for a looping portfolio player. Four 3-second beats; 0.65-second camera moves. Existing mockup asset only. No fictional interactions or performance claims. Data shown belongs to the supplied mockup, not a new measurement.\n\n${data.steps.map((s,i)=>`${i*3}s: ${s[0]}. ${s[1]}`).join('\n\n')}\n\nBanned: rotating devices, invented UI, count-up results, sound, decorative glow. Primary labels ${mobile?76:82}px. Mobile layout is separately composed.\n`);
}
console.log('Built 12 editable HyperFrames compositions.');
