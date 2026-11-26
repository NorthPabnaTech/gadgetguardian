import { NextResponse } from 'next/server';

import { CUSTOMER_TOKEN_COOKIE } from '@lib/auth-cookie';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(CUSTOMER_TOKEN_COOKIE);
  return res;
}
