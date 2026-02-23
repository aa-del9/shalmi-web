'use client';

import { useCallback } from 'react';
import type { PaginationMeta } from '@/modules/core/server-actions';

type UseVendorsPaginationParams = {
  page: number;
  setPage: (updater: (prev: number) => number) => void;
  meta: PaginationMeta | undefined;
};

export function useVendorsPagination({
  page,
  setPage,
  meta,
}: UseVendorsPaginationParams) {
  const totalPages = meta?.totalPages ?? 1;
  const totalCount = meta?.totalCount ?? 0;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const onPrevious = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, [setPage]);

  const onNext = useCallback(() => {
    setPage((p) => p + 1);
  }, [setPage]);

  return {
    totalPages,
    totalCount,
    currentPage: meta?.currentPage ?? page,
    hasNextPage,
    hasPrevPage,
    onPrevious,
    onNext,
    showPagination: totalCount > 0,
  };
}
