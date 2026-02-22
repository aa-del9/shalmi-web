import type { PaginationMeta } from './types';

/** Default page size for paginated lists */
export const DEFAULT_PAGE_LIMIT = 10;

/** Default page number (1-based) */
export const DEFAULT_PAGE = 1;

export type PaginationParams = {
  page?: number;
  limit?: number;
};

/**
 * Normalizes page and limit (1-based page, positive limit) and returns offset for SQL.
 */
export function normalizePagination(params: PaginationParams): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(
    1,
    Math.floor(params.page ?? DEFAULT_PAGE) || DEFAULT_PAGE
  );
  const limit = Math.max(
    1,
    Math.min(
      100,
      Math.floor(params.limit ?? DEFAULT_PAGE_LIMIT) || DEFAULT_PAGE_LIMIT
    )
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Builds PaginationMeta from total count and current page/limit.
 */
export function buildPaginationMeta(
  totalCount: number,
  currentPage: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  return {
    totalCount,
    totalPages,
    currentPage,
  };
}
