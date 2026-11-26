import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getCustomerMe } from '@lib/storefront-client';

import { ProfileForm } from './components/profile-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'My account' };

export default async function AccountPage() {
  const user = await getCustomerMe();
  if (!user) redirect('/api/auth/google?next=/account');

  return (
    <section className="border-line rounded-3xl border bg-white p-6 sm:p-8">
      <h2 className="text-ink text-lg font-semibold">Profile</h2>
      <p className="text-muted mt-1 text-sm">Update your name and mobile number.</p>
      <ProfileForm user={user} />
    </section>
  );
}
