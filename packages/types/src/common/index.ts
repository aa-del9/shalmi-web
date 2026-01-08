/**
 * Common utility types used across the application
 */

import { type ReactNode } from "react";

// ============================================================================
// Component Props Utilities
// ============================================================================

/**
 * Enforces children prop on a component
 */
export type WithChildren<P = unknown> = P & {
  children: ReactNode;
};

/**
 * Optional children prop
 */
export type WithOptionalChildren<P = unknown> = P & {
  children?: ReactNode;
};

/**
 * Optional className prop
 */
export type WithClassName<P = unknown> = P & {
  className?: string;
};

/**
 * Combined className and children props
 */
export type WithClassNameAndChildren<P = unknown> = WithClassName<P> &
  WithChildren<P>;

/**
 * Combined className and optional children props
 */
export type WithClassNameAndOptionalChildren<P = unknown> = WithClassName<P> &
  WithOptionalChildren<P>;

// ============================================================================
// Next.js Page Props
// ============================================================================

/**
 * Type for Next.js search parameters
 */
export type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Type for page props with search params
 */
export type WithSearchParams<P = SearchParams, Q = unknown> = Q & {
  searchParams: Promise<P>;
};

/**
 * Type for page props with route params
 */
export type WithParams<P = Record<string, string>, Q = unknown> = Q & {
  params: Promise<P>;
};

/**
 * Combined page props with both params and search params
 */
export type PageProps<
  TParams = Record<string, string>,
  TSearchParams = SearchParams,
> = WithParams<TParams> & WithSearchParams<TSearchParams>;

// ============================================================================
// Generic Utility Types
// ============================================================================

/**
 * Get value type from object type
 */
export type ValueOf<T> = T[keyof T];

/**
 * Get key type from object type (alias for keyof)
 */
export type KeyOf<T> = keyof T;

/**
 * Make all properties writeable (remove readonly)
 */
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Deep partial - make all nested properties optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Add AbortSignal to a type
 */
export type WithSignal<T> = T & { signal?: AbortSignal };

/**
 * Make specific keys required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific keys optional
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null;

/**
 * Maybe type helper (null or undefined)
 */
export type Maybe<T> = T | null | undefined;

// ============================================================================
// Enums
// ============================================================================

/**
 * Deployment environment enum
 */
export enum DeploymentEnvironment {
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production",
  LOCAL = "local",
}

/**
 * Sort order enum
 */
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}
