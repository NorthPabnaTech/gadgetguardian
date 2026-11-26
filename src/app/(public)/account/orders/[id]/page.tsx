import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import {
  OrderItemsList,
  OrderProgress,
  OrderStatusBadge,
  OrderTotals,
  ReturnStatusBadge,
  ShippingAddressBlock,
} from '@/features/orders/order-ui';
import { Icon } from '@components/icon/icon';
import { Badge } from '@components/ui/badge';
import { SITE } from '@config/site';
import { PAYMENT_METHOD_LABELS } from '@lib/constants';
import { getCustomerMe, getMyOrderDetail } from '@lib/storefront-client';
import { formatStoreDate, formatStoreDateTime } from '@lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Order details' };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCustomerMe();
  if (!user) redirect(`/api/auth/google?next=${encodeURIComponent(`/account/orders/${id}`)}`);

  const order = await getMyOrderDetail(id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="text-muted hover:text-ink inline-flex items-center gap-1.5 text-sm"
      >
        <Icon name="arrowLeft" size={14} /> All orders
      </Link>

      <section className="border-line rounded-3xl border bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-ink text-2xl">{order.orderNumber}</h2>
            <p className="text-muted text-sm">
              {order.invoiceNumber} · Placed {formatStoreDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        <div className="mt-8">
          <OrderProgress order={order} />
        </div>
      </section>

      {order.returnRequest && (
        <section className="border-line rounded-3xl border bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-ink font-semibold">Return request</h3>
            <ReturnStatusBadge status={order.returnRequest.status} />
          </div>
          <p className="text-muted mt-2 text-sm">
            {order.returnRequest.reason} · requested{' '}
            {formatStoreDate(order.returnRequest.createdAt)}
          </p>
          {order.returnRequest.adminNote && (
            <p className="bg-cream text-ink mt-4 rounded-2xl px-4 py-3 text-sm">
              <span className="font-semibold">{SITE.name}:</span> {order.returnRequest.adminNote}
            </p>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="border-line rounded-3xl border bg-white p-6 sm:p-8">
          <h3 className="text-ink font-semibold">Items</h3>
          <OrderItemsList order={order} />
        </section>
        <div className="space-y-6">
          <section className="border-line rounded-3xl border bg-white p-6">
            <h3 className="text-ink mb-4 font-semibold">Summary</h3>
            <OrderTotals order={order} />
            <div className="border-line mt-4 flex items-center justify-between gap-2 border-t pt-3 text-xs">
              <span className="text-muted">
                Payment: {PAYMENT_METHOD_LABELS[order.paymentMethod]}
              </span>
              <Badge
                tone={
                  order.paymentStatus === 'paid'
                    ? 'ok'
                    : order.paymentStatus === 'refunded'
                      ? 'neutral'
                      : 'warn'
                }
              >
                {order.paymentStatus === 'paid'
                  ? 'Paid'
                  : order.paymentStatus === 'refunded'
                    ? 'Refunded'
                    : 'Unpaid'}
              </Badge>
            </div>
          </section>
          <section className="border-line rounded-3xl border bg-white p-6">
            <h3 className="text-ink mb-3 font-semibold">Delivery address</h3>
            <ShippingAddressBlock order={order} />
            {order.customerNote && (
              <p className="text-muted mt-3 text-sm">Note: {order.customerNote}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
