import { headers } from 'next/headers';
import { auth } from '@/modules/auth/server/auth-client';

/**
 * Gets the current session from the request (server action / RSC).
 * Call this in server actions or server components that need the current user.
 * @returns Session object with user (and session) or null if not signed in
 */
export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}
