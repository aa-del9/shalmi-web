'use client';

import Image from 'next/image';
import { Check, Info, Package as PackageIcon } from 'lucide-react';
import dayjs from 'dayjs';

import { Stamp } from '@repo/ui/components/stamp';
import { cn } from '@repo/ui/lib/utils';

import { getSubOrderStatusDisplay } from '@/modules/core/utils/order-status-display';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';

import type { VendorSubOrder } from '../../types';

type OrderCardProps = {
  order: VendorSubOrder;
  onAdvance: (subOrderId: string) => void;
  isPending: boolean;
};

const STATUS_ACTION: Record<string, { label: string } | null> = {
  pending: { label: 'Packed' },
  packed: { label: 'Handed off' },
  handed_to_courier: null,
  delivered: null,
  cancelled: null,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

function totalWeightKg(order: VendorSubOrder): number {
  return Math.round((order.weightGrams / 1000) * 10) / 10;
}

function totalQuantity(order: VendorSubOrder): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function OrderCard({ order, onAdvance, isPending }: OrderCardProps) {
  const action = STATUS_ACTION[order.status] ?? null;
  const display = getSubOrderStatusDisplay(order.status);
  const weightKg = totalWeightKg(order);
  const itemCount = totalQuantity(order);
  const isPrimaryAction = order.status === 'pending';
  const placedAt = dayjs(order.createdAt).format('hh:mm A');

  return (
    <article
      className={cn(
        'overflow-hidden rounded-lg border bg-white',
        // Pencil emphasises the topmost packing card with a 2px ink stroke;
        // others use 1px rule. Approximate by upweighting the pending card.
        order.status === 'pending'
          ? 'border-2 border-ink'
          : 'border-rule'
      )}
    >
      {/* ===== Header (paper-2 strip) ===== */}
      <header className="flex flex-col gap-1.5 border-b border-rule bg-paper-2 px-5 py-4 md:px-7 md:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-base font-bold text-ink md:text-lg">
              Order {order.orderDisplayId}
            </span>
            <Stamp variant={display.intent}>{display.label}</Stamp>
          </div>
          <span className="text-[12px] text-ink-3">{timeAgo(order.createdAt)}</span>
        </div>
        <p className="text-sm font-semibold text-ink">
          {order.shippingName} · {order.shippingCity}
        </p>
        <p className="text-xs text-ink-3">
          Placed {placedAt} · {itemCount} {itemCount === 1 ? 'item' : 'items'} ·{' '}
          {weightKg} kg
        </p>
      </header>

      {/* ===== Line items ===== */}
      <ul className="divide-y divide-rule">
        {order.items.map((item) => {
          const itemKg = Math.round((order.weightGrams / 1000 / Math.max(1, order.items.length)) * 10) / 10;
          return (
            <li
              key={item.id}
              className="flex items-center gap-3.5 px-5 py-3.5 md:gap-5 md:px-7 md:py-4"
            >
              <span className="inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-sm border-[1.5px] border-ink bg-paper-2 font-mono text-base font-extrabold text-ink md:h-12 md:w-16 md:text-lg">
                × {item.quantity}
              </span>
              {/* STUBBED — Pencil row drops the product image; gap-analysis Q8
                  answer is "keep both". Render a 40px thumbnail when an image
                  exists; fall back to a package glyph otherwise. */}
              <div className="relative hidden h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-rule bg-paper-2 md:flex md:items-center md:justify-center">
                {item.product.imageUrl ? (
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <PackageIcon className="size-5 text-ink-4" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-bold text-ink md:text-base">
                  {item.product.name}
                </p>
                <p className="text-[11px] font-medium text-ink-3 md:text-xs">
                  {formatRupeesFromCents(item.unitPrice)} each
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-ink-2 md:text-sm">
                {itemKg} kg
              </span>
            </li>
          );
        })}
      </ul>

      {/* ===== Note band ===== */}
      <div className="flex items-start gap-2.5 border-t border-rule bg-paper-2 px-5 py-3 md:items-center md:gap-3 md:px-7 md:py-3.5">
        <Info className="mt-0.5 size-4 shrink-0 text-ink-3 md:mt-0 md:size-[18px]" aria-hidden />
        <p className="text-xs font-medium text-ink-2 md:text-sm">
          COD total {formatRupeesFromCents(order.codAmount)} · hand parcel to
          your coolie before 4 PM. MNP rider arrives 5–6 PM.
        </p>
      </div>

      {/* ===== Action button ===== */}
      {action ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => onAdvance(order.id)}
          className={cn(
            'flex w-full items-center justify-center gap-3 px-6 py-5 font-sans text-xl font-extrabold tracking-[-0.01em] text-white transition-colors md:gap-3.5 md:py-7 md:text-2xl',
            'bg-[#16A34A] hover:bg-green-700 active:bg-green-900',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          {isPending ? (
            <span className="animate-pulse">Updating…</span>
          ) : (
            <>
              <Check
                className={cn(
                  'shrink-0',
                  isPrimaryAction ? 'size-7 md:size-9' : 'size-6 md:size-7'
                )}
                strokeWidth={2.5}
                aria-hidden
              />
              {action.label}
            </>
          )}
        </button>
      ) : null}
    </article>
  );
}
