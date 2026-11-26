import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Callout } from '@components/shared/callout';
import { SITE } from '@config/site';
import { safeRedirectPath } from '@lib/safe-redirect';
import { param, type SearchParams } from '@lib/search-params';
import { getCustomerMe } from '@lib/storefront-client';

import { GoogleAuthButton } from '../components/google-auth-button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } };

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_cancelled: 'Google sign-in was cancelled.',
  google_state_invalid: 'Google sign-in session expired. Please try again.',
  google_token_failed: 'Could not verify your Google account. Please try again.',
  google_profile_failed: 'Could not read your Google profile. Please try again.',
  account_disabled: 'Your account has been disabled. Please contact support.',
  google_auth_error: 'Google sign-in failed. Please try again.',
  google_not_configured: 'Google sign-in is not configured yet.',
  google_email_unverified: 'Your Google email is not verified. Please verify it with Google first.',
  google_account_mismatch: 'This email is linked to a different Google account.',
  google_failed: 'Sign-in failed. Please try again.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const next = param(sp, 'next');
  const errorCode = param(sp, 'error');
  const errorMessage = errorCode
    ? (GOOGLE_ERROR_MESSAGES[errorCode] ?? 'Sign-in failed. Please try again.')
    : undefined;

  const user = await getCustomerMe();
  if (user) {
    redirect(safeRedirectPath(next) ?? '/account');
  }

  if (!errorCode) {
    redirect(next ? `/api/auth/google?next=${encodeURIComponent(next)}` : '/api/auth/google');
  }

  return (
    <>
      <h1 className="type-display text-ink">Welcome back</h1>
      <p className="text-muted mt-2 text-sm">
        Sign in to your {SITE.name} account to view your orders and check out faster.
      </p>
      {errorMessage && (
        <Callout tone="danger" className="mt-4">
          {errorMessage}
        </Callout>
      )}
      <GoogleAuthButton next={next} />
    </>
  );
}
