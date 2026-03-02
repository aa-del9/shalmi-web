import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, addresses } from '@repo/database';
import { z } from 'zod';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireSession } from '@/modules/auth/server/guards/require-session';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';

const createAddressSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  recipientName: z.string().min(1, 'Recipient name is required'),
  recipientPhone: z.string().min(1, 'Recipient phone is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  isDefault: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    requireSession(session);

    const userId = (session.user as { id: string }).id;

    const rows = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId));

    return jsonSuccess(rows);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === AUTH_GUARD_ERRORS.SESSION_REQUIRED) {
        return jsonError(err.message, 401);
      }
    }
    console.error('GET /api/user/addresses error:', err);
    return jsonError('Failed to fetch addresses', 500);
  }
}

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

    const parsed = createAddressSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const message =
        Object.values(first)[0]?.[0] ?? 'Invalid address payload';
      return jsonError(message, 400);
    }

    const { title, recipientName, recipientPhone, address, city, isDefault } =
      parsed.data;

    if (isDefault === true) {
      await db
        .update(addresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(addresses.userId, userId));
    }

    const [created] = await db
      .insert(addresses)
      .values({
        userId,
        title,
        recipientName,
        recipientPhone,
        address,
        city,
        isDefault: isDefault ?? false,
      })
      .returning();

    if (!created) {
      return jsonError('Failed to create address', 500);
    }

    return jsonSuccess(created, undefined, 201);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === AUTH_GUARD_ERRORS.SESSION_REQUIRED) {
        return jsonError(err.message, 401);
      }
    }
    console.error('POST /api/user/addresses error:', err);
    return jsonError('Failed to create address', 500);
  }
}
