/**
 * Standard shape for server action results.
 * Use for create/update/delete actions that need to signal success or a user-facing error.
 */
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Metadata for paginated list responses.
 */
export type PaginationMeta = {
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

/**
 * Standard shape for paginated server action results.
 * Use for list/fetch actions that return a page of items plus pagination info.
 */
export type PaginatedActionResult<T> =
  | { success: true; data: T[]; meta: PaginationMeta }
  | { success: false; error: string };
