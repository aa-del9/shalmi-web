import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { USER_ROLES } from '@/modules/core/constants/user-roles';

/**
 * Accepts relative path (/path, /path?q=1) or same-origin full URL.
 * Rejects //evil.com, other origins, and invalid URLs.
 */
export function isSafeRedirectUrl(url: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  if (typeof window === 'undefined') return false;
  try {
    const u = new URL(url, window.location.origin);
    return u.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Returns pathname + search for router.push. Use after isSafeRedirectUrl.
 * For full same-origin URL we normalize to path so router stays in-app.
 */
export function getRedirectPath(redirectUrl: string): string {
  if (redirectUrl.startsWith('/') && !redirectUrl.startsWith('//'))
    return redirectUrl;
  if (typeof window === 'undefined') return redirectUrl;
  try {
    const u = new URL(redirectUrl, window.location.origin);
    if (u.origin !== window.location.origin) return '/';
    return u.pathname + u.search;
  } catch {
    return '/';
  }
}

/**
 * Post-login redirect: use explicit redirect if safe, else role-based
 * (admin → /admin, vendor → /vendor, retailer → /).
 */
export function getPostAuthRedirectUrl(
  redirectUrl: string | null,
  role?: string
): string {
  if (redirectUrl && isSafeRedirectUrl(redirectUrl))
    return getRedirectPath(redirectUrl);
  if (role === USER_ROLES.ADMIN) return ABSOLUTE_ROUTES.ADMIN;
  if (role === USER_ROLES.VENDOR) return ABSOLUTE_ROUTES.VENDOR;
  return ABSOLUTE_ROUTES.ROOT;
}

/**
 * Build full same-origin URL for redirect param so OTP page can redirect unambiguously.
 */
export function buildFullRedirectUrl(redirectUrl: string): string {
  if (typeof window === 'undefined') return redirectUrl;
  if (redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
    return `${window.location.origin}${redirectUrl}`;
  }
  return redirectUrl;
}
