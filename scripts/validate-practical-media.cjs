const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const names=['prompt','prompt-mobile','followup','followup-mobile','rekapella','rekapella-mobile'];
const report=names.map(name=>{
 const file=path.join('public/assets/motion',name+'.mp4'),bytes=fs.readFileSync(file),probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file],{encoding:'utf8'})),stream=probe.streams[0];
 const frame=args=>execFileSync('ffmpeg',['-v','error',...args,'-i',file,'-frames:v','1','-vf','scale=96:54','-f','rawvideo','-pix_fmt','rgb24','pipe:1']);
 const first=frame([]),last=frame(['-sseof','-0.034']);
 const difference=first.reduce((sum,value,i)=>sum+Math.abs(value-last[i]),0)/first.length;
 const item={name,bytes:bytes.length,duration:Number(probe.format.duration),width:stream.width,height:stream.height,fps:stream.r_frame_rate,codec:stream.codec_name,streams:probe.streams.length,faststart:bytes.indexOf(Buffer.from('moov'))<bytes.indexOf(Buffer.from('mdat')),loopDifference:Number(difference.toFixed(3))};
 if(item.duration!==12||item.codec!=='h264'||item.streams!==1||!item.faststart||!Number.isFinite(difference)||difference>1.5||item.bytes>15000000)throw Error(JSON.stringify(item));
 return item;
});
fs.mkdirSync('.impeccable/review',{recursive:true});fs.writeFileSync('.impeccable/review/practical-tools-encode.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
