'use client';

import { Checkbox } from '@repo/ui/components/checkbox';
import { Skeleton } from '@repo/ui/components/skeleton';
import type { VendorListItem } from '@/modules/admin/admin-vendors/types';
import { VendorRow } from '../vendor-row';

type VendorsListCardProps = {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  vendors: ReadonlyArray<VendorListItem>;
  selectedVendorId: string | null;
  selectedIdsForBulk: ReadonlySet<string>;
  onSelectVendor: (id: string) => void;
  onToggleCheck: (id: string) => void;
  onToggleAll: (allSelected: boolean) => void;
  onToggleActive: (vendor: VendorListItem) => void;
  onRemove: (vendor: VendorListItem) => void;
};

function ListSkeleton() {
  return (
    <div role="status" aria-label="Loading vendors">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="border-rule grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-3 last:border-b-0"
        >
          <Skeleton className="size-4 rounded" />
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-stamp" />
        </div>
      ))}
    </div>
  );
}

export function VendorsListCard({
  isLoading,
  hasError,
  errorMessage,
  vendors,
  selectedVendorId,
  selectedIdsForBulk,
  onSelectVendor,
  onToggleCheck,
  onToggleAll,
  onToggleActive,
  onRemove,
}: VendorsListCardProps) {
  const allChecked =
    vendors.length > 0 && vendors.every((v) => selectedIdsForBulk.has(v.id));
  const indeterminate =
    !allChecked && vendors.some((v) => selectedIdsForBulk.has(v.id));

  return (
    <section
      aria-label="Vendors"
      className="border-rule overflow-hidden rounded-md border bg-white"
    >
      <header className="border-rule bg-paper-2 grid grid-cols-[auto_auto_minmax(0,1fr)_auto_auto_auto_auto] items-center gap-3 border-b px-4 py-2.5">
        <Checkbox
          checked={indeterminate ? 'indeterminate' : allChecked}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Select all vendors on this page"
          disabled={vendors.length === 0}
        />
        <span className="sr-only">Avatar</span>
        <span className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
          Vendor
        </span>
        <span className="text-ink-3 hidden font-mono text-[11px] font-bold tracking-[0.08em] uppercase md:block">
          Phone
        </span>
        <span className="text-ink-3 hidden font-mono text-[11px] font-bold tracking-[0.08em] uppercase md:block">
          Bazaar
        </span>
        <span className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
          Status
        </span>
        <span className="sr-only">Actions</span>
      </header>
      {isLoading ? (
        <ListSkeleton />
      ) : hasError ? (
        <div className="text-red px-4 py-12 text-center text-sm">
          {errorMessage}
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-ink-3 px-4 py-12 text-center text-sm">
          No vendors yet.
        </div>
      ) : (
        <div>
          {vendors.map((vendor) => (
            <VendorRow
              key={vendor.id}
              vendor={vendor}
              isSelected={selectedVendorId === vendor.id}
              isChecked={selectedIdsForBulk.has(vendor.id)}
              onSelect={onSelectVendor}
              onToggleCheck={onToggleCheck}
              onToggleActive={onToggleActive}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </section>
  );
}
