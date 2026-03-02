'use client';

import Image from 'next/image';
import type { OrderDetailSubOrder, OrderDetailItem } from '../../types';

const DEFAULT_STATUS = {
  label: 'Processing',
  color: 'bg-amber-100 text-amber-700',
  emoji: '🟡',
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; emoji: string }
> = {
  pending: DEFAULT_STATUS,
  packed: { label: 'Packed', color: 'bg-blue-100 text-blue-700', emoji: '📦' },
  handed_to_courier: {
    label: 'Shipped',
    color: 'bg-indigo-100 text-indigo-700',
    emoji: '🚚',
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-emerald-100 text-emerald-700',
    emoji: '✅',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700',
    emoji: '❌',
  },
};

type ParcelBoxProps = {
  subOrder: OrderDetailSubOrder;
  index: number;
  onRateItem: (item: OrderDetailItem) => void;
};

export function ParcelBox({ subOrder, index, onRateItem }: ParcelBoxProps) {
  const isCancelled = subOrder.status === 'cancelled';
  const isDelivered = subOrder.status === 'delivered';
  const statusInfo = STATUS_CONFIG[subOrder.status] ?? DEFAULT_STATUS;

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        isCancelled
          ? 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20'
          : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950'
      }`}
    >
      {/* Parcel header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          📦 Parcel {index + 1}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.color}`}
        >
          {statusInfo.emoji} {statusInfo.label}
        </span>
      </div>

      {/* Item list */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {subOrder.items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              isCancelled ? 'opacity-50' : ''
            }`}
          >
            {/* Product thumbnail */}
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-700">
              {item.product.imageUrl ? (
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="object-cover"
                  fill
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-neutral-100 text-xs text-neutral-400 dark:bg-neutral-800">
                  ?
                </div>
              )}
            </div>

            {/* Item info */}
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm font-medium ${
                  isCancelled
                    ? 'text-neutral-400 line-through'
                    : 'text-neutral-900 dark:text-neutral-100'
                }`}
              >
                {item.product.name}
              </p>
              <p className="text-xs text-neutral-400">
                {item.quantity} x Rs. {item.unitPrice.toLocaleString()}
              </p>
            </div>

            {/* Price or rate button */}
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-sm font-bold ${
                  isCancelled
                    ? 'text-neutral-400 line-through'
                    : 'text-neutral-900 dark:text-neutral-100'
                }`}
              >
                Rs. {item.totalPrice.toLocaleString()}
              </span>
              {isDelivered &&
                !isCancelled &&
                (item.isReviewed ? (
                  <span className="text-xs font-medium text-emerald-600">
                    ✅ Rated
                  </span>
                ) : (
                  <button
                    onClick={() => onRateItem(item)}
                    className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 transition-colors active:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400"
                  >
                    🌟 Rate
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
