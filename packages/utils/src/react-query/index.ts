/**
 * React Query helper utilities
 */

import type { InfiniteData } from "@tanstack/react-query";

/**
 * Extract flattened data from React Query infinite query data
 */
export const getInfiniteQueryData = <TPage, TItem>(
  infiniteData: InfiniteData<TPage> | undefined,
  getter: (page: TPage) => TItem[]
): TItem[] => {
  return infiniteData?.pages.flatMap(getter) ?? [];
};

/**
 * Get total count from infinite query data
 */
export const getInfiniteQueryCount = <TPage>(
  infiniteData: InfiniteData<TPage> | undefined,
  countGetter: (page: TPage) => number
): number => {
  const firstPage = infiniteData?.pages[0];
  return firstPage ? countGetter(firstPage) : 0;
};
