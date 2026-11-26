import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

import { CUSTOMER_TOKEN_COOKIE } from '@lib/auth-cookie';
import { storefrontEnv } from '@lib/env';

async function proxyToBackend(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const subPath = path.map((s) => encodeURIComponent(s)).join('/');
  const search = req.nextUrl.search;
  const targetUrl = `${storefrontEnv.API_BASE_URL}/api/storefront/${subPath}${search}`;

  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_TOKEN_COOKIE)?.value?.trim();

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (storefrontEnv.STOREFRONT_API_KEY) {
    headers['x-storefront-key'] = storefrontEnv.STOREFRONT_API_KEY;
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text();
    if (body) {
      headers['Content-Type'] = req.headers.get('content-type') || 'application/json';
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Unable to reach storefront backend.' },
      { status: 502 },
    );
  }
}

export const GET = proxyToBackend;
export const POST = proxyToBackend;
export const PATCH = proxyToBackend;
export const DELETE = proxyToBackend;
