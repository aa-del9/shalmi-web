/**
 * Shared error messages for auth guards.
 * Use these when catching errors from requireSession / requireAdmin / ensureAdminSession.
 */
export const AUTH_GUARD_ERRORS = {
  /** No session or user (e.g. not signed in) */
  SESSION_REQUIRED: 'Unauthorized: session required',
  /** Session exists but role is not allowed (e.g. not admin) */
  ADMIN_REQUIRED: 'Unauthorized: admin access required',
} as const;

export type AuthGuardErrorCode = keyof typeof AUTH_GUARD_ERRORS;
