'use client';

import { Skeleton } from '@repo/ui/components/skeleton';
import type { VendorLowStockResponse } from '../../hooks/use-vendor-low-stock-query';

type DashboardLowStockProps = {
  data: VendorLowStockResponse | undefined;
  isLoading: boolean;
};

export function DashboardLowStock({ data, isLoading }: DashboardLowStockProps) {
  const rows = data?.rows ?? [];
  return (
    <section
      aria-label="Low stock"
      className="border-rule flex flex-col rounded-md border bg-white"
    >
      <header className="border-rule flex items-center justify-between gap-2 border-b px-5 py-4 md:px-6 md:py-5">
        <div className="flex flex-col gap-1">
          <p className="text-red font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
            Low stock
          </p>
          <h2 className="text-ink text-base font-bold">
            Reorder before stock-out
          </h2>
        </div>
        {isLoading || !data ? (
          <Skeleton className="h-5 w-8" />
        ) : (
          <span className="bg-red-bg text-red rounded-full px-2 py-0.5 font-mono text-[11px] font-bold">
            {rows.length}
          </span>
        )}
      </header>
      {isLoading || !data ? (
        <div className="space-y-3 p-5 md:p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-ink-3 px-6 py-8 text-center text-sm">
          All stock above {data.threshold} packs — you&apos;re good.
        </div>
      ) : (
        rows.map((row, i) => (
          <div
            key={row.id}
            className={
              i === rows.length - 1
                ? 'flex items-center justify-between gap-3 px-5 py-3.5 md:px-6'
                : 'border-rule flex items-center justify-between gap-3 border-b px-5 py-3.5 md:px-6'
            }
          >
            <div className="min-w-0 flex-1">
              <p className="text-ink truncate text-sm font-semibold">
                {row.name}
              </p>
              <p className="text-ink-3 mt-0.5 truncate font-mono text-[11px]">
                {row.slug}
              </p>
            </div>
            <span className="text-red font-mono text-sm font-bold tabular-nums">
              {row.stock} left
            </span>
          </div>
        ))
      )}
    </section>
  );
}
