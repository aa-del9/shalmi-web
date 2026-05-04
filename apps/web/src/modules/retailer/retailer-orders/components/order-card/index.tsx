'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, MapPin, Package, Truck, Banknote } from 'lucide-react';
import dayjs from 'dayjs';

import { Stamp } from '@repo/ui/components/stamp';
import { cn } from '@repo/ui/lib/utils';

import {
  rollupSubOrderStatuses,
  isDeliveredOrder,
} from '@/modules/core/utils/order-status-display';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';

import type { RetailerOrder, RetailerOrderItem } from '../../types';

const DESKTOP_ITEM_NAMES = 4;
const MOBILE_ITEM_NAMES = 3;
const DESKTOP_THUMBNAIL_SLOTS = 5; // 5 thumbs + 1 "+N" tile = 6 slots per Pencil oo1Items
const MOBILE_THUMBNAIL_SLOTS = 3; // 3 thumbs + 1 "+N" tile = 4 slots per Pencil moo1Th

function flattenItems(order: RetailerOrder): RetailerOrderItem[] {
  return order.subOrders.flatMap((s) => s.items);
}

function uniqueByProduct(items: RetailerOrderItem[]): RetailerOrderItem[] {
  const seen = new Set<string>();
  const result: RetailerOrderItem[] = [];
  for (const item of items) {
    if (seen.has(item.productId)) continue;
    seen.add(item.productId);
    result.push(item);
  }
  return result;
}

function totalQuantity(items: RetailerOrderItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

function totalWeightKg(order: RetailerOrder): number {
  const grams = order.subOrders.reduce((sum, s) => sum + (s.weightGrams ?? 0), 0);
  return Math.round((grams / 1000) * 10) / 10;
}

function buildItemsCaption(
  items: RetailerOrderItem[],
  leadCount: number,
  moreSuffix: 'more items' | 'more'
): string {
  if (items.length === 0) return '';
  const lead = items.slice(0, leadCount).map((i) => i.product.name);
  const remainder = Math.max(0, items.length - leadCount);
  const head = lead.join(' · ');
  return remainder > 0 ? `${head} · +${remainder} ${moreSuffix}` : head;
}

interface ThumbnailProps {
  item: RetailerOrderItem | null;
  fillContainer?: boolean;
}

function Thumbnail({ item, fillContainer }: ThumbnailProps) {
  return (
    <div
      className={cn(
        'relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-rule bg-paper-2',
        fillContainer && 'w-full'
      )}
    >
      {item?.product.imageUrl ? (
        <Image
          src={item.product.imageUrl}
          alt={item.product.name}
          fill
          sizes="48px"
          className="object-cover"
        />
      ) : (
        <Package className="size-6 text-ink-4" aria-hidden />
      )}
    </div>
  );
}

interface PlusTileProps {
  count: number;
  fillContainer?: boolean;
}

function PlusTile({ count, fillContainer }: PlusTileProps) {
  return (
    <div
      className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-paper-3 font-mono text-[13px] font-bold text-ink-2',
        fillContainer && 'w-full'
      )}
    >
      +{count}
    </div>
  );
}

interface EyebrowStatProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function EyebrowStat({ label, value, valueClassName }: EyebrowStatProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
        {label}
      </span>
      <span className={cn('font-sans text-sm font-semibold text-ink', valueClassName)}>
        {value}
      </span>
    </div>
  );
}

interface MetaRowProps {
  icon: React.ReactNode;
  text: string;
}

function MetaItem({ icon, text }: MetaRowProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
      <span className="text-ink-3 [&>svg]:size-3.5" aria-hidden>
        {icon}
      </span>
      {text}
    </span>
  );
}

interface OrderCardProps {
  order: RetailerOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  const items = flattenItems(order);
  const uniqueItems = uniqueByProduct(items);
  const itemCount = totalQuantity(items);
  const weightKg = totalWeightKg(order);
  const placedDate = dayjs(order.createdAt).format('DD MMM YYYY');
  const display = rollupSubOrderStatuses(order.subOrders.map((s) => s.status));

  // STUBBED — see scope-cut "Order tracking surface". `sub_orders.handedAt`
  // is the courier-handover timestamp; we use it as a stand-in for the
  // delivered-on date until the `sub_orders.deliveredAt` schema lands
  // post-v1. We omit the "· N days" duration entirely until then.
  // TODO(post-v1): swap to `deliveredAt` and compute "X days" duration.
  const deliveredCopy = (() => {
    if (!isDeliveredOrder(order.subOrders.map((s) => s.status))) return null;
    const handed = order.subOrders
      .map((s) => s.handedAt)
      .filter((d): d is string => Boolean(d))
      .sort()
      .pop();
    if (!handed) return 'Delivered';
    return `Delivered ${dayjs(handed).format('DD MMM')}`;
  })();

  // "View details" routes to the existing /profile/orders/[id]
  // (RetailerOrderDetail parcel-boxes view, kept per Batch 5 plan
  // resolution Q4). "Reorder" routes to the new sub-route landed in
  // Batch 5: /profile/orders/[id]/reorder.
  const detailHref = `/profile/orders/${order.id}`;
  const reorderHref = `/profile/orders/${order.id}/reorder`;

  const desktopCaption = buildItemsCaption(
    uniqueItems,
    DESKTOP_ITEM_NAMES,
    'more items'
  );
  const mobileCaption = buildItemsCaption(
    uniqueItems,
    MOBILE_ITEM_NAMES,
    'more'
  );

  const desktopThumbs = uniqueItems.slice(0, DESKTOP_THUMBNAIL_SLOTS);
  const desktopOverflow = Math.max(
    0,
    uniqueItems.length - DESKTOP_THUMBNAIL_SLOTS
  );
  const mobileThumbs = uniqueItems.slice(0, MOBILE_THUMBNAIL_SLOTS);
  const mobileOverflow = Math.max(
    0,
    uniqueItems.length - MOBILE_THUMBNAIL_SLOTS
  );

  return (
    <article className="overflow-hidden rounded-md border border-rule bg-white">
      {/* ===== Desktop card header (md+) ===== */}
      <div className="hidden items-center justify-between border-b border-rule bg-paper-2 px-5 py-4 md:flex">
        <div className="flex items-center gap-6">
          <EyebrowStat
            label="Order ID"
            value={order.displayId}
            valueClassName="font-mono text-sm font-bold"
          />
          <EyebrowStat label="Placed" value={placedDate} />
          <EyebrowStat
            label="Total"
            value={formatRupeesFromCents(order.grandTotal)}
            valueClassName="font-mono text-sm font-bold"
          />
          <EyebrowStat
            label="Weight"
            value={`${weightKg} kg`}
            valueClassName="font-mono text-sm font-semibold"
          />
        </div>
        <div className="flex items-center gap-2.5">
          <Stamp variant={display.intent}>{display.label}</Stamp>
          {/* Q10: chevron is a placeholder for future expand/menu — render but inert. */}
          <ChevronDown className="size-[18px] text-ink" aria-hidden />
        </div>
      </div>

      {/* ===== Mobile card header ===== */}
      <div className="flex items-center justify-between border-b border-rule bg-paper-2 px-4 py-3.5 md:hidden">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[13px] font-bold text-ink">
            {order.displayId}
          </span>
          <span className="text-[11px] text-ink-3">{placedDate}</span>
        </div>
        <Stamp variant={display.intent}>{display.label}</Stamp>
      </div>

      {/* ===== Card body ===== */}
      <div className="flex flex-col gap-3.5 p-4 md:grid md:grid-cols-[1fr_200px] md:gap-6 md:p-5">
        <div className="flex min-w-0 flex-col gap-3.5">
          {/* Mobile-only stats triple */}
          <div className="grid grid-cols-3 gap-2 md:hidden">
            <div className="flex flex-col gap-0.5">
              <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Total
              </span>
              <span className="font-mono text-sm font-bold text-ink">
                {formatRupeesFromCents(order.grandTotal)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Items
              </span>
              <span className="font-mono text-sm font-bold text-ink">
                {itemCount}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Weight
              </span>
              <span className="font-mono text-sm font-bold text-ink">
                {weightKg} kg
              </span>
            </div>
          </div>

          {/* Desktop thumbnails (5 + plus) */}
          <div className="hidden gap-2 md:flex">
            {desktopThumbs.map((item) => (
              <Thumbnail key={item.id} item={item} />
            ))}
            {Array.from({
              length: Math.max(0, DESKTOP_THUMBNAIL_SLOTS - desktopThumbs.length),
            }).map((_, idx) => (
              <Thumbnail key={`ph-${idx}`} item={null} />
            ))}
            {desktopOverflow > 0 && <PlusTile count={desktopOverflow} />}
          </div>

          {/* Mobile thumbnails (3 + plus, fill container) */}
          <div className="grid grid-cols-4 gap-1.5 md:hidden">
            {mobileThumbs.map((item) => (
              <Thumbnail key={item.id} item={item} fillContainer />
            ))}
            {Array.from({
              length: Math.max(0, MOBILE_THUMBNAIL_SLOTS - mobileThumbs.length),
            }).map((_, idx) => (
              <Thumbnail key={`mph-${idx}`} item={null} fillContainer />
            ))}
            {mobileOverflow > 0 ? (
              <PlusTile count={mobileOverflow} fillContainer />
            ) : (
              <div className="hidden" aria-hidden />
            )}
          </div>

          {/* Items caption */}
          <p className="hidden text-sm leading-[1.5] text-ink-2 md:block">
            {desktopCaption}
          </p>
          <p className="text-xs leading-[1.5] text-ink-3 md:hidden">
            {mobileCaption}
          </p>

          {/* Meta row — desktop only (mobile drops it per Pencil moo1B) */}
          <div className="hidden flex-wrap items-center gap-x-[18px] gap-y-1.5 md:flex">
            {/* TODO(post-v1): include postal code once `addresses.postalCode` lands (Q13) */}
            <MetaItem
              icon={<MapPin className="size-3.5" />}
              text={order.shippingCity}
            />
            {/* TODO(post-v1): switch from `handedAt` to `deliveredAt` and add "· N days" (Q12) */}
            {deliveredCopy ? (
              <MetaItem icon={<Truck className="size-3.5" />} text={deliveredCopy} />
            ) : null}
            {/* TODO(post-v1): drive payment method from `orders.paymentMethod` once schema lands (Q15) */}
            <MetaItem
              icon={<Banknote className="size-3.5" />}
              text="COD · paid on delivery"
            />
          </div>
        </div>

        {/* Action column — desktop only */}
        <div className="hidden w-full flex-col gap-2 md:flex">
          {/* "Reorder" lands in Batch 5; Track-order remains DEFERRED
              per scope-cut; Invoice is DROPPED. */}
          <Link
            href={reorderHref}
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-sm bg-ink px-4 text-[13px] font-semibold text-white transition-colors hover:bg-ink/90"
          >
            Reorder
          </Link>
          <Link
            href={detailHref}
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-sm border-[1.5px] border-ink/20 px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-paper-2"
          >
            View details
          </Link>
        </div>

        {/* Action row — mobile */}
        <div className="flex flex-col gap-2 md:hidden">
          <Link
            href={reorderHref}
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-sm bg-ink px-4 text-[13px] font-semibold text-white transition-colors hover:bg-ink/90"
          >
            Reorder
          </Link>
          <Link
            href={detailHref}
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-sm border-[1.5px] border-ink/20 px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-paper-2"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
