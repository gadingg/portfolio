import { z } from 'zod';
const hex=z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Gunakan HEX 6 digit, misalnya #5AB2F7.');
export const defaultPalette={canvas:'#0c0e10',surface:'#171a1d',ink:'#f3f0e8',secondary:'#b6b8ae',line:'#353a3e',controlLine:'#858a8e',start:'#5ab2f7',end:'#12cff3',buttonText:'#0c0e10',angle:110};
export const PaletteSchema=z.object({canvas:hex,surface:hex,ink:hex,secondary:hex,line:hex,controlLine:hex,start:hex,end:hex,buttonText:hex,angle:z.number().int().min(0).max(360)});
export type PublicPalette=z.infer<typeof PaletteSchema>;
export const resolvePalette=(value?:Partial<PublicPalette>)=>{const result=PaletteSchema.safeParse({...defaultPalette,...value});return result.success?result.data:defaultPalette;};
export function contrast(a:string,b:string){
 const luminance=(hex:string)=>hex.slice(1).match(/../g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
export function paletteContrast(p:PublicPalette){
 let minimum=21;
 const rgb=(hex:string)=>hex.slice(1).match(/../g)!.map(v=>parseInt(v,16));const a=rgb(p.start),b=rgb(p.end);
 for(let i=0;i<=100;i++){const color='#'+a.map((v,k)=>Math.round(v+(b[k]-v)*i/100).toString(16).padStart(2,'0')).join('');minimum=Math.min(minimum,contrast(color,p.buttonText));}
 return minimum;
}
export function paletteCSS(value?:Partial<PublicPalette>){
 const p=resolvePalette(value);
 return '.showcase{'+Object.entries({canvas:p.canvas,surface:p.surface,ink:p.ink,secondary:p.secondary,line:p.line,'control-line':p.controlLine,accent:p.start,'accent-end':p.end,'accent-text':p.buttonText,'accent-gradient':'linear-gradient('+p.angle+'deg,'+p.start+','+p.end+')'}).map(([key,value])=>'--'+key+':'+value).join(';')+'}';
}
