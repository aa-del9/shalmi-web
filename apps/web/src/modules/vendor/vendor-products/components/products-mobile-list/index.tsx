'use client';

import Image from 'next/image';
import { MoreHorizontalIcon, SearchIcon } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Input } from '@repo/ui/components/input';
import { Button } from '@repo/ui/components/button';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import {
  deriveDisplayStatus,
  type VendorProductListItem,
  type VendorProductsStats,
  type VendorProductsStatusFilter,
  type ProductDisplayStatus,
} from '../../types';

type ProductsMobileListProps = {
  rows: VendorProductListItem[] | undefined;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  stats: VendorProductsStats | undefined;
  status: VendorProductsStatusFilter;
  onStatusChange: (next: VendorProductsStatusFilter) => void;
  q: string;
  onQueryChange: (next: string) => void;
  onEdit: (id: string) => void;
};

export function ProductsMobileList({
  rows,
  isLoading,
  hasError,
  errorMessage,
  stats,
  status,
  onStatusChange,
  q,
  onQueryChange,
  onEdit,
}: ProductsMobileListProps) {
  return (
    <div className="md:hidden">
      <div className="px-4 pb-3 pt-1">
        <label className="relative block">
          <SearchIcon
            className="text-ink-3 pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            aria-label="Search products"
            placeholder="Search products, SKU, brand…"
            value={q}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-9"
          />
        </label>
      </div>
      <div
        role="tablist"
        aria-label="Product status filter"
        className="flex gap-2 overflow-x-auto px-4 pb-3"
      >
        <Chip
          label="All"
          count={stats?.all}
          active={status === 'all'}
          tone="ink"
          onClick={() => onStatusChange('all')}
        />
        <Chip
          label="Active"
          count={stats?.active}
          active={status === 'active'}
          tone="green"
          onClick={() => onStatusChange('active')}
        />
        <Chip
          label="Low stock"
          count={stats?.lowStock}
          active={status === 'low-stock'}
          tone="red"
          onClick={() => onStatusChange('low-stock')}
        />
        <Chip
          label="Drafts"
          // Q22 binding: omit count when 0.
          count={stats && stats.drafts > 0 ? stats.drafts : undefined}
          active={status === 'drafts'}
          tone="ink"
          onClick={() => onStatusChange('drafts')}
        />
      </div>
      <div className="space-y-3 px-4 pb-4">
        {isLoading || !rows ? (
          <SkeletonCards />
        ) : hasError ? (
          <div className="bg-red-bg border-red text-red rounded-md border px-4 py-6 text-center text-sm">
            {errorMessage}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-ink-3 px-4 py-6 text-center text-sm">
            No products match your filters yet.
          </div>
        ) : (
          rows.map((row) => (
            <MobileCard key={row.id} row={row} onEdit={onEdit} />
          ))
        )}
      </div>
    </div>
  );
}

function MobileCard({
  row,
  onEdit,
}: {
  row: VendorProductListItem;
  onEdit: (id: string) => void;
}) {
  const display = deriveDisplayStatus(row);
  const firstImage = row.images[0];
  // Q20 binding: tap card → open edit; ellipsis decorative.
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onEdit(row.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(row.id);
        }
      }}
      className="border-rule flex items-start gap-3 rounded-md border bg-white p-3.5 cursor-pointer transition-colors hover:bg-paper-2/40"
    >
      <span className="bg-paper-2 border-rule relative inline-flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt=""
            fill
            sizes="60px"
            className="object-cover"
          />
        ) : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-ink truncate text-sm font-semibold">{row.name}</p>
        <p className="text-ink-3 mt-0.5 truncate font-mono text-[11px]">
          {row.sku ? `${row.sku} · ` : ''}
          {row.status === 'draft'
            ? 'Draft'
            : `${formatRupeesFromCents(row.packWholesalePriceCents).replace('Rs.', '₨')}`}
        </p>
        <div className="mt-2">
          <MobileStatusPill display={display} stock={row.stock} />
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="More actions"
        // Q20 binding: ellipsis decorative — disabled, not wired.
        disabled
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontalIcon className="size-4" aria-hidden />
      </Button>
    </article>
  );
}

// Q21 binding: mobile pill includes count when applicable.
function MobileStatusPill({
  display,
  stock,
}: {
  display: ProductDisplayStatus;
  stock: number;
}) {
  const className = cn(
    'inline-flex w-fit items-center rounded-full px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.12em]',
    display === 'ACTIVE' && 'bg-green-bg text-green-700',
    display === 'LOW_STOCK' && 'bg-red-bg text-red',
    display === 'OUT_OF_STOCK' && 'bg-red-bg text-red',
    display === 'DRAFT' && 'bg-paper-2 text-ink-2'
  );
  const label =
    display === 'ACTIVE'
      ? 'ACTIVE'
      : display === 'LOW_STOCK'
        ? `${stock} LEFT · LOW`
        : display === 'OUT_OF_STOCK'
          ? 'OUT OF STOCK'
          : 'DRAFT · NOT LIVE';
  return <span className={className}>{label}</span>;
}

function Chip({
  label,
  count,
  active,
  tone,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  tone: 'ink' | 'green' | 'red';
  onClick: () => void;
}) {
  const className = cn(
    'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors',
    !active &&
      tone === 'ink' &&
      'border-rule border bg-white text-ink-2 hover:bg-paper-2',
    !active &&
      tone === 'green' &&
      'border-rule border bg-white text-ink-2 hover:bg-paper-2',
    !active &&
      tone === 'red' &&
      typeof count === 'number' && count > 0
      ? 'border border-red bg-red-bg text-red'
      : '',
    !active &&
      tone === 'red' &&
      (typeof count !== 'number' || count === 0) &&
      'border-rule border bg-white text-ink-2 hover:bg-paper-2',
    active && tone === 'ink' && 'bg-ink text-white',
    active && tone === 'green' && 'bg-green-bg border border-green-700 text-green-700',
    active && tone === 'red' && 'bg-red text-white'
  );
  return (
    <button type="button" onClick={onClick} className={className}>
      <span className="font-sans">{label}</span>
      {typeof count === 'number' ? (
        <span className="font-mono">{count}</span>
      ) : null}
    </button>
  );
}

function SkeletonCards() {
  return (
    <div role="status" aria-label="Loading products">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border-rule mb-3 flex items-start gap-3 rounded-md border bg-white p-3.5 last:mb-0"
        >
          <Skeleton className="size-14 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="rounded-stamp h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
