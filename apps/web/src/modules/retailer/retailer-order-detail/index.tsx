'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRetailerOrderDetailQuery } from './hooks/use-retailer-order-detail-query';
import { ParcelBox } from './components/parcel-box';
import { ReceiptCard } from './components/receipt-card';
import { ReviewDrawer } from './components/review-drawer';
import type { OrderDetailItem } from './types';

type RetailerOrderDetailProps = {
  orderId: string;
};

export function RetailerOrderDetail({ orderId }: RetailerOrderDetailProps) {
  const { data: order, isLoading, isError, error } = useRetailerOrderDetailQuery(orderId);
  const [reviewItem, setReviewItem] = useState<OrderDetailItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRateItem = useCallback((item: OrderDetailItem) => {
    setReviewItem(item);
    setDrawerOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-400">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-lg">Order details load ho rahay hain...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="px-4 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center dark:border-red-900 dark:bg-red-950/30">
          <p className="text-lg font-medium text-red-600 dark:text-red-400">
            {error?.message ?? 'Order details load nahi ho sakay'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 px-3 py-4 sm:px-6">
      {/* Back button + order header */}
      <div className="flex items-center gap-3">
        <Link
          href="/profile/orders"
          className="flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-white transition-colors active:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {order.displayId}
          </h1>
          <p className="text-xs text-neutral-400">
            {new Date(order.createdAt).toLocaleDateString('en-PK', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Delivery address */}
      <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          📍 Delivery Address
        </p>
        <p className="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {order.shippingName}
        </p>
        <p className="text-xs text-neutral-500">
          {order.shippingAddress}, {order.shippingCity}
        </p>
        <p className="text-xs text-neutral-500">{order.shippingPhone}</p>
      </div>

      {/* Parcel boxes */}
      {order.subOrders.map((sub, i) => (
        <ParcelBox
          key={sub.id}
          subOrder={sub}
          index={i}
          onRateItem={handleRateItem}
        />
      ))}

      {/* Receipt */}
      <ReceiptCard order={order} />

      {/* Review drawer */}
      <ReviewDrawer
        item={reviewItem}
        orderId={orderId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
