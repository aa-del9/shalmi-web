'use client';

import { Button } from '@repo/ui/components/button';

type CategoriesPaginationProps = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (next: number) => void;
};

export function CategoriesPagination({
  page,
  limit,
  totalCount,
  totalPages,
  onPageChange,
}: CategoriesPaginationProps) {
  if (totalCount === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(totalCount, page * limit);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <footer className="flex items-center justify-between gap-3 px-1 pt-3">
      <p className="text-ink-3 font-mono text-[12px] tracking-[0.04em]">
        Showing {start}–{end} of {totalCount}{' '}
        {totalCount === 1 ? 'category' : 'categories'}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isFirst}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLast}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </footer>
  );
}
