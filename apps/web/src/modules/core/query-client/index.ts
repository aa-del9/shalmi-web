/**
 * React Query Client Configuration
 *
 * This module provides the QueryClient singleton for the application.
 * Uses the factory from @repo/utils/react-query with app-specific overrides.
 *
 * Pattern: SSR-safe singleton
 * - In browser: reuses the same QueryClient instance
 * - In SSR: creates a new QueryClient per request to avoid data leaks
 */

import { createQueryClient } from '@repo/utils/react-query';
import { STALE_TIME_STANDARD } from '@repo/constants/query';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Browser-side singleton instance.
 * This is only set on the client (typeof window !== 'undefined').
 */
let browserQueryClient: QueryClient | undefined;

/**
 * Create or get the QueryClient instance.
 *
 * This follows the recommended pattern for Next.js App Router:
 * - Server: Always create a new QueryClient (prevents cross-request data leaks)
 * - Client: Create once and reuse (preserves cache across navigations)
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
 *
 * @example
 * ```tsx
 * // In providers.tsx
 * "use client";
 * import { getQueryClient } from "@/modules/core/query-client";
 *
 * export function Providers({ children }) {
 *   const queryClient = getQueryClient();
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       {children}
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 */
export function getQueryClient(): QueryClient {
  // Server: always create a new query client
  if (typeof window === 'undefined') {
    return createQueryClient({
      staleTime: STALE_TIME_STANDARD,
      // Disable retries during SSR to avoid waterfall delays
      retryCount: 0,
    });
  }

  // Browser: create once, then reuse
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient({
      staleTime: STALE_TIME_STANDARD,
    });
  }

  return browserQueryClient;
}

/**
 * Reset the browser query client.
 * Useful for testing or when you need to clear all cached data.
 */
export function resetQueryClient(): void {
  if (typeof window !== 'undefined') {
    browserQueryClient = undefined;
  }
}
