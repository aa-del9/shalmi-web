import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, user } from '@repo/database';
import { signupSchema } from '@repo/schemas/auth/signup';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireSession } from '@/modules/auth/server/guards/require-session';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';

/**
 * Post-signup hook (Batch 7).
 *
 * Better-auth's `signUpOnVerification` creates the user row at OTP-verify
 * time with `name = phoneNumber`. The signup form has separately collected
 * `name + retailerType` (and shop fields for shopkeepers); the OTP screen
 * drains those out of `sessionStorage` after a successful verify and POSTs
 * them here.
 *
 * Per buyer-signup-generic Q8(b) — sessionStorage is the carrier; this
 * route is the consumer that writes the captured fields onto the now-
 * authenticated user row.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    requireSession(session);
    const userId = (session.user as { id: string }).id;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError('Invalid JSON body', 400);
    }

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const message = Object.values(flat)[0]?.[0] ?? 'Invalid signup payload';
      return jsonError(message, 400);
    }

    const data = parsed.data;
    const updateValues: Record<string, unknown> = {
      name: data.name,
      retailerType: data.retailerType,
      updatedAt: new Date(),
    };
    if (data.retailerType === 'shopkeeper') {
      updateValues.shopName = data.shopName;
      updateValues.shopAddress = data.shopAddress;
    }

    await db.update(user).set(updateValues).where(eq(user.id, userId));

    return jsonSuccess({ ok: true });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === AUTH_GUARD_ERRORS.SESSION_REQUIRED) {
        return jsonError(err.message, 401);
      }
    }
    console.error('POST /api/auth/post-signup error:', err);
    return jsonError('Failed to finalise signup', 500);
  }
}
