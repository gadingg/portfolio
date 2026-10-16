import { NextRequest,NextResponse } from 'next/server';
import { getPublicSite,getSiteDocument } from '@/lib/db/site';
import { verifyAdminSession } from '@/lib/auth/session';
import { cvPDF } from '@/lib/cv-pdf';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
  const preview=request.nextUrl.searchParams.get('preview')==='1';
  if(preview&&!await verifyAdminSession())return NextResponse.json({error:'Unauthorized'},{status:401});
  const {cv,values}=preview?(await getSiteDocument()).draft:await getPublicSite();
  if(cv.pdf)return NextResponse.redirect(cv.pdf.startsWith('/')?new URL(cv.pdf,request.url):cv.pdf);
  const lines=[cv.name,cv.role,'','PROFILE',cv.profile,'','SELECTED EXPERIENCE',...cv.experience.flatMap(item=>[item.title,item.period,item.description,'']),'CAPABILITIES',cv.capabilities,'','CONTACT',values.whatsapp,values.instagram];
  return new NextResponse(cvPDF(lines),{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="R-Gading-Utama-CV.pdf"','Cache-Control':'no-store'}});
}
