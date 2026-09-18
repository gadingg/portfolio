import { NextRequest, NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/auth/session';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/auth/rate-limit';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const INVALID_CREDENTIALS = 'Email or password is incorrect.';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const rateCheck = checkRateLimit(ip);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rateCheck.retryAfterSeconds || 600} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    if (!isAdminEmail(email)) {
      recordFailedAttempt(ip);
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !isAdminEmail(data.user?.email)) {
      await supabase.auth.signOut();
      const failInfo = recordFailedAttempt(ip);
      return NextResponse.json(
        { error: failInfo.lockedOut ? 'Too many attempts. Try again in 10 minutes.' : INVALID_CREDENTIALS },
        { status: 401 }
      );
    }

    resetRateLimit(ip);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin authentication failed:', error);
    return NextResponse.json({ error: 'Unable to sign in right now.' }, { status: 500 });
  }
}
