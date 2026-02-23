import { NextResponse } from 'next/server';

/** Pagination meta shape for list endpoints */
export type JsonPaginationMeta = {
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

/** Success payload with optional data and/or meta */
export type JsonSuccessBody<T = unknown> = {
  success: true;
  data?: T;
  meta?: JsonPaginationMeta;
};

/** Error payload */
export type JsonErrorBody = {
  success: false;
  error: string;
};

/** Union of standard API JSON body shapes */
export type JsonApiBody<T = unknown> = JsonSuccessBody<T> | JsonErrorBody;

/**
 * Sends a JSON response with the given body and status.
 * Use in route handlers (GET/POST/etc.) for consistent API responses.
 */
export function jsonResponse<T = unknown>(
  body: JsonApiBody<T>,
  status: number = 200
): NextResponse<JsonApiBody<T>> {
  return NextResponse.json(body, { status });
}

/**
 * Sends a success JSON response.
 * @param data - Optional payload (e.g. list items)
 * @param meta - Optional pagination meta
 * @param status - HTTP status (default 200)
 */
export function jsonSuccess<T = unknown>(
  data?: T,
  meta?: JsonPaginationMeta,
  status: number = 200
): NextResponse<JsonSuccessBody<T>> {
  const body: JsonSuccessBody<T> = { success: true };
  if (data !== undefined) body.data = data;
  if (meta !== undefined) body.meta = meta;
  return NextResponse.json(body, { status });
}

/**
 * Sends an error JSON response.
 * @param message - User-facing error message
 * @param status - HTTP status (default 400)
 */
export function jsonError(
  message: string,
  status: number = 400
): NextResponse<JsonErrorBody> {
  return NextResponse.json({ success: false, error: message }, { status });
}
