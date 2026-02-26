import { eq } from 'drizzle-orm';
import { db, vendors } from '@repo/database';

type SessionWithUser = { user: { id: string } };

/**
 * Resolves the vendor record id for the current session user.
 * Call after requireVendor(session) so session.user.id is the auth user id.
 * @returns vendors.id if found, null otherwise (e.g. vendor record missing)
 */
export async function getVendorIdFromSession(
  session: SessionWithUser
): Promise<string | null> {
  const rows = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(eq(vendors.userId, session.user.id))
    .limit(1);

  const row = rows[0];
  return row?.id ?? null;
}
