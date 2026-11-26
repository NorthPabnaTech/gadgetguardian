import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@components/icon/icon';
import { Button } from '@components/ui/button';
import { getCustomerMe } from '@lib/storefront-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Order placed', robots: { index: false } };

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const [{ orderNumber }, user] = await Promise.all([params, getCustomerMe()]);
  const normalizedNumber = decodeURIComponent(orderNumber).toUpperCase();

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-xl text-center">
        <span className="animate-pop bg-noir text-brand-300 mx-auto grid size-20 place-items-center rounded-full">
          <Icon name="checkCircle" size={38} />
        </span>
        <h1 className="type-display text-ink mt-6">
          {user?.name ? `Thank you, ${user.name.split(' ')[0]}!` : 'Thank you for your order!'}
        </h1>
        <p className="text-muted mt-3">
          Your order has been placed. We’ll call you shortly to confirm it before shipping.
        </p>

        <div className="bg-cream mt-8 rounded-3xl py-6">
          <p className="text-muted text-xs tracking-wide uppercase">Order number</p>
          <p className="text-ink mt-1 text-xl font-bold">{normalizedNumber}</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="noir" size="xl" asChild>
            <Link href={user ? '/account/orders' : `/track-order?order=${normalizedNumber}`}>
              {user ? 'View my orders' : 'Track this order'}
            </Link>
          </Button>
          <Button variant="secondary" size="xl" asChild>
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
