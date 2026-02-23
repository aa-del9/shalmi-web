import { getSession } from '@/modules/auth/server/session';
import { requireAdmin, requireVendor } from './require-role';

export async function ensureAdminSession() {
  const session = await getSession();
  requireAdmin(session);
  return session;
}

export async function ensureVendorSession() {
  const session = await getSession();
  requireVendor(session);
  return session;
}
