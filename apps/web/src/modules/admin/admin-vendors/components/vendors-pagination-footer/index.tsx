'use client';

import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';

type VendorsPaginationFooterProps = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  /** Trailing entity-noun (Q31 binding: interpolatable). */
  entityNoun: { singular: string; plural: string };
  onPageChange: (next: number) => void;
};

export function VendorsPaginationFooter({
  page,
  limit,
  totalCount,
  totalPages,
  entityNoun,
  onPageChange,
}: VendorsPaginationFooterProps) {
  if (totalCount === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(totalCount, page * limit);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;
  const noun = totalCount === 1 ? entityNoun.singular : entityNoun.plural;

  return (
    <footer className="flex items-center justify-between gap-3 px-1 pt-3">
      <p className="text-ink-3 font-mono text-[12px] tracking-[0.04em]">
        Showing {start}–{end} of {totalCount} {noun}
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
          size="sm"
          disabled={isLast}
          onClick={() => onPageChange(page + 1)}
          className={cn('bg-ink text-white hover:bg-ink/90')}
        >
          Next
        </Button>
      </div>
    </footer>
  );
}
