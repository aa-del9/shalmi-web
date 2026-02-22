import { USER_ROLES } from '@/modules/core/constants/user-roles';
import { AUTH_GUARD_ERRORS } from './errors';
import { requireSession } from './require-session';

type SessionLike = { user?: { role?: string } } | null;

/**
 * Asserts that the session user has the given role.
 * Call after requireSession() when you need a specific role.
 * @throws Error with AUTH_GUARD_ERRORS.SESSION_REQUIRED if no session
 * @throws Error with AUTH_GUARD_ERRORS.ADMIN_REQUIRED if role is not admin (when checking for admin)
 */
export function requireRole(
  session: SessionLike,
  role: string
): asserts session is NonNullable<SessionLike> & { user: { role: string } } {
  requireSession(session);
  const user = (session as { user: { role?: string } }).user;
  if (user.role !== role) {
    throw new Error(AUTH_GUARD_ERRORS.ADMIN_REQUIRED);
  }
}

/**
 * Asserts that the session belongs to an admin.
 * Composed from requireSession + requireRole(session, ADMIN).
 * @throws Error with AUTH_GUARD_ERRORS.SESSION_REQUIRED if no session
 * @throws Error with AUTH_GUARD_ERRORS.ADMIN_REQUIRED if not admin
 */
export function requireAdmin(
  session: SessionLike
): asserts session is NonNullable<SessionLike> & { user: { role: string } } {
  requireRole(session, USER_ROLES.ADMIN);
}

export function requireVendor(
  session: SessionLike
): asserts session is NonNullable<SessionLike> & { user: { role: string } } {
  requireRole(session, USER_ROLES.VENDOR);
}
