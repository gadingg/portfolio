const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),names=['parking','ulartangga','spin'];
const background={parking:'#e7eef0',ulartangga:'#e9e2d3',spin:'#eeebea'};
const rect=(x,y,w,h,fill,r=20)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
async function shot(slug,index){return sharp(path.join(root,'motion/source-studies',slug,`0${index}.jpg`)).png().toBuffer();}
async function frame(data,x,y,maxW,maxH,phone=false){
  const m=await sharp(data).metadata(),scale=Math.min(maxW/m.width,maxH/m.height),w=Math.round(m.width*scale),h=Math.round(m.height*scale),id=`clip-${x}-${y}`;
  return `<defs><clipPath id="${id}">${rect(x,y,w,h,'#fff',phone?24:12)}</clipPath></defs>${rect(x-7,y-7,w+14,h+14,'#bfc5c8',phone?31:19)}<image href="data:image/png;base64,${data.toString('base64')}" x="${x}" y="${y}" width="${w}" height="${h}" clip-path="url(#${id})" preserveAspectRatio="xMidYMid meet"/>`;
}
async function artwork(slug,shots,phoneShots,detail){
  let content=rect(0,0,1920,1440,background[slug],0);
  if(slug==='parking'){
    content+=await frame(shots[detail?2:0],300,110,600,1210,true);
    content+=await frame(shots[detail?3:1],1050,190,560,1100,true);
  }else if(detail){
    content+=await frame(shots[2],90,90,1230,1260);
    content+=await frame(phoneShots[1],1390,90,440,1250,true);
  }else{
    content+=await frame(shots[0],100,180,1530,1120);
    content+=await frame(phoneShots[2],1450,530,390,820,true);
  }
  const dir=path.join(root,'public/assets/work/office-tools');fs.mkdirSync(dir,{recursive:true});
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1440">${content}</svg>`)).webp({quality:88}).toFile(path.join(dir,`${slug}-${detail?'detail':'cover'}.webp`));
}
(async()=>{for(const slug of names){const shots=await Promise.all([1,2,3,4].map(i=>shot(slug,i))),mobile=slug==='parking'?shots:await Promise.all([1,2,3,4].map(i=>shot(slug+'-mobile',i)));await artwork(slug,shots,mobile,false);await artwork(slug,shots,mobile,true);}console.log('Built three thumbnails and three editable case detail images. No motion generated.');})().catch(error=>{console.error(error);process.exitCode=1;});
