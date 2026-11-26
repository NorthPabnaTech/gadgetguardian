'use client';

import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import { storefrontEnv } from '@lib/env';
import { toast } from '@lib/toast';

export function startGoogleLogin(next?: string) {
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    document.cookie = `gg_auth_next=${encodeURIComponent(next)}; path=/; SameSite=Lax; max-age=600`;
  }
  const callbackUrl = `${window.location.origin}/auth/callback`;
  const target = `${storefrontEnv.API_BASE_URL}/api/storefront/auth/google?redirect_uri=${encodeURIComponent(callbackUrl)}`;
  window.location.assign(target);
}

export type StorefrontResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function storefrontRequest<T>(
  path: string,
  options?: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown },
): Promise<StorefrontResponse<T>> {
  try {
    const res = await fetch(`/api/storefront${path}`, {
      method: options?.method ?? 'GET',
      headers: options?.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
    });
    const json = (await res.json().catch(() => null)) as StorefrontResponse<T> | null;
    if (!json) {
      return { ok: false, error: `Request failed (${res.status})` };
    }
    return json;
  } catch {
    return { ok: false, error: 'Network error. Please try again.' };
  }
}

export function applyStorefrontErrors<TData, TForm extends FieldValues>(
  res: StorefrontResponse<TData>,
  form?: UseFormReturn<TForm>,
): res is { ok: true; data: TData } {
  if (res.ok) return true;
  if (res.fieldErrors && form) {
    for (const [field, msg] of Object.entries(res.fieldErrors)) {
      form.setError(field as Path<TForm>, { message: msg });
    }
  }
  toast.error(res.error);
  return false;
}
