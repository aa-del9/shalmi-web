/**
 * Hand-off bag carried from the signup form across the OTP boundary into
 * the post-signup hook. Per buyer-signup-generic gap-analysis Q8(b) — kept
 * in sessionStorage so it doesn't leak via URL params and is auto-cleaned
 * on tab close (abandoned signups don't leave server state).
 */

const STORAGE_KEY = 'shalmi-pending-signup';

export type RetailerType = 'generic' | 'shopkeeper';

export interface PendingSignup {
  retailerType: RetailerType;
  name: string;
  shopName?: string;
  shopAddress?: string;
}

export function setPendingSignup(payload: PendingSignup) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function readPendingSignup(): PendingSignup | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingSignup;
    if (parsed.retailerType !== 'generic' && parsed.retailerType !== 'shopkeeper')
      return null;
    if (typeof parsed.name !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingSignup() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
