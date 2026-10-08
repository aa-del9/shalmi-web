import type { NextRequest } from 'next/server';
import { and, desc, eq, gte, isNull } from 'drizzle-orm';
import { db, whatsappMessages } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireAdmin } from '@/modules/auth/server/guards/require-role';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_LIMIT = 200;

export type UnrecognizedMessage = {
  id: string;
  phone: string;
  body: string | null;
  messageType: string;
  createdAt: string;
};

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    requireAdmin(session);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : AUTH_GUARD_ERRORS.SESSION_REQUIRED;
    const status = message === AUTH_GUARD_ERRORS.ADMIN_REQUIRED ? 403 : 401;
    return jsonError(message, status);
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.max(
    1,
    Math.min(MAX_LIMIT, Number(searchParams.get('limit')) || MAX_LIMIT)
  );

  try {
    const since = new Date(Date.now() - THIRTY_DAYS_MS);

    const rows = await db
      .select({
        id: whatsappMessages.id,
        phone: whatsappMessages.phone,
        body: whatsappMessages.body,
        messageType: whatsappMessages.messageType,
        createdAt: whatsappMessages.createdAt,
      })
      .from(whatsappMessages)
      .where(
        and(
          eq(whatsappMessages.direction, 'inbound'),
          isNull(whatsappMessages.userId),
          gte(whatsappMessages.createdAt, since)
        )
      )
      .orderBy(desc(whatsappMessages.createdAt))
      .limit(limit);

    const data: UnrecognizedMessage[] = rows.map((row) => ({
      id: row.id,
      phone: row.phone,
      body: row.body,
      messageType: row.messageType,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : (row.createdAt as unknown as string),
    }));

    return jsonSuccess(data);
  } catch (err) {
    console.error('GET /api/admin/whatsapp-unrecognized error:', err);
    return jsonError('Failed to load unrecognized WhatsApp messages.', 500);
  }
}
