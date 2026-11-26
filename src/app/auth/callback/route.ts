import { type NextRequest, NextResponse } from 'next/server';

import { CUSTOMER_TOKEN_COOKIE, CUSTOMER_TOKEN_MAX_AGE } from '@lib/auth-cookie';
import { storefrontEnv } from '@lib/env';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')?.trim();
  const error = req.nextUrl.searchParams.get('error')?.trim();

  if (error || !token) {
    const loginUrl = new URL('/login', req.url);
    if (error) loginUrl.searchParams.set('error', error);
    else loginUrl.searchParams.set('error', 'google_failed');
    return NextResponse.redirect(loginUrl);
  }

  const nextPath = req.cookies.get('gg_auth_next')?.value;
  const safeNext =
    nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/account';

  const res = NextResponse.redirect(new URL(safeNext, req.url));
  res.cookies.set(CUSTOMER_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: storefrontEnv.IS_PROD,
    path: '/',
    maxAge: CUSTOMER_TOKEN_MAX_AGE,
  });
  res.cookies.delete('gg_auth_next');
  return res;
}
