'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { cn } from '@repo/ui/lib/utils';
import type { BannerDerivedState, BannerListMeta } from '../../types';

type BannerStatusFilter = BannerDerivedState | 'all';

type BannersFiltersProps = {
  status: BannerStatusFilter;
  onStatusChange: (next: BannerStatusFilter) => void;
  positionValue: string;
  onPositionChange: (next: string) => void;
  sortValue: 'createdAt:desc' | 'createdAt:asc' | 'displayOrder:asc';
  onSortChange: (
    next: 'createdAt:desc' | 'createdAt:asc' | 'displayOrder:asc'
  ) => void;
  totals: BannerListMeta['totals'];
};

const POSITION_ALL = '__ALL__';

const STATUS_TABS: ReadonlyArray<{ key: BannerStatusFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'expired', label: 'Expired' },
];

export function BannersFilters({
  status,
  onStatusChange,
  positionValue,
  onPositionChange,
  sortValue,
  onSortChange,
  totals,
}: BannersFiltersProps) {
  return (
    <section
      aria-label="Filters"
      className="border-rule flex flex-col gap-3 rounded-md border bg-white p-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:p-4"
    >
      <div role="tablist" aria-label="Status" className="flex flex-wrap items-center gap-1.5">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.key === 'all'
              ? totals.all
              : tab.key === 'live'
                ? totals.live
                : tab.key === 'scheduled'
                  ? totals.scheduled
                  : totals.expired;
          const isSelected = tab.key === status;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onStatusChange(tab.key)}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-stamp border px-3 text-sm font-semibold transition-colors',
                isSelected
                  ? 'border-ink bg-ink text-white'
                  : 'border-rule-2 bg-white text-ink-2 hover:border-ink'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'font-mono text-[11px] font-bold tracking-[0.08em]',
                  isSelected ? 'text-white/80' : 'text-ink-3'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <Select
          value={positionValue === '' ? POSITION_ALL : positionValue}
          onValueChange={(next) =>
            onPositionChange(next === POSITION_ALL ? '' : next)
          }
        >
          <SelectTrigger className="bg-white md:w-44">
            <SelectValue placeholder="Position: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={POSITION_ALL}>Position: All</SelectItem>
            <SelectItem value="hero">Position: Hero</SelectItem>
            <SelectItem value="promo_top">Position: Promo top</SelectItem>
            <SelectItem value="strip">Position: Strip</SelectItem>
            <SelectItem value="sidebar">Position: Sidebar</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortValue} onValueChange={onSortChange}>
          <SelectTrigger className="bg-white md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt:desc">Sort: Newest first</SelectItem>
            <SelectItem value="createdAt:asc">Sort: Oldest first</SelectItem>
            <SelectItem value="displayOrder:asc">Sort: Display order</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}

export type { BannerStatusFilter };
