'use client';

import Link from 'next/link';
import type { RetailerOrder } from '../../types';
import Image from 'next/image';

function getRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Abhi abhi';
  if (minutes < 60) return `${minutes} min pehle`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ghante pehle`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Kal';
  return `${days} din pehle`;
}

function getStatusSummary(order: RetailerOrder) {
  const statuses = order.subOrders.map((s) => s.status);
  if (statuses.every((s) => s === 'delivered'))
    return { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700' };
  if (statuses.every((s) => s === 'cancelled'))
    return { label: 'Cancelled', color: 'bg-red-100 text-red-700' };
  if (statuses.some((s) => s === 'handed_to_courier'))
    return { label: 'Shipped', color: 'bg-blue-100 text-blue-700' };
  if (statuses.some((s) => s === 'packed'))
    return { label: 'Packing', color: 'bg-amber-100 text-amber-700' };
  return { label: 'Processing', color: 'bg-amber-100 text-amber-700' };
}

// Collect all unique product images from all sub-orders
function getAllThumbnails(order: RetailerOrder) {
  const seen = new Set<string>();
  const thumbnails: { url: string; name: string }[] = [];
  for (const sub of order.subOrders) {
    for (const item of sub.items) {
      if (item.product.imageUrl && !seen.has(item.product.imageUrl)) {
        seen.add(item.product.imageUrl);
        thumbnails.push({
          url: item.product.imageUrl,
          name: item.product.name,
        });
      }
    }
  }
  return thumbnails;
}

export function OrderCard({ order }: { order: RetailerOrder }) {
  const thumbnails = getAllThumbnails(order);
  const statusInfo = getStatusSummary(order);

  return (
    <Link
      href={`/profile/orders/${order.id}`}
      className="block rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow active:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {order.displayId}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Overlapping circular thumbnails */}
      <div className="mt-3 flex items-center">
        <div className="flex -space-x-3">
          {thumbnails.slice(0, 5).map((thumb, i) => (
            <div
              key={thumb.url}
              className="relative size-11 overflow-hidden rounded-full border-2 border-white shadow-sm dark:border-neutral-900"
              style={{ zIndex: 10 - i }}
            >
              <Image
                src={thumb.url}
                alt={thumb.name}
                className="object-cover"
                fill
              />
            </div>
          ))}
          {thumbnails.length > 5 && (
            <div
              className="relative flex size-11 items-center justify-center rounded-full border-2 border-white bg-neutral-100 text-xs font-bold text-neutral-500 dark:border-neutral-900 dark:bg-neutral-800 dark:text-neutral-400"
              style={{ zIndex: 4 }}
            >
              +{thumbnails.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Footer: amount + time */}
      <div className="mt-3 flex items-end justify-between">
        <span className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
          Rs. {order.grandTotal.toLocaleString()}
        </span>
        <span className="text-xs text-neutral-400">
          {getRelativeTime(order.createdAt)}
        </span>
      </div>
    </Link>
  );
}
