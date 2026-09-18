import { createServerSupabaseClient } from '@/lib/supabase/server';

function configuredAdminEmail(): string | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return email || null;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const allowedEmail = configuredAdminEmail();
  return Boolean(allowedEmail && email && email.toLowerCase() === allowedEmail);
}

export async function verifyAdminSession(): Promise<boolean> {
  const allowedEmail = configuredAdminEmail();
  if (!allowedEmail) return false;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    return !error && isAdminEmail(data.user?.email);
  } catch {
    return false;
  }
}

export async function destroyAdminSession(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
}
