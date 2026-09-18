import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  return to;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  let isAdmin = false;

  if (url && key && allowedEmail) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    const { data, error } = await supabase.auth.getUser();
    isAdmin = !error && data.user?.email?.toLowerCase() === allowedEmail;
  }

  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admintgadink/dashboard') && !isAdmin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admintgadink';
    loginUrl.search = '';
    return copyCookies(response, NextResponse.redirect(loginUrl));
  }

  if (pathname === '/admintgadink' && isAdmin) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/admintgadink/dashboard';
    return copyCookies(response, NextResponse.redirect(dashboardUrl));
  }

  return response;
}

export const config = {
  matcher: ['/admintgadink/:path*', '/api/admin/:path*'],
};
