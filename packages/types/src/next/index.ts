/**
 * Next.js-specific type helpers
 */

import type { Metadata, ResolvingMetadata } from 'next';

/**
 * Type for generateMetadata function params
 */
export type GenerateMetadataParams<
  TParams = Record<string, string>,
  TSearchParams = Record<string, string | string[] | undefined>,
> = {
  params: Promise<TParams>;
  searchParams: Promise<TSearchParams>;
};

/**
 * Type for generateMetadata function
 */
export type GenerateMetadataFn<
  TParams = Record<string, string>,
  TSearchParams = Record<string, string | string[] | undefined>,
> = (
  props: GenerateMetadataParams<TParams, TSearchParams>,
  parent: ResolvingMetadata
) => Promise<Metadata>;

/**
 * Layout props type
 */
export type LayoutProps<TParams = Record<string, string>> = {
  children: React.ReactNode;
  params: Promise<TParams>;
};

/**
 * Error page props
 */
export type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Not found page props (no props by default)
 */
export type NotFoundPageProps = Record<string, never>;

/**
 * Loading page props (no props by default)
 */
export type LoadingPageProps = Record<string, never>;

/**
 * Route handler context
 */
export type RouteHandlerContext<TParams = Record<string, string>> = {
  params: Promise<TParams>;
};

/**
 * Server action result type
 */
export type ServerActionResult<T = void, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };
