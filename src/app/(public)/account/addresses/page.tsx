import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getCustomerMe, getMyAddresses } from '@lib/storefront-client';

import { AddressBook } from './components/address-book';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Addresses' };

export default async function AddressesPage() {
  const user = await getCustomerMe();
  if (!user) redirect('/api/auth/google?next=/account/addresses');

  const addresses = await getMyAddresses();

  return (
    <section className="border-line rounded-3xl border bg-white p-6 sm:p-8">
      <AddressBook addresses={addresses} userName={user.name} userPhone={user.phone} />
    </section>
  );
}
