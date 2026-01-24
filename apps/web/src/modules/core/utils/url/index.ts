/**
 * URL-related utilities
 */

import { clientEnv } from '../../env/client';

/**
 * Returns the base URL for the application.
 * Handles Vercel preview deployments with dynamic URLs.
 */
export function getBaseUrl(): string {
  // Browser: use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Vercel preview/production deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development fallback
  return clientEnv.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5181';
}
