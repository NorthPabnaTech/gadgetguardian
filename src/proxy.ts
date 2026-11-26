import { type NextRequest, NextResponse } from 'next/server';

import { CUSTOMER_TOKEN_COOKIE } from '@lib/auth-cookie';

/**
 * Optimistic route protection: bounce visitors without a storefront customer
 * token cookie before rendering `/account/*`.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(CUSTOMER_TOKEN_COOKIE)?.value?.trim();

  if (!token) {
    const url = new URL('/api/auth/google', request.url);
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*'],
};
