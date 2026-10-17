import { NextRequest,NextResponse } from 'next/server';
import { destroyAdminSession } from '@/lib/auth/session';
import { sameOrigin } from '@/lib/cms-http';

export async function POST(request:NextRequest) {
  if(!sameOrigin(request))return NextResponse.json({error:'Permintaan tidak diizinkan.'},{status:403});
  try {await destroyAdminSession();return NextResponse.json({success:true});}
  catch {return NextResponse.json({error:'Belum bisa keluar. Coba lagi.'},{status:503});}
}
