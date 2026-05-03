'use client';

import Image from 'next/image';
import { MoreHorizontalIcon, PencilIcon } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Button } from '@repo/ui/components/button';
import type { CategoryListItem } from '@/modules/common/queries/categories';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import {
  deriveDisplayStatus,
  type VendorProductListItem,
  type ProductDisplayStatus,
} from '../../types';

const NUMBER_FMT = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

type ProductsTableProps = {
  rows: VendorProductListItem[] | undefined;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  categories: CategoryListItem[];
  onEdit: (id: string) => void;
};

export function ProductsTable({
  rows,
  isLoading,
  hasError,
  errorMessage,
  categories,
  onEdit,
}: ProductsTableProps) {
  return (
    <div role="table" className="hidden md:block">
      <div
        role="row"
        className="border-rule bg-paper-2 text-ink-3 grid grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto] items-center gap-3 border-b px-5 py-2 font-mono text-[11px] font-bold tracking-[0.08em] uppercase"
      >
        <span>Product</span>
        <span>SKU</span>
        <span>Category</span>
        <span>Price · PKR</span>
        <span>Stock</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      {isLoading || !rows ? (
        <SkeletonRows />
      ) : hasError ? (
        <ErrorState message={errorMessage} />
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        rows.map((row, i) => (
          <ProductRow
            key={row.id}
            row={row}
            categories={categories}
            isLast={i === rows.length - 1}
            onEdit={onEdit}
          />
        ))
      )}
    </div>
  );
}

function ProductRow({
  row,
  categories,
  isLast,
  onEdit,
}: {
  row: VendorProductListItem;
  categories: CategoryListItem[];
  isLast: boolean;
  onEdit: (id: string) => void;
}) {
  const display = deriveDisplayStatus(row);
  // Q18 binding: list cell shows the first/primary category only.
  const firstCategoryId = row.categoryIds[0];
  const categoryName = firstCategoryId
    ? (categories.find((c) => c.id === firstCategoryId)?.name ?? '—')
    : '—';
  const firstImage = row.images[0];
  const tagline = buildTagline(row);
  return (
    <div
      role="row"
      className={cn(
        'grid grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 text-sm',
        !isLast && 'border-rule border-b'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="bg-paper-2 border-rule relative inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border">
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <span className="text-ink-3 text-[10px]">—</span>
          )}
        </span>
        <div className="min-w-0">
          <p className="text-ink truncate font-semibold">{row.name}</p>
          {tagline ? (
            <p className="text-ink-3 mt-0.5 truncate text-[11px]">{tagline}</p>
          ) : null}
        </div>
      </div>
      <span className="text-ink-2 font-mono text-xs">
        {row.sku ?? <span className="text-ink-4">—</span>}
      </span>
      <span className="text-ink-2 truncate text-sm">{categoryName}</span>
      <span className="text-ink font-mono text-sm font-bold tabular-nums">
        {row.status === 'draft' ? (
          <span className="text-ink-3">—</span>
        ) : (
          formatRupeesFromCents(row.packWholesalePriceCents).replace('Rs.', '₨')
        )}
      </span>
      <span
        className={cn(
          'font-mono text-sm font-bold tabular-nums',
          display === 'LOW_STOCK' || display === 'OUT_OF_STOCK'
            ? 'text-red'
            : display === 'DRAFT'
              ? 'text-ink-3'
              : 'text-ink'
        )}
      >
        {display === 'DRAFT' ? '—' : NUMBER_FMT.format(row.stock)}
      </span>
      <StatusPill status={display} />
      <div className="flex items-center justify-end gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Edit ${row.name}`}
          onClick={() => onEdit(row.id)}
        >
          <PencilIcon className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="More actions"
          // Q19 binding: ellipsis decorative for now.
          disabled
        >
          <MoreHorizontalIcon className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ProductDisplayStatus }) {
  const className = cn(
    'inline-flex w-fit items-center rounded-full px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.12em]',
    status === 'ACTIVE' && 'bg-green-bg text-green-700',
    status === 'LOW_STOCK' && 'bg-red-bg text-red',
    status === 'OUT_OF_STOCK' && 'bg-red-bg text-red',
    status === 'DRAFT' && 'bg-paper-2 text-ink-2'
  );
  const label =
    status === 'ACTIVE'
      ? 'ACTIVE'
      : status === 'LOW_STOCK'
        ? 'LOW STOCK'
        : status === 'OUT_OF_STOCK'
          ? 'OUT OF STOCK'
          : 'DRAFT';
  return <span className={className}>{label}</span>;
}

function buildTagline(row: VendorProductListItem): string {
  const segments: string[] = [];
  if (row.brand) segments.push(row.brand);
  if (row.unitLabel && row.packSize > 1) {
    segments.push(`${row.unitLabel.toUpperCase()} × ${row.packSize}`);
  } else if (row.packSize > 1) {
    segments.push(`Pack of ${row.packSize}`);
  }
  if (row.packWeightGrams) {
    segments.push(`${(row.packWeightGrams / 1000).toFixed(2)} kg`);
  }
  return segments.join(' · ');
}

function SkeletonRows() {
  return (
    <div role="status" aria-label="Loading products">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border-rule grid grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto] items-center gap-3 border-b px-5 py-3.5"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="rounded-stamp h-4 w-16" />
          <div className="flex justify-end gap-1.5">
            <Skeleton className="size-9 rounded-sm" />
            <Skeleton className="size-9 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-red-bg border-red text-red px-5 py-8 text-center text-sm">
      {message}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-ink-3 px-5 py-10 text-center text-sm">
      No products match your filters yet.
    </div>
  );
}
