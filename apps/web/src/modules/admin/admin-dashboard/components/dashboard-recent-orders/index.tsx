'use client';

import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Stamp } from '@repo/ui/components/stamp';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import type { RecentOrder } from '../../hooks/use-admin-recent-orders-query';
import {
  deriveOrderDisplayState,
  stampVariantFor,
} from '../../utils/derive-order-display';

const NUMBER_FMT = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const DATE_FMT = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
});

type DashboardRecentOrdersProps = {
  orders: ReadonlyArray<RecentOrder> | undefined;
  isLoading: boolean;
  totalOrders: number | undefined;
};

export function DashboardRecentOrders({
  orders,
  isLoading,
  totalOrders,
}: DashboardRecentOrdersProps) {
  return (
    <section
      aria-label="Recent orders"
      className="border-rule overflow-hidden rounded-md border bg-white"
    >
      <header className="border-rule bg-paper-2 flex items-baseline justify-between gap-2 border-b px-4 py-3 md:px-5">
        <div>
          <h2 className="text-ink text-base font-bold">Recent orders</h2>
          <p className="text-ink-3 text-xs">
            Latest activity across all vendors
          </p>
        </div>
        {totalOrders !== undefined ? (
          <Button asChild variant="outline" size="sm">
            <Link href={ABSOLUTE_ROUTES.ADMIN_ORDERS}>
              View all {NUMBER_FMT.format(totalOrders)}
            </Link>
          </Button>
        ) : null}
      </header>
      <div className="hidden md:block">
        <div className="border-rule bg-paper-2 text-ink-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto_auto_auto_auto_auto] items-center gap-3 border-b px-5 py-2 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
          <span>Order ID</span>
          <span>Customer</span>
          <span>Items</span>
          <span>Weight</span>
          <span>Total</span>
          <span>Status</span>
          <span>Placed</span>
        </div>
        {isLoading || !orders ? (
          <DesktopSkeletonRows />
        ) : orders.length === 0 ? (
          <div className="text-ink-3 px-5 py-8 text-center text-sm">
            No orders yet.
          </div>
        ) : (
          orders.map((order) => (
            <DesktopRow key={order.id} order={order} />
          ))
        )}
      </div>
      <div className="md:hidden">
        {isLoading || !orders ? (
          <MobileSkeletonRows />
        ) : orders.length === 0 ? (
          <div className="text-ink-3 px-4 py-8 text-center text-sm">
            No orders yet.
          </div>
        ) : (
          orders.map((order) => <MobileRow key={order.id} order={order} />)
        )}
      </div>
    </section>
  );
}

function DesktopRow({ order }: { order: RecentOrder }) {
  const state = deriveOrderDisplayState(order.subOrderStatuses);
  const dateLabel = order.createdAt
    ? DATE_FMT.format(new Date(order.createdAt))
    : '—';
  const weightKg = order.weightGrams
    ? `${(order.weightGrams / 1000).toFixed(1)} kg`
    : '—';
  return (
    <Link
      href={`${ABSOLUTE_ROUTES.ADMIN_ORDERS}/${order.id}`}
      className="border-rule hover:bg-paper-2 grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto_auto_auto_auto_auto] items-center gap-3 border-b px-5 py-3 text-sm transition-colors last:border-b-0"
    >
      <span className="text-ink truncate font-mono text-xs font-bold">
        #{order.displayId}
      </span>
      <span className="text-ink-2 truncate font-semibold">
        {order.customerName ?? 'Customer'}
      </span>
      <span className="text-ink-2 font-mono text-xs">
        {NUMBER_FMT.format(order.itemsCount)}
      </span>
      <span className="text-ink-2 font-mono text-xs">{weightKg}</span>
      <span className="text-ink font-mono text-xs font-bold">
        {formatRupeesFromCents(order.grandTotal)}
      </span>
      <Stamp variant={stampVariantFor(state)}>{state}</Stamp>
      <span className="text-ink-3 font-mono text-xs">{dateLabel}</span>
    </Link>
  );
}

function MobileRow({ order }: { order: RecentOrder }) {
  const state = deriveOrderDisplayState(order.subOrderStatuses);
  const dateLabel = order.createdAt
    ? DATE_FMT.format(new Date(order.createdAt))
    : '—';
  return (
    <Link
      href={`${ABSOLUTE_ROUTES.ADMIN_ORDERS}/${order.id}`}
      className="border-rule flex flex-col gap-2 border-b px-4 py-3 last:border-b-0"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-ink font-mono text-xs font-bold">
          #{order.displayId}
        </span>
        <Stamp variant={stampVariantFor(state)}>{state}</Stamp>
      </div>
      <p className="text-ink-2 truncate text-sm font-semibold">
        {order.customerName ?? 'Customer'}
      </p>
      <div className="text-ink-3 flex items-center justify-between gap-2 font-mono text-[11px]">
        <span>
          {NUMBER_FMT.format(order.itemsCount)} items ·{' '}
          {order.weightGrams ? `${(order.weightGrams / 1000).toFixed(1)} kg` : '—'}
        </span>
        <span className="text-ink font-bold">
          {formatRupeesFromCents(order.grandTotal)}
        </span>
      </div>
      <p className="text-ink-3 font-mono text-[11px]">{dateLabel}</p>
    </Link>
  );
}

function DesktopSkeletonRows() {
  return (
    <div role="status" aria-label="Loading recent orders">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border-rule grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto_auto_auto_auto_auto] items-center gap-3 border-b px-5 py-3 last:border-b-0"
        >
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-16 rounded-stamp" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

function MobileSkeletonRows() {
  return (
    <div role="status" aria-label="Loading recent orders">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border-rule space-y-2 border-b px-4 py-3 last:border-b-0"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}
