'use client';

import { DownloadIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';

type CategoriesPageHeaderProps = {
  onAddClick: () => void;
};

export function CategoriesPageHeader({
  onAddClick,
}: CategoriesPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-ink text-3xl font-extrabold tracking-tight md:text-[32px]">
          Categories
        </h1>
        <p className="text-ink-3 text-sm">
          Manage product categories. Assign categories when adding or editing
          products.
        </p>
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
          Add category
        </Button>
      </div>
    </div>
  );
}
