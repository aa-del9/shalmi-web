'use client';

import { PlusIcon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';
import { Skeleton } from '@repo/ui/components/skeleton';

type ProductsPageHeaderProps = {
  activeCount: number | null;
  onAddProduct: () => void;
};

export function ProductsPageHeader({
  activeCount,
  onAddProduct,
}: ProductsPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="text-amber font-mono text-[11px] font-bold tracking-[0.16em] uppercase">
          {activeCount === null ? (
            <Skeleton className="inline-block h-3 w-24" />
          ) : (
            <>Catalog · {activeCount} active</>
          )}
        </div>
        <h1 className="text-ink text-[28px] font-extrabold tracking-[-0.02em] md:text-[32px]">
          Your products
        </h1>
        <p className="text-ink-2 text-sm">
          Edit prices, stock and visibility — changes go live immediately.
        </p>
      </div>
      <div className="hidden flex-wrap items-center gap-2 md:flex">
        {/* Q4 binding: Import CSV opens an upload modal. The actual
            parser/endpoint is DEFERRED — the button shows a coming-soon
            toast until the import flow lands. */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => toast('CSV import is coming soon')}
        >
          <UploadIcon className="size-4" aria-hidden /> Import CSV
        </Button>
        <Button type="button" size="sm" onClick={onAddProduct}>
          <PlusIcon className="size-4" aria-hidden /> Add product
        </Button>
      </div>
    </header>
  );
}
