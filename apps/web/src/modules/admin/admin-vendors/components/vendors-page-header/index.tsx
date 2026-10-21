'use client';

import { DownloadIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';

type VendorsPageHeaderProps = {
  totals: { all: number; active: number; inactive: number };
  isLoading: boolean;
  onAddClick: () => void;
};

export function VendorsPageHeader({
  totals,
  isLoading,
  onAddClick,
}: VendorsPageHeaderProps) {
  // Q4 binding: drop "12 pending review" segment.
  const subtitle = isLoading
    ? 'Loading vendor totals…'
    : `${totals.active} active · ${totals.inactive} inactive · ${totals.all} total`;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-ink text-3xl font-extrabold tracking-tight md:text-[32px]">
          Vendors
        </h1>
        <p className="text-ink-3 text-sm">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => toast('Export CSV — coming soon')}
          className="hidden md:inline-flex"
        >
          <DownloadIcon className="size-4" aria-hidden />
          Export CSV
        </Button>
        <Button type="button" onClick={onAddClick}>
          <PlusIcon className="size-4" aria-hidden />
          Add vendor
        </Button>
      </div>
    </div>
  );
}
