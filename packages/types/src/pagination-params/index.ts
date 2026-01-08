/**
 * Pagination-related types
 */

/**
 * Page-based pagination params
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Cursor-based pagination params
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

/**
 * Offset-based pagination params
 */
export interface OffsetPaginationParams {
  offset: number;
  limit: number;
}

/**
 * Pagination metadata returned from API
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Cursor pagination metadata
 */
export interface CursorPaginationMeta {
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Cursor paginated response wrapper
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: CursorPaginationMeta;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  pageSize: 20,
};
