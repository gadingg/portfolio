const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public/assets/work/new-cases');
const names=['prompt','followup','rekapella'];
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const text=(x,y,value,size=24,color='#f7f8fc',weight=400)=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="${color}" font-weight="${weight}">${escape(value)}</text>`;
const box=(x,y,w,h,fill='#151a2e',r=20)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
function ellaScreen(index){
  let content='';
  const card=(y,title,body)=>box(28,y,724,125)+text(55,y+42,title,27,'#fff',700)+text(55,y+86,body,22,'#a8b3cf');
  if(index===0){
    content=text(28,100,'Rekap Piket Murid',40,'#fff',700)+text(28,155,'Overview Bulan Ini',25,'#fff',700);
    [['Total Jam','24 Jam'],['Total Murid','8 Murid'],['Paket Selesai','3 Paket'],['Estimasi Gaji','Rp450.000']].forEach(([label,value],i)=>{const x=28+i%2*374,y=187+Math.floor(i/2)*190;content+=box(x,y,350,166)+text(x+24,y+43,label,21,'#9ca9c4')+text(x+24,y+108,value,36,'#fff',700);});
    content+=text(28,620,'Riwayat Piket',30,'#fff',700)+card(650,'Murid A','03 Nov 2026 · 1 jam')+card(793,'Murid B','03 Nov 2026 · 1,5 jam')+card(936,'Murid C','04 Nov 2026 · 2 jam');
  }else if(index===1){
    content=text(28,100,'Input Data Piket',40,'#fff',700)+box(28,150,352,70,'#4378e0')+text(111,195,'Input Cepat',24,'#fff',700)+box(400,150,352,70)+text(486,195,'Input Rapel',24);
    [['Pilih Murid','Murid A'],['Tanggal Piket','04 November 2026'],['Check-In (Jam Mulai)','15:00']].forEach(([a,b],i)=>{const y=275+i*182;content+=text(30,y,a,25,'#b6c4e0')+box(28,y+25,724,98)+text(55,y+87,b,30);});
    content+=text(28,845,'Durasi Jam Piket',26,'#b6c4e0')+box(28,880,225,86,'#4378e0')+text(99,934,'1 Jam',28,'#fff',700)+box(276,880,225,86)+text(326,934,'1,5 Jam',28)+box(524,880,228,86)+text(584,934,'2 Jam',28)+box(28,1020,724,90,'#4378e0')+text(259,1077,'Simpan Data Piket',28,'#fff',700);
  }else if(index===2){
    content=text(28,100,'Laporan Bulanan',40,'#fff',700)+text(28,151,'November 2026',24,'#a8b3cf')+box(28,185,724,250)+text(56,239,'TOTAL JAM',23,'#a8b3cf')+text(56,324,'24 jam',66,'#fff',700)+text(56,394,'8 murid · 3 paket',24,'#a8b3cf');
    content+=text(28,500,'Distribusi jam',29,'#fff',700);
    [80,125,65,150,110,50].forEach((v,i)=>content+=box(47+i*118,750-v,70,v,'#75a9ff',8));
    content+=text(58,797,'Sen     Sel      Rab     Kam     Jum     Sab',20,'#9ca9c4')+card(850,'Ringkasan per murid','Murid A · 4 jam      Murid B · 3 jam')+box(28,1030,724,90,'#4378e0')+text(275,1088,'Rekap Bulanan',28,'#fff',700);
  }else{
    content=text(28,100,'Telegram Bot',40,'#fff',700)+text(28,148,'Alur ilustrasi dari fitur aplikasi',22,'#a8b3cf');
    content+=box(170,205,580,116,'#2a4774')+text(200,250,'Catat piket: Murid A',27)+text(200,291,'4 Nov 2026 · 15:00 · 1 jam',24,'#c8d6ed');
    content+=box(28,360,630,160)+text(58,406,'Catatan piket tersimpan',27,'#fff',700)+text(58,451,'Murid A · 1 jam',25,'#c8d6ed')+text(58,494,'Tanggal: 4 November 2026',24,'#c8d6ed');
    content+=box(28,570,630,190)+text(58,618,'Rekap murid hari ini',28,'#fff',700)+text(58,664,'Murid A · 1 jam',24,'#c8d6ed')+text(58,703,'Murid B · 1,5 jam',24,'#c8d6ed')+text(58,741,'Total: 2,5 jam',24,'#c8d6ed');
    content+=box(28,810,630,147)+text(58,859,'Reminder pencatatan',28,'#fff',700)+text(58,909,'Sudah catat piket hari ini?',25,'#c8d6ed');
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="1450" viewBox="0 0 780 1450">${box(0,0,780,1450,'#060919',0)}${content}${box(0,1298,780,152,'#101730',0)}${['Home','Log','+','Laporan','Database'].map((label,i)=>text(40+i*149,1351,label,22,'#9ca9c4',700)).join('')}${text(35,1418,'Rekonstruksi UI · Semua data ilustrasi',22,'#9daecc')}</svg>`;
}
function image(data,x,y,w,h){return `<image href="data:image/png;base64,${data.toString('base64')}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;}
async function composition(slug,shots,detail=false){
  const portrait=slug!=='prompt',width=1920,height=1440,bg=slug==='rekapella'?'#e8ebf2':slug==='followup'?'#e4edeb':'#edf0f1';
  let shapes=box(0,0,width,height,bg,0);
  if(portrait){
    const meta=await sharp(shots[0]).metadata(),ratio=meta.width/meta.height;
    const positions=detail?[[235,100,Math.round(1240*ratio),1240],[1035,100,Math.round(1240*ratio),1240]]:[[320,95,Math.round(1210*ratio),1210],[1060,180,Math.round(1080*ratio),1080]];
    for(const [i,[x,y,w,h]] of positions.entries()){shapes+=box(x-14,y-14,w+28,h+28,'#c4c9cc',47)+box(x-9,y-9,w+18,h+18,'#222932',42)+`<g clip-path="url(#clip${i})">`+image(shots[detail?i+2:i===0?0:1],x,y,w,h)+'</g>';}
    shapes=`<defs>${positions.map(([x,y,w,h],i)=>`<clipPath id="clip${i}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="32"/></clipPath>`).join('')}</defs>`+shapes;
  }else{
    const positions=detail?[[105,100,1710,610],[105,760,1710,610]]:[[110,120,1360,765],[850,720,970,546]];
    for(const [i,[x,y,w,h]] of positions.entries()){shapes+=box(x-5,y-42,w+10,h+48,'#cbd0d2',20)+box(x,y-35,w,35,'#f8fafb',15)+`<circle cx="${x+23}" cy="${y-17}" r="5" fill="#d1d7db"/>`+image(shots[detail?i+2:i],x,y,w,h);}
  }
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1440">${shapes}</svg>`)).webp({quality:88}).toFile(path.join(out,`${slug}-${detail?'detail':'cover'}.webp`));
}
async function motion(slug,shots,mobile){
  const name=slug+(mobile?'-mobile':''),dir=path.join(root,'motion/case-studies',name),width=mobile?1080:1920,height=mobile?1350:1080;
  fs.mkdirSync(path.join(dir,'assets'),{recursive:true});fs.mkdirSync(path.join(dir,'compositions'),{recursive:true});
  fs.copyFileSync(path.join(root,'motion/case-studies/listinghub/assets/gsap.min.js'),path.join(dir,'assets/gsap.min.js'));
  const rects=[];
  for(let i=0;i<4;i++){
    await sharp(shots[i]).webp({quality:90}).toFile(path.join(dir,`assets/screen-${i}.webp`));
    const m=await sharp(shots[i]).metadata(),scale=Math.min((width-(mobile?100:180))/m.width,(height-120)/m.height),w=Math.round(m.width*scale),h=Math.round(m.height*scale);
    rects.push({x:Math.round((width-w)/2),y:Math.round((height-h)/2),w,h});
  }
  const cards=Array.from({length:5},(_,i)=>{const r=rects[i%4];return `<div id="state-${i}" class="clip" data-start="0" data-duration="12" data-track-index="${i+1}" data-track-kind="graphics"><div class="screen" style="left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px"><img src="assets/screen-${i%4}.webp" alt="${slug} UI state ${i%4+1}"/></div></div>`;}).join('');
  const html=`<template><style>*{box-sizing:border-box}#root{position:absolute;inset:0;background:${slug==='rekapella'?'#e8ebf2':'#e8efed'};overflow:hidden}.clip{position:absolute;inset:0}.screen{position:absolute;overflow:hidden;border-radius:20px;background:#fff}.screen img{display:block;width:100%;height:100%;object-fit:contain}</style><div id="root" data-composition-id="workflow" data-width="${width}" data-height="${height}">${cards}</div><script>const tl=gsap.timeline({paused:true});tl.set('.screen',{opacity:0},0);tl.set('#state-0 .screen',{opacity:1},0);for(let i=1;i<=4;i++){const t=i===4?11.4:i*3-.5;tl.fromTo('#state-'+i+' .screen',{opacity:0,y:14},{opacity:1,y:0,duration:.5,ease:'power3.out'},t);tl.to('#state-'+(i-1)+' .screen',{opacity:0,duration:.4},t);}window.__timelines=window.__timelines||{};window.__timelines.workflow=tl;</script></template>`;
  fs.writeFileSync(path.join(dir,'compositions/workflow.html'),html);
  fs.writeFileSync(path.join(dir,'index.html'),`<!doctype html><html><head><meta charset="utf-8"><script src="assets/gsap.min.js"></script><style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="12" data-width="${width}" data-height="${height}"><div id="workflow" class="clip" data-composition-id="workflow" data-composition-src="compositions/workflow.html" data-start="0" data-duration="12" data-width="${width}" data-height="${height}" data-track-kind="graphics"></div></div><script>window.__timelines=window.__timelines||{};window.__timelines.main=gsap.timeline({paused:true});</script></body></html>`);
  fs.writeFileSync(path.join(dir,'SPEC.md'),`# ${slug}\n\n12 seconds, 30 fps, ${width} x ${height}, silent cyclic sequence of four distinct UI states. Original screen proportions retained. No captions or controls. Final state returns to the first capture.\n\n${slug==='rekapella'?'Reconstructed UI with illustrative data, based on the observed dark navy app. Telegram flow illustrates owner-confirmed features, not a captured conversation. No private student or payroll data.':'Real browser captures from https://patosser.my.id/'+slug+'. No messages, custom templates or AI generation submitted. Prompt property input is illustrative.'}\n`);
}
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  for(let i=0;i<4;i++)await sharp(Buffer.from(ellaScreen(i))).png().toFile(path.join(root,`motion/source-studies/rekapella/0${i+1}.png`));
  for(const slug of names){
    const shots=[];for(let i=1;i<=4;i++)shots.push(await sharp(path.join(root,`motion/source-studies/${slug}/0${i}.png`)).png().toBuffer());
    await composition(slug,shots);await composition(slug,shots,true);await motion(slug,shots,false);
    const phoneDir=path.join(root,'motion/source-studies',slug+'-mobile');
    const phoneShots=fs.existsSync(phoneDir)?await Promise.all([1,2,3,4].map(i=>sharp(path.join(phoneDir,`0${i}.png`)).png().toBuffer())):shots;
    await motion(slug,phoneShots,true);
  }
  console.log('Built three covers, three detail images and six editable motion compositions.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
