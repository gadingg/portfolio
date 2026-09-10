import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'gading_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const DEFAULT_SECRET = 'gading-portfolio-cms-super-secret-key-2026-very-secure';

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || DEFAULT_SECRET;
}

function signData(data: string): string {
  const secret = getSecretKey();
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return `${data}.${signature}`;
}

function verifySignature(signedToken: string): string | null {
  const parts = signedToken.split('.');
  if (parts.length !== 2) return null;

  const [data, signature] = parts;
  const secret = getSecretKey();
  const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('hex');

  if (signature.length !== expectedSig.length) return null;

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSig, 'hex')
  );

  return isValid ? data : null;
}

export async function createAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const payload = JSON.stringify({
    role: 'admin',
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  });

  const token = signData(payload);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return false;
  }

  const rawData = verifySignature(sessionCookie.value);
  if (!rawData) {
    return false;
  }

  try {
    const session = JSON.parse(rawData);
    if (session.role === 'admin' && session.expiresAt > Date.now()) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export { SESSION_COOKIE_NAME };
