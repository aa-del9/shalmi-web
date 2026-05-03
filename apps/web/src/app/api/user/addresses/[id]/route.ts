import type { NextRequest } from 'next/server';
import { and, eq, ne } from 'drizzle-orm';
import { db, addresses } from '@repo/database';
import { z } from 'zod';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireSession } from '@/modules/auth/server/guards/require-session';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const updateAddressSchema = z
  .object({
    title: z.string().min(1).optional(),
    recipientName: z.string().min(1).optional(),
    recipientPhone: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    postalCode: optionalString,
    province: optionalString,
    isDefault: z.boolean().optional(),
  })
  .strict();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    requireSession(session);

    const userId = (session.user as { id: string }).id;
    const { id: addressId } = await params;

    const [existing] = await db
      .select({ id: addresses.id })
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .limit(1);

    if (!existing) {
      return jsonError('Address not found', 404);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError('Invalid JSON body', 400);
    }

    const parsed = updateAddressSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const message =
        Object.values(first)[0]?.[0] ?? 'Invalid address payload';
      return jsonError(message, 400);
    }

    const data = parsed.data;

    // Cascade-unset other defaults when promoting this one (mirrors POST).
    if (data.isDefault === true) {
      await db
        .update(addresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(
          and(eq(addresses.userId, userId), ne(addresses.id, addressId))
        );
    }

    const updateValues: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (data.title !== undefined) updateValues.title = data.title;
    if (data.recipientName !== undefined)
      updateValues.recipientName = data.recipientName;
    if (data.recipientPhone !== undefined)
      updateValues.recipientPhone = data.recipientPhone;
    if (data.address !== undefined) updateValues.address = data.address;
    if (data.city !== undefined) updateValues.city = data.city;
    if (data.postalCode !== undefined)
      updateValues.postalCode = data.postalCode ?? null;
    if (data.province !== undefined)
      updateValues.province = data.province ?? null;
    if (data.isDefault !== undefined) updateValues.isDefault = data.isDefault;

    const [updated] = await db
      .update(addresses)
      .set(updateValues)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .returning();

    if (!updated) {
      return jsonError('Failed to update address', 500);
    }

    return jsonSuccess(updated);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === AUTH_GUARD_ERRORS.SESSION_REQUIRED) {
        return jsonError(err.message, 401);
      }
    }
    console.error('PATCH /api/user/addresses/[id] error:', err);
    return jsonError('Failed to update address', 500);
  }
}
