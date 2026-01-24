/**
 * React Query helper utilities
 *
 * Production-grade utilities for TanStack React Query v5
 */

import {
  QueryClient,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';

import {
  DEFAULT_RETRY_COUNT,
  GC_TIME_DEFAULT,
  RETRY_BASE_DELAY,
  RETRY_MAX_DELAY,
  STALE_TIME_STANDARD,
} from '@repo/constants/query';

// =============================================================================
// Query Client Factory
// =============================================================================

export interface CreateQueryClientOptions {
  /**
   * Default stale time for queries in milliseconds
   * @default STALE_TIME_STANDARD (5 minutes)
   */
  staleTime?: number;
  /**
   * Default garbage collection time for inactive queries
   * @default GC_TIME_DEFAULT (5 minutes)
   */
  gcTime?: number;
  /**
   * Number of retry attempts for failed queries
   * @default DEFAULT_RETRY_COUNT (3)
   */
  retryCount?: number;
  /**
   * Whether to refetch on window focus
   * @default false (disabled for better UX in B2B apps)
   */
  refetchOnWindowFocus?: boolean;
  /**
   * Whether to refetch on network reconnect
   * @default true
   */
  refetchOnReconnect?: boolean;
}

/**
 * Create a configured QueryClient with production-ready defaults.
 *
 * Features:
 * - Sensible stale and garbage collection times
 * - Exponential backoff retry with jitter
 * - Disabled refetch on window focus (better for B2B data entry)
 * - Enabled refetch on reconnect
 *
 * @example
 * ```ts
 * const queryClient = createQueryClient();
 *
 * // With custom options
 * const queryClient = createQueryClient({
 *   staleTime: STALE_TIME_DYNAMIC,
 *   refetchOnWindowFocus: true,
 * });
 * ```
 */
export function createQueryClient(
  options: CreateQueryClientOptions = {}
): QueryClient {
  const {
    staleTime = STALE_TIME_STANDARD,
    gcTime = GC_TIME_DEFAULT,
    retryCount = DEFAULT_RETRY_COUNT,
    refetchOnWindowFocus = false,
    refetchOnReconnect = true,
  } = options;

  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime,
        gcTime,
        refetchOnWindowFocus,
        refetchOnReconnect,
        retry: retryCount,
        retryDelay: (attemptIndex) => {
          // Exponential backoff with jitter
          const delay = Math.min(
            RETRY_BASE_DELAY * 2 ** attemptIndex,
            RETRY_MAX_DELAY
          );
          // Add jitter (±25% of delay)
          const jitter = delay * 0.25 * (Math.random() * 2 - 1);
          return delay + jitter;
        },
      },
      mutations: {
        retry: 0, // Don't retry mutations by default
      },
    },
  });
}

// =============================================================================
// Query Key Factory
// =============================================================================

/**
 * Creates a type-safe query key factory for a domain.
 *
 * This pattern ensures consistent, hierarchical query keys that are:
 * - Type-safe with full autocomplete
 * - Easy to invalidate at any level
 * - Self-documenting
 *
 * @example
 * ```ts
 * const productKeys = createQueryKeyFactory('products', {
 *   lists: () => ['list'] as const,
 *   list: (filters: ProductFilters) => ['list', filters] as const,
 *   details: () => ['detail'] as const,
 *   detail: (id: string) => ['detail', id] as const,
 * });
 *
 * // Usage
 * productKeys.all;           // ['products']
 * productKeys.lists();       // ['products', 'list']
 * productKeys.list({ page: 1 }); // ['products', 'list', { page: 1 }]
 * productKeys.detail('123'); // ['products', 'detail', '123']
 *
 * // Invalidation
 * queryClient.invalidateQueries({ queryKey: productKeys.all }); // All product queries
 * queryClient.invalidateQueries({ queryKey: productKeys.lists() }); // All product lists
 * ```
 */
export function createQueryKeyFactory<
  TDomain extends string,
  TKeys extends Record<string, (...args: never[]) => readonly unknown[]>,
>(
  domain: TDomain,
  keys: TKeys
): { all: readonly [TDomain] } & {
  [K in keyof TKeys]: (
    ...args: Parameters<TKeys[K]>
  ) => readonly [TDomain, ...ReturnType<TKeys[K]>];
} {
  const result = {
    all: [domain] as const,
  } as { all: readonly [TDomain] } & {
    [K in keyof TKeys]: (
      ...args: Parameters<TKeys[K]>
    ) => readonly [TDomain, ...ReturnType<TKeys[K]>];
  };

  for (const key of Object.keys(keys) as Array<keyof TKeys>) {
    const keyFn = keys[key]!;
    (result as Record<keyof TKeys, unknown>)[key] = (
      ...args: Parameters<TKeys[typeof key]>
    ) => [domain, ...keyFn(...args)] as const;
  }

  return result;
}

// =============================================================================
// Infinite Query Utilities
// =============================================================================

/**
 * Extract flattened data from React Query infinite query data.
 *
 * @example
 * ```ts
 * const { data } = useInfiniteQuery({...});
 * const allProducts = getInfiniteQueryData(data, (page) => page.products);
 * ```
 */
export function getInfiniteQueryData<TPage, TItem>(
  infiniteData: InfiniteData<TPage> | undefined,
  getter: (page: TPage) => TItem[]
): TItem[] {
  return infiniteData?.pages.flatMap(getter) ?? [];
}

/**
 * Get total count from infinite query data (typically from first page).
 *
 * @example
 * ```ts
 * const { data } = useInfiniteQuery({...});
 * const totalCount = getInfiniteQueryCount(data, (page) => page.totalCount);
 * ```
 */
export function getInfiniteQueryCount<TPage>(
  infiniteData: InfiniteData<TPage> | undefined,
  countGetter: (page: TPage) => number
): number {
  const firstPage = infiniteData?.pages[0];
  return firstPage ? countGetter(firstPage) : 0;
}

// =============================================================================
// Error Handling Utilities
// =============================================================================

/**
 * Standard error shape for API responses
 */
export interface QueryErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Type guard to check if an error matches the QueryErrorResponse shape.
 */
export function isQueryErrorResponse(
  error: unknown
): error is QueryErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as QueryErrorResponse).message === 'string'
  );
}

/**
 * Extract a user-friendly error message from a query error.
 *
 * Handles various error shapes:
 * - Standard Error objects
 * - API error responses with message field
 * - Axios errors with response.data.message
 * - Unknown errors with fallback message
 *
 * @example
 * ```ts
 * const { error } = useQuery({...});
 * if (error) {
 *   toast.error(getQueryErrorMessage(error));
 * }
 * ```
 */
export function getQueryErrorMessage(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred. Please try again.'
): string {
  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // API error response shape
  if (isQueryErrorResponse(error)) {
    return error.message;
  }

  // Axios-style error with nested response
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object'
  ) {
    const response = (error as { response: { data?: unknown } }).response;
    if (response.data && isQueryErrorResponse(response.data)) {
      return response.data.message;
    }
  }

  return fallbackMessage;
}

// =============================================================================
// Query State Utilities
// =============================================================================

/**
 * Check if a query should show loading state (first load only).
 * Useful for avoiding loading spinners on background refetches.
 *
 * @example
 * ```ts
 * const query = useQuery({...});
 * if (isQueryLoading(query.isPending, query.isFetching, query.data)) {
 *   return <Skeleton />;
 * }
 * ```
 */
export function isQueryLoading<T>(
  isPending: boolean,
  isFetching: boolean,
  data: T | undefined
): boolean {
  // Show loading only on initial load, not on background refetch
  return isPending || (isFetching && data === undefined);
}

/**
 * Prefetch helper that logs errors in development.
 *
 * @example
 * ```ts
 * await safePrefetch(
 *   queryClient,
 *   productKeys.detail(id),
 *   () => fetchProduct(id)
 * );
 * ```
 */
export async function safePrefetch<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  queryFn: () => Promise<T>
): Promise<void> {
  try {
    await queryClient.prefetchQuery({ queryKey, queryFn });
  } catch (error) {
    console.warn('[safePrefetch] Failed to prefetch:', queryKey, error);
  }
}
