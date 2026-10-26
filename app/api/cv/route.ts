import { NextRequest,NextResponse } from 'next/server';
import { getPublicSite,getSiteDocument } from '@/lib/db/site';
import { verifyAdminSession } from '@/lib/auth/session';
import { cvPDF } from '@/lib/cv-pdf';
import fs from 'node:fs/promises';
import path from 'node:path';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
  const preview=request.nextUrl.searchParams.get('preview')==='1';
  if(preview&&!await verifyAdminSession())return NextResponse.json({error:'Unauthorized'},{status:401});
  const {cv,values}=preview?(await getSiteDocument()).draft:await getPublicSite();
  if(cv.pdf==='/assets/cv/cv-gading-utama-2026.pdf'){
    const original=await fs.readFile(path.join(process.cwd(),'public/assets/cv/cv-gading-utama-2026.pdf'));
    return new NextResponse(new Uint8Array(original),{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="CV Gading Utama 2026.pdf"','Cache-Control':'no-store','Content-Length':String(original.length)}});
  }
  if(cv.pdf)return NextResponse.redirect(cv.pdf.startsWith('/')?new URL(cv.pdf,request.url):cv.pdf);
  const lines=[cv.name,cv.role,'','PROFILE',cv.profile,'','SELECTED EXPERIENCE',...cv.experience.flatMap(item=>[item.title,item.period,item.description,'']),'EDUCATION',...(cv.education||[]).flatMap(item=>[item.title,item.period,item.description,'']),'CAPABILITIES',cv.capabilities,'LANGUAGES',cv.languages||'','','CONTACT',cv.phone||'',cv.email||'',cv.website||'',cv.location||'',values.whatsapp,values.instagram];
  return new NextResponse(cvPDF(lines),{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="R-Gading-Utama-CV.pdf"','Cache-Control':'no-store'}});
}
