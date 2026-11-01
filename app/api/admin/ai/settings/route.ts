import { NextRequest,NextResponse } from 'next/server';
import { z } from 'zod';
import { cmsAccess } from '@/lib/cms-http';
import { aiModelSchema, getAISettings, getAISettingsStatus, saveAISettings } from '@/lib/ai-settings';
import { AIProviderError,testGemini } from '@/lib/gemini-study';

export const dynamic='force-dynamic';
export const maxDuration=30;
const headers={'Cache-Control':'no-store'};
const inputSchema=z.object({action:z.enum(['save','test','delete']),apiKey:z.string().trim().min(20).max(500).regex(/^[A-Za-z0-9_-]+$/).optional(),model:aiModelSchema.optional()});
export async function GET(){
  const denied=await cmsAccess();if(denied)return denied;
  try{return NextResponse.json(await getAISettingsStatus(),{headers});}
  catch{return NextResponse.json({error:'Pengaturan AI belum bisa dimuat. Periksa koneksi server.'},{status:503,headers});}
}
export async function POST(request:NextRequest){
  const denied=await cmsAccess(request,4096);if(denied)return denied;
  try{
    const raw=await request.text();if(Buffer.byteLength(raw)>4096)return NextResponse.json({error:'Isian terlalu panjang.'},{status:413,headers});
    const input=inputSchema.parse(JSON.parse(raw));
    // A replacement key can recover settings encrypted with an older server secret.
    const current=await getAISettings().catch(error=>{if(!input.apiKey&&input.action!=='delete')throw error;return {apiKey:'',model:'gemini-3.8-flash',updatedAt:''};});
    const settings={apiKey:input.action==='delete'?'':input.apiKey||current.apiKey,model:input.model||current.model};
    if(input.action==='test'){await testGemini(settings);return NextResponse.json({ok:true,message:'Koneksi Gemini berhasil. Model menerima permintaan.'},{headers});}
    if(input.action==='save'&&!settings.apiKey)return NextResponse.json({error:'Masukkan Gemini API key terlebih dahulu.'},{status:400,headers});
    return NextResponse.json(await saveAISettings(settings),{headers});
  }catch(error){
    const message=error instanceof AIProviderError?error.message:error instanceof z.ZodError?'Periksa API key dan ID model Anda.':error instanceof SyntaxError?'Format permintaan tidak valid.':'Pengaturan belum tersimpan. Periksa koneksi penyimpanan server.';
    return NextResponse.json({error:message},{status:error instanceof AIProviderError?error.status:error instanceof z.ZodError||error instanceof SyntaxError?400:503,headers});
  }
}
