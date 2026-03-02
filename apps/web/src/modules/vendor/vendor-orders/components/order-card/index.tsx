'use client';

import Image from 'next/image';
import { Package, Truck } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import type { VendorSubOrder } from '../../types';

type OrderCardProps = {
  order: VendorSubOrder;
  onAdvance: (subOrderId: string) => void;
  isPending: boolean;
};

const STATUS_ACTION: Record<
  string,
  { label: string; icon: typeof Package } | null
> = {
  pending: { label: 'Pack Kar Liya', icon: Package },
  packed: { label: 'Courier Ko De Diya', icon: Truck },
  handed_to_courier: null,
};

function formatPrice(cents: number) {
  return `Rs. ${Math.round(cents / 100).toLocaleString()}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Abhi abhi';
  if (mins < 60) return `${mins} min pehle`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ghante pehle`;
  return `${Math.floor(hrs / 24)} din pehle`;
}

export function OrderCard({ order, onAdvance, isPending }: OrderCardProps) {
  const action = STATUS_ACTION[order.status];

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-neutral-300 bg-white shadow-md dark:border-neutral-600 dark:bg-neutral-900">
      {/* Receipt header */}
      <div className="border-b border-dashed border-neutral-200 px-4 py-3 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <span className="font-mono text-base font-bold tracking-wide text-neutral-700 dark:text-neutral-300">
            {order.orderDisplayId}
          </span>
          <span className="text-sm text-neutral-500">
            {timeAgo(order.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          {order.shippingName} &middot; {order.shippingCity}
        </p>
      </div>

      {/* Line items */}
      <div className="divide-y divide-dashed divide-neutral-100 px-4 dark:divide-neutral-800">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border bg-neutral-50 dark:bg-neutral-800">
              {item.product.imageUrl ? (
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-2xl">
                  📦
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base text-neutral-600 dark:text-neutral-400">
                {item.product.name}
              </p>
              <p className="mt-0.5 font-mono text-sm text-neutral-400">
                {formatPrice(item.unitPrice)} each
              </p>
            </div>
            <div className="text-right">
              <span className="block font-mono text-4xl leading-none font-extrabold tracking-tight">
                {item.quantity}
              </span>
              <span className="text-xs text-neutral-400">qty</span>
            </div>
          </div>
        ))}
      </div>

      {/* Receipt total */}
      <div className="border-t border-dashed border-neutral-200 px-4 py-3 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-neutral-500">
            COD Total
          </span>
          <span className="font-mono text-xl font-bold">
            {formatPrice(order.codAmount)}
          </span>
        </div>
      </div>

      {/* Action button */}
      {action && (
        <div className="px-4 pb-4">
          <Button
            className="h-14 w-full text-lg font-bold"
            size="lg"
            disabled={isPending}
            onClick={() => onAdvance(order.id)}
          >
            {isPending ? (
              <span className="animate-pulse">Updating...</span>
            ) : (
              <>
                <action.icon className="mr-2 size-5" />
                {action.label}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Receipt zigzag bottom */}
      <div
        className="h-3 w-full bg-neutral-100 dark:bg-neutral-800"
        style={{
          maskImage:
            'conic-gradient(from 135deg at 50% 50%, transparent 25%, black 25%) 0 0 / 12px 12px',
          WebkitMaskImage:
            'conic-gradient(from 135deg at 50% 50%, transparent 25%, black 25%) 0 0 / 12px 12px',
        }}
      />
    </div>
  );
}
