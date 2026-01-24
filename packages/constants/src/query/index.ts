/**
 * React Query configuration constants
 *
 * These constants define sensible defaults for different data freshness requirements.
 * Use these to configure staleTime and gcTime for your queries.
 */

// =============================================================================
// Stale Times (how long data is considered fresh)
// =============================================================================

/**
 * For data that rarely changes (e.g., app configuration, static lists)
 * Data will be fresh for 30 minutes
 */
export const STALE_TIME_STATIC = 30 * 60 * 1000; // 30 minutes

/**
 * For data that changes occasionally (e.g., user profiles, products)
 * Data will be fresh for 5 minutes
 */
export const STALE_TIME_STANDARD = 5 * 60 * 1000; // 5 minutes

/**
 * For data that changes frequently (e.g., notifications, inventory counts)
 * Data will be fresh for 1 minute
 */
export const STALE_TIME_DYNAMIC = 1 * 60 * 1000; // 1 minute

/**
 * For real-time data that should always be refetched
 * Data is immediately stale
 */
export const STALE_TIME_REALTIME = 0;

// =============================================================================
// Garbage Collection Times (how long inactive data stays in cache)
// =============================================================================

/**
 * Default garbage collection time
 * Inactive queries will be removed after 5 minutes
 */
export const GC_TIME_DEFAULT = 5 * 60 * 1000; // 5 minutes

/**
 * Extended garbage collection time for data that's expensive to refetch
 * Inactive queries will be removed after 30 minutes
 */
export const GC_TIME_EXTENDED = 30 * 60 * 1000; // 30 minutes

/**
 * Short garbage collection time for frequently changing data
 * Inactive queries will be removed after 1 minute
 */
export const GC_TIME_SHORT = 1 * 60 * 1000; // 1 minute

// =============================================================================
// Retry Configuration
// =============================================================================

/**
 * Default number of retry attempts for failed queries
 */
export const DEFAULT_RETRY_COUNT = 3;

/**
 * Base delay for exponential backoff (in milliseconds)
 */
export const RETRY_BASE_DELAY = 1000; // 1 second

/**
 * Maximum delay for exponential backoff (in milliseconds)
 */
export const RETRY_MAX_DELAY = 30 * 1000; // 30 seconds
