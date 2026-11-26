import { type NextRequest, NextResponse } from 'next/server';

import { storefrontEnv } from '@lib/env';

export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get('next');
  const callbackUrl = `${req.nextUrl.origin}/auth/callback`;
  const target = `${storefrontEnv.API_BASE_URL}/api/storefront/auth/google?redirect_uri=${encodeURIComponent(callbackUrl)}`;

  const res = NextResponse.redirect(target);
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    res.cookies.set('gg_auth_next', next, {
      path: '/',
      sameSite: 'lax',
      maxAge: 600,
    });
  }
  return res;
}
