import { NextRequest,NextResponse } from 'next/server';
import { cmsAccess,cmsError } from './cms-http';
import { getWorks } from './db/works';
export async function legacyRead(){const denied=await cmsAccess();if(denied)return denied;try{return NextResponse.json({items:(await getWorks()).items,editor:'/admintgadink/dashboard/works'},{headers:{'Cache-Control':'no-store'}});}catch(error){return cmsError(error);}}
export async function legacyWrite(request:NextRequest){const denied=await cmsAccess(request);return denied||NextResponse.json({error:'Editor lama sudah dipindahkan. Gunakan menu Works.',editor:'/admintgadink/dashboard/works'},{status:410});}
