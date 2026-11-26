import type { Metadata } from 'next';

import type { OrderDTO } from '@/types';
import { SITE } from '@config/site';
import { param, type SearchParams } from '@lib/search-params';
import { StorefrontApiError, trackStorefrontOrder } from '@lib/storefront-client';
import { trackOrderSchema } from '@lib/validators/order';

import { TrackOrderForm } from './components/track-order-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Track your order',
  description: `Check the delivery status of your ${SITE.name} order.`,
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const initialOrderNumber = (param(sp, 'orderNumber') ?? param(sp, 'order') ?? '').trim();
  const initialPhone = (param(sp, 'phone') ?? '').trim();

  let initialOrder: OrderDTO | null = null;
  let initialError: string | null = null;

  if (initialOrderNumber && initialPhone) {
    const parsed = trackOrderSchema.safeParse({
      orderNumber: initialOrderNumber,
      phone: initialPhone,
    });
    if (!parsed.success) {
      initialError = parsed.error.issues[0]?.message ?? 'Invalid tracking link parameters.';
    } else {
      try {
        initialOrder = await trackStorefrontOrder(parsed.data.orderNumber, parsed.data.phone);
        if (!initialOrder) {
          initialError = 'No order found with that number and phone.';
        }
      } catch (error) {
        if (error instanceof StorefrontApiError) {
          initialError = error.message;
        } else {
          initialError = 'Unable to track order right now.';
        }
      }
    }
  }

  return (
    <div className="container-page max-w-3xl py-14">
      <div className="text-center">
        <p className="text-accent text-[11px] font-bold tracking-[0.22em] uppercase">
          Order tracking
        </p>
        <h1 className="type-display text-ink mt-2">Where’s my order?</h1>
        <p className="text-muted mx-auto mt-3 max-w-md">
          Enter your order number and the mobile number you used at checkout.
        </p>
      </div>
      <TrackOrderForm
        initialOrderNumber={initialOrderNumber}
        initialPhone={initialPhone}
        initialOrder={initialOrder}
        initialError={initialError}
      />
    </div>
  );
}
