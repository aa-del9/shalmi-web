'use client';

import { useState } from 'react';
import { cn } from '@repo/ui/lib/utils';

// Sales chart per scope-cut "Vendor sales analytics" STUBBED. The chart
// renders the segmented control (7D / 30D / 90D — Q5 binding, default 7D)
// and an empty-state body per Q17 binding ("No sales yet — chart will
// appear after your first orders"). The actual analytics endpoint is
// DEFERRED to a follow-up milestone.
//
// TODO(post-v1): wire to a real `/api/vendor/dashboard/sales-series`
// endpoint once the analytics subsystem ships.

type Range = '7D' | '30D' | '90D';
const RANGES: ReadonlyArray<Range> = ['7D', '30D', '90D'];

export function DashboardSalesChart() {
  const [range, setRange] = useState<Range>('7D');
  return (
    <section
      aria-label="Revenue last 7 days"
      className="border-rule flex flex-col gap-5 rounded-md border bg-white p-5 md:p-7"
    >
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
            Revenue · Last 7 days
          </p>
          <p className="text-ink font-mono text-2xl font-extrabold tracking-[-0.01em] tabular-nums md:text-[28px]">
            ₨ 0
          </p>
          <p className="text-ink-3 text-xs">
            Chart appears after your first delivered orders.
          </p>
        </div>
        <div className="flex items-center gap-1.5" role="tablist">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={range === r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-sm px-3 py-2 font-mono text-[11px] font-bold tracking-[0.08em] uppercase transition-colors',
                range === r
                  ? 'bg-paper-2 text-ink'
                  : 'text-ink-3 hover:text-ink-2'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </header>
      <div
        aria-hidden
        className="bg-paper-2 flex h-44 items-end justify-between gap-3 rounded-md p-4"
      >
        {/* Static zero-height bars per scope-cut placeholder. */}
        {Array.from({ length: 7 }).map((_, i) => (
          <span
            key={i}
            className="bg-paper-3 flex-1 rounded-sm"
            style={{ height: `${10 + i * 4}px` }}
          />
        ))}
      </div>
    </section>
  );
}
