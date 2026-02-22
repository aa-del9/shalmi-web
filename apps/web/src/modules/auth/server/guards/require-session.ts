import { AUTH_GUARD_ERRORS } from './errors';

type SessionLike = { user?: unknown } | null;

/**
 * Asserts that a session exists and has a user.
 * Use after getSession() when the route requires any authenticated user.
 * @throws Error with AUTH_GUARD_ERRORS.SESSION_REQUIRED if no session or no user
 */
export function requireSession(session: SessionLike): asserts session is NonNullable<SessionLike> & { user: unknown } {
  if (!session?.user) {
    throw new Error(AUTH_GUARD_ERRORS.SESSION_REQUIRED);
  }
}
