interface RateLimitEntry {
  attempts: number;
  lockoutUntil: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const WINDOW_MS = 3 * 60 * 1000; // 3 minutes

export function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; retryAfterSeconds?: number } {
  // In development, never lock out the developer
  if (process.env.NODE_ENV !== 'production') {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if locked out
  if (entry.lockoutUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.lockoutUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // If lockout expired, reset
  if (entry.lockoutUntil > 0 && entry.lockoutUntil <= now) {
    rateLimitMap.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  return { allowed: entry.attempts < MAX_ATTEMPTS, remainingAttempts: Math.max(0, MAX_ATTEMPTS - entry.attempts) };
}

export function recordFailedAttempt(identifier: string): { remainingAttempts: number; lockedOut: boolean } {
  if (process.env.NODE_ENV !== 'production') {
    return { remainingAttempts: MAX_ATTEMPTS, lockedOut: false };
  }

  const now = Date.now();
  const entry = rateLimitMap.get(identifier) || { attempts: 0, lockoutUntil: 0 };

  entry.attempts += 1;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockoutUntil = now + LOCKOUT_DURATION_MS;
    rateLimitMap.set(identifier, entry);
    return { remainingAttempts: 0, lockedOut: true };
  }

  rateLimitMap.set(identifier, entry);

  // Clean up after window
  setTimeout(() => {
    const current = rateLimitMap.get(identifier);
    if (current && current.lockoutUntil === 0) {
      rateLimitMap.delete(identifier);
    }
  }, WINDOW_MS);

  return { remainingAttempts: MAX_ATTEMPTS - entry.attempts, lockedOut: false };
}

export function resetRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}
