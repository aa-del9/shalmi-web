'use client';

import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Stamp } from '@repo/ui/components/stamp';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import { getSubOrderStatusDisplay } from '@/modules/core/utils/order-status-display';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import type { VendorRecentOrder } from '../../hooks/use-vendor-recent-orders-query';

const TIME_FMT = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

const NUMBER_FMT = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

type DashboardRecentOrdersProps = {
  rows: ReadonlyArray<VendorRecentOrder> | undefined;
  isLoading: boolean;
};

export function DashboardRecentOrders({
  rows,
  isLoading,
}: DashboardRecentOrdersProps) {
  // Q23 binding: viewport-driven row count (5 desktop, 3 mobile).
  const desktopRows = rows?.slice(0, 5);
  const mobileRows = rows?.slice(0, 3);
  return (
    <section
      aria-label="Recent orders"
      className="border-rule flex flex-col rounded-md border bg-white"
    >
      <header className="border-rule flex items-baseline justify-between gap-2 border-b px-5 py-4 md:px-6 md:py-5">
        <div>
          <p className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
            Recent orders
          </p>
          <h2 className="text-ink mt-1 text-base font-bold md:text-base">
            <span className="md:hidden">Last 3 today</span>
            <span className="hidden md:inline">Last 5 orders today</span>
          </h2>
        </div>
        <Link
          href={ABSOLUTE_ROUTES.VENDOR_ORDERS}
          prefetch={false}
          className="text-ink hover:text-ink-2 inline-flex items-center gap-1 text-sm font-semibold"
        >
          View all
          <ArrowRightIcon className="hidden size-3.5 md:inline" aria-hidden />
        </Link>
      </header>
      <div className="hidden md:block">
        {isLoading || !desktopRows ? (
          <DesktopSkeleton />
        ) : desktopRows.length === 0 ? (
          <EmptyState />
        ) : (
          desktopRows.map((row, i) => (
            <DesktopRow
              key={row.id}
              row={row}
              isLast={i === desktopRows.length - 1}
            />
          ))
        )}
      </div>
      <div className="space-y-3 p-4 md:hidden">
        {isLoading || !mobileRows ? (
          <MobileSkeleton />
        ) : mobileRows.length === 0 ? (
          <EmptyState />
        ) : (
          mobileRows.map((row) => <MobileCard key={row.id} row={row} />)
        )}
      </div>
    </section>
  );
}

function DesktopRow({
  row,
  isLast,
}: {
  row: VendorRecentOrder;
  isLast: boolean;
}) {
  const display = getSubOrderStatusDisplay(row.status);
  const time = TIME_FMT.format(new Date(row.createdAt));
  const weightKg = `${(row.weightGrams / 1000).toFixed(1)} kg`;
  const buyerLine = row.buyerCity
    ? `${row.buyerLabel} · ${row.buyerCity}`
    : row.buyerLabel;
  return (
    <div
      className={
        isLast
          ? 'flex items-start justify-between gap-3 px-5 py-4 md:px-6'
          : 'border-rule flex items-start justify-between gap-3 border-b px-5 py-4 md:px-6'
      }
    >
      <div className="min-w-0 flex-1">
        <p className="text-ink truncate text-sm font-semibold">{buyerLine}</p>
        <p className="text-ink-3 mt-1 truncate font-mono text-[11px] tracking-[0.04em]">
          #{row.orderDisplayId} · {time} · {NUMBER_FMT.format(row.itemCount)}{' '}
          items · {weightKg}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-ink font-mono text-sm font-bold tabular-nums">
          {formatRupeesFromCents(row.codAmount).replace('Rs.', '₨')}
        </span>
        <Stamp variant={display.intent}>{display.label}</Stamp>
      </div>
    </div>
  );
}

function MobileCard({ row }: { row: VendorRecentOrder }) {
  const display = getSubOrderStatusDisplay(row.status);
  return (
    <article className="border-rule flex flex-col gap-1.5 rounded-md border p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-ink truncate text-sm font-semibold">
          {row.buyerLabel}
        </p>
        <Stamp variant={display.intent}>{display.label}</Stamp>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-ink-3 truncate font-mono text-[11px]">
          #{row.orderDisplayId} · {NUMBER_FMT.format(row.itemCount)} items ·{' '}
          {(row.weightGrams / 1000).toFixed(1)} kg
        </p>
        <span className="text-ink font-mono text-sm font-bold tabular-nums">
          {formatRupeesFromCents(row.codAmount).replace('Rs.', '₨')}
        </span>
      </div>
    </article>
  );
}

function DesktopSkeleton() {
  return (
    <div role="status" aria-label="Loading recent orders">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border-rule flex items-center justify-between gap-3 border-b px-6 py-4 last:border-b-0"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="rounded-stamp h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileSkeleton() {
  return (
    <div role="status" aria-label="Loading recent orders">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-rule space-y-2 rounded-md border p-3.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-ink-3 px-6 py-10 text-center text-sm">
      No orders yet — share your shop link to get the first one in.
    </div>
  );
}
