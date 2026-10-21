'use client';

import { cn } from '@repo/ui/lib/utils';
import { Skeleton } from '@repo/ui/components/skeleton';
import type {
  VendorProductsStats,
  VendorProductsStatusFilter,
} from '../../types';

const SEGMENTS: ReadonlyArray<{
  key: VendorProductsStatusFilter;
  label: string;
  statKey: keyof VendorProductsStats;
  valueClass: string;
}> = [
  { key: 'all', label: 'All products', statKey: 'all', valueClass: 'text-ink' },
  {
    key: 'active',
    label: 'Active',
    statKey: 'active',
    valueClass: 'text-green-700',
  },
  {
    key: 'low-stock',
    label: 'Low stock',
    statKey: 'lowStock',
    valueClass: 'text-red',
  },
  {
    key: 'drafts',
    label: 'Drafts',
    statKey: 'drafts',
    valueClass: 'text-ink-2',
  },
];

type ProductsStatsSegmentsProps = {
  stats: VendorProductsStats | undefined;
  isLoading: boolean;
  active: VendorProductsStatusFilter;
  onChange: (key: VendorProductsStatusFilter) => void;
};

export function ProductsStatsSegments({
  stats,
  isLoading,
  active,
  onChange,
}: ProductsStatsSegmentsProps) {
  return (
    <div
      role="tablist"
      aria-label="Product status filter"
      className="border-rule hidden grid-cols-4 divide-x divide-rule overflow-hidden rounded-md border bg-white md:grid"
    >
      {SEGMENTS.map((seg) => (
        <button
          key={seg.key}
          type="button"
          role="tab"
          aria-selected={active === seg.key}
          onClick={() => onChange(seg.key)}
          className={cn(
            'flex flex-col items-start gap-2 px-5 py-4 text-left transition-colors',
            active === seg.key ? 'bg-paper-2' : 'bg-white hover:bg-paper-2/60'
          )}
        >
          <span className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
            {seg.label}
          </span>
          {isLoading || !stats ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <span
              className={cn(
                'font-mono text-2xl font-extrabold tabular-nums',
                seg.valueClass
              )}
            >
              {stats[seg.statKey]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
