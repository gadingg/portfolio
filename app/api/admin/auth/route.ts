import { NextRequest, NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/auth/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createHash } from 'node:crypto';
import { sameOrigin } from '@/lib/cms-http';

const INVALID_CREDENTIALS = 'Email atau password belum cocok. Coba cek lagi.';

export async function POST(request: NextRequest) {
  if(!sameOrigin(request))return NextResponse.json({error:'Permintaan tidak diizinkan.'},{status:403});
  if(!process.env.ADMIN_EMAIL)return NextResponse.json({error:'Email admin belum dikonfigurasi.'},{status:503});
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const attemptKey=createHash('sha256').update(`${process.env.ADMIN_SESSION_SECRET||'portfolio'}:${ip}`).digest('hex');
  const {data:attempts,error:limitError}=await createAdminClient().rpc('portfolio_login_attempt',{attempt_key:attemptKey});
  if(limitError)return NextResponse.json({error:'Login belum tersedia. Coba lagi nanti.'},{status:503});
  if(Number(attempts)>10)return NextResponse.json({error:'Terlalu banyak percobaan. Coba lagi dalam 5 menit.'},{status:429,headers:{'Retry-After':'300'}});
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Isi email dan password dulu, ya.' }, { status: 400 });
    }

    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !isAdminEmail(data.user?.email)) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: INVALID_CREDENTIALS },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin authentication failed:', error);
    return NextResponse.json({ error: 'Belum bisa masuk. Coba lagi sebentar.' }, { status: 500 });
  }
}
