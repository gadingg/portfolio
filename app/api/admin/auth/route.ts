import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPin } from '@/lib/auth/pin';
import { createAdminSession } from '@/lib/auth/session';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/auth/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Please try again in ${rateCheck.retryAfterSeconds || 600} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json({ error: 'PIN is required.' }, { status: 400 });
    }

    const isValid = await verifyAdminPin(pin);

    if (!isValid) {
      const failInfo = recordFailedAttempt(ip);
      return NextResponse.json(
        {
          error: failInfo.lockedOut
            ? 'Too many failed attempts. Account temporarily locked for 10 minutes.'
            : 'Invalid access PIN.',
        },
        { status: 401 }
      );
    }

    // Reset rate limit on success
    resetRateLimit(ip);

    // Create session cookie
    await createAdminSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
