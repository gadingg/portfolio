import { getPublicSite } from '@/lib/db/site';
import { resolvePalette } from '@/lib/public-palette';
import { ImageResponse } from 'next/og';
export const alt='Gading Utama, Creative Marketing & Digital Solutions';
export const size={width:1200,height:630};
export const contentType='image/png';
export default async function Image(){const p=resolvePalette((await getPublicSite()).palette);return new ImageResponse(<div style={{display:'flex',flexDirection:'column',justifyContent:'space-between',padding:72,width:'100%',height:'100%',background:p.canvas,color:p.ink,fontFamily:'sans-serif'}}>
  <div style={{fontSize:28}}>Gading Utama · Creative Marketing & Digital Solutions</div>
  <div style={{display:'flex',flexDirection:'column',fontSize:86,fontWeight:700,letterSpacing:-3}}><span>I Think. I Create.</span><span style={{color:p.start}}>I Solve.</span></div>
  <div style={{fontSize:24}}>Visual, campaign, dan solusi digital yang benar-benar kepakai.</div>
</div>,size);}
