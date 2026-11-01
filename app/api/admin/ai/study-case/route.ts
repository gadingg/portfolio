import { NextRequest,NextResponse } from 'next/server';
import { z } from 'zod';
import { cmsAccess } from '@/lib/cms-http';
import { AIGenerateSchema,AIApplySchema } from '@/lib/ai-study';
import { AIProviderError,generateAIStudy } from '@/lib/gemini-study';
import { applyAIStudy, AIApplyError } from '@/lib/ai-apply';
import { getWorksDocument,changeWorks } from '@/lib/db/works';
import { CMSConflict } from '@/lib/db/cms';

export const dynamic='force-dynamic';
export const maxDuration=60;
const headers={'Cache-Control':'no-store'};
let generating=false;
export async function POST(request:NextRequest){
  const denied=await cmsAccess(request,200000);if(denied)return denied;
  let locked=false;
  try{
    const raw=await request.text();if(Buffer.byteLength(raw)>200000)return NextResponse.json({error:'Catatan terlalu panjang.'},{status:413,headers});
    const body=JSON.parse(raw);
    if(body.action==='apply'){
      const input=AIApplySchema.parse(body),doc=await getWorksDocument();
      if(doc.revision!==input.revision)throw new CMSConflict();
      const next=applyAIStudy(doc.draft.items,input);
      const saved=await changeWorks({action:'save',revision:doc.revision,items:next.items});
      return NextResponse.json({id:next.id,revision:saved.revision,item:saved.draft.items.find(item=>item.id===next.id)},{headers});
    }
    if(body.action!=='generate')return NextResponse.json({error:'Aksi tidak dikenal.'},{status:400,headers});
    const input=AIGenerateSchema.parse(body);
    if(generating)return NextResponse.json({error:'Masih ada proses generate. Tunggu sampai selesai.'},{status:429,headers});
    generating=true;locked=true;
    return NextResponse.json(await generateAIStudy(input.brief,input.target,input.current),{headers});
  }catch(error){
    if(error instanceof CMSConflict)return NextResponse.json({error:error.message},{status:409,headers});
    if(error instanceof AIProviderError)return NextResponse.json({error:error.message},{status:error.status,headers});
    if(error instanceof AIApplyError)return NextResponse.json({error:error.message},{status:400,headers});
    if(error instanceof z.ZodError)return NextResponse.json({error:error.issues[0]?.message||'Periksa isian draft.'},{status:400,headers});
    if(error instanceof SyntaxError)return NextResponse.json({error:'Format data tidak valid.'},{status:400,headers});
    return NextResponse.json({error:'Draft belum bisa diproses. Muat ulang daftar jika data berubah, lalu coba lagi.'},{status:503,headers});
  }finally{if(locked)generating=false;}
}
