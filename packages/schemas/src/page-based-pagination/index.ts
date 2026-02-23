/**
 * Page-based pagination schemas
 */

import { z } from 'zod';

/**
 * Pagination metadata schema
 */
export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/**
 * Pagination params schema (for query params)
 */
export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationParamsSchema>;

/**
 * Create a paginated response schema for any data type
 */
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: z.array(dataSchema),
    meta: paginationMetaSchema,
  });

/**
 * Generic paginated response type helper
 */
export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

/**
 * Cursor-based pagination meta schema
 */
export const cursorPaginationMetaSchema = z.object({
  nextCursor: z.string().optional(),
  prevCursor: z.string().optional(),
  hasMore: z.boolean(),
});

export type CursorPaginationMeta = z.infer<typeof cursorPaginationMetaSchema>;

/**
 * Cursor pagination params schema
 */
export const cursorPaginationParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CursorPaginationParams = z.infer<
  typeof cursorPaginationParamsSchema
>;
