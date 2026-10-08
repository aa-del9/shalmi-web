'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

const NUMBER_FMT = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

type ProductsPaginatorProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (next: number) => void;
};

export function ProductsPaginator({
  page,
  pageSize,
  total,
  onPageChange,
}: ProductsPaginatorProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = buildPageList(page, pageCount);
  return (
    <div className="border-rule hidden items-center justify-between gap-3 border-t px-5 py-3 md:flex">
      <p className="text-ink-3 text-xs">
        Showing {NUMBER_FMT.format(from)}–{NUMBER_FMT.format(to)} of{' '}
        {NUMBER_FMT.format(total)} products
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <PageButton
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          ariaLabel="Previous page"
        >
          <ChevronLeftIcon className="size-4" aria-hidden />
        </PageButton>
        {pages.map((p, i) =>
          p === '…' ? (
            <span
              key={`gap-${i}`}
              className="text-ink-3 px-1 font-mono text-xs"
            >
              …
            </span>
          ) : (
            <PageButton
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              isActive={p === page}
            >
              {p}
            </PageButton>
          )
        )}
        <PageButton
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
          ariaLabel="Next page"
        >
          <ChevronRightIcon className="size-4" aria-hidden />
        </PageButton>
      </nav>
    </div>
  );
}

function buildPageList(page: number, pageCount: number): Array<number | '…'> {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const out: Array<number | '…'> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) out.push('…');
  for (let i = start; i <= end; i++) out.push(i);
  if (end < pageCount - 1) out.push('…');
  out.push(pageCount);
  return out;
}

function PageButton({
  children,
  onClick,
  disabled,
  isActive,
  ariaLabel,
  ...rest
}: React.PropsWithChildren<{
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  ariaLabel?: string;
}> &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'border-rule inline-flex h-9 min-w-9 items-center justify-center rounded-sm border px-2 font-mono text-xs font-bold transition-colors',
        isActive
          ? 'bg-ink border-ink text-white'
          : 'text-ink-2 bg-white hover:bg-paper-2 disabled:opacity-50'
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
