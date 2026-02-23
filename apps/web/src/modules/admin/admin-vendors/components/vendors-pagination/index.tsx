'use client';

import { Button } from '@repo/ui/components/button';
import type { PaginationMeta } from '@/modules/core/server-actions';
import { useVendorsPagination } from './use-vendors-pagination';

type VendorsPaginationProps = {
  page: number;
  setPage: (updater: (prev: number) => number) => void;
  meta: PaginationMeta | undefined;
};

export function VendorsPagination({
  page,
  setPage,
  meta,
}: VendorsPaginationProps) {
  const {
    totalPages,
    totalCount,
    currentPage,
    hasNextPage,
    hasPrevPage,
    onPrevious,
    onNext,
    showPagination,
  } = useVendorsPagination({ page, setPage, meta });

  if (!showPagination) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground text-sm">
        Page {currentPage} of {totalPages}
        {totalCount > 0 && ` (${totalCount} total)`}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPrevPage}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
