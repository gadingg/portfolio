// Remove only the baked progress strip; the public player draws the themed replacement.
const path=require('node:path'),fs=require('node:fs'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
for(const name of ['metaads','metaads-mobile','dailyapp','dailyapp-mobile']){
 const mobile=name.endsWith('-mobile'),input=path.join(root,'public/assets/motion',name+'.mp4'),output=input.replace('.mp4','-clean.mp4');
 const region=mobile?'x=54:y=919:w=790:h=18':'x=90:y=844:w=420:h=18';
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-vf','drawbox='+region+':color=0x0b0c0b:t=fill','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-an',output],{stdio:'inherit'});
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss','0.1','-i',output,'-frames:v','1','-c:v','libwebp','-quality','88',output.replace('.mp4','.webp')],{stdio:'inherit'});
 const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration:stream=width,height','-of','json',output],{encoding:'utf8'}));
 if(Math.abs(Number(probe.format.duration)-12)>.05)throw Error('Unexpected duration '+name);
 console.log(name+': '+probe.streams[0].width+'x'+probe.streams[0].height+', '+probe.format.duration+'s, '+fs.statSync(output).size+' bytes');
}
