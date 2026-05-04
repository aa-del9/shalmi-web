/**
 * Inbound consumer.
 *
 * For each `InboundJobPayload` on the inbound queue:
 *   1. Resolve identity by E.164 phone (active users only).
 *   2. Atomically flip the first-contact flag (race-safe, single SQL).
 *   3. Load or create a `whatsapp_conversations` row.
 *   4. Update the inbound `whatsapp_messages` row with `user_id` /
 *      status.
 *   5. Build a hardcoded reply (welcome on first contact + echo).
 *   6. Push an outbound job for the reply.
 *
 * No LLM in this phase — Phase 6 swaps the hardcoded echo for the
 * Gemini tool-use loop.
 */

import { Worker, type Job } from 'bullmq';
import { and, eq, isNull, sql } from 'drizzle-orm';
import {
  db,
  user,
  vendors,
  whatsappConversations,
  whatsappMessages,
} from '@repo/database';
import type { InboundJobPayload } from '@repo/whatsapp-core';
import { INBOUND_QUEUE_NAME, getOutboundQueue, getRedisConnection } from '../queues';

const UNRECOGNIZED_REPLY =
  "We don't recognize this number. Please contact Shalmi support.";

interface ResolvedIdentity {
  userId: string;
  shopName: string | null;
  vendorId: string | null;
}

async function resolveIdentity(phoneE164: string): Promise<ResolvedIdentity | null> {
  // Look up the user by phone. Vendor row is optional — non-vendor
  // users still get the welcome path so any future buyer integration
  // can reuse this same plumbing.
  const rows = await db
    .select({
      userId: user.id,
      shopName: vendors.shopName,
      vendorId: vendors.id,
      userName: user.name,
    })
    .from(user)
    .leftJoin(vendors, eq(vendors.userId, user.id))
    .where(eq(user.phoneNumber, phoneE164))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return {
    userId: row.userId,
    shopName: row.shopName ?? row.userName ?? null,
    vendorId: row.vendorId,
  };
}

interface FirstContactResult {
  isFirstContact: boolean;
}

async function atomicallyFlipFirstSeen(
  userId: string
): Promise<FirstContactResult> {
  const flipped = await db
    .update(user)
    .set({
      whatsappFirstSeenAt: sql`now()`,
      whatsappLastSeenAt: sql`now()`,
    })
    .where(and(eq(user.id, userId), isNull(user.whatsappFirstSeenAt)))
    .returning({ id: user.id });

  if (flipped.length > 0) {
    return { isFirstContact: true };
  }

  await db
    .update(user)
    .set({ whatsappLastSeenAt: sql`now()` })
    .where(eq(user.id, userId));

  return { isFirstContact: false };
}

async function upsertConversation(
  phoneE164: string,
  userId: string
): Promise<void> {
  const [existing] = await db
    .select({ id: whatsappConversations.id, userId: whatsappConversations.userId })
    .from(whatsappConversations)
    .where(eq(whatsappConversations.phone, phoneE164))
    .limit(1);

  if (!existing) {
    await db
      .insert(whatsappConversations)
      .values({
        phone: phoneE164,
        userId,
        role: 'vendor',
        state: 'idle',
        recentTurns: [],
        lastMessageAt: sql`now()`,
      })
      .onConflictDoUpdate({
        target: whatsappConversations.phone,
        set: {
          userId,
          lastMessageAt: sql`now()`,
          updatedAt: sql`now()`,
        },
      });
    return;
  }

  await db
    .update(whatsappConversations)
    .set({
      userId,
      lastMessageAt: sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(eq(whatsappConversations.id, existing.id));
}

async function markInboundProcessed(
  metaMessageId: string,
  userId: string | null
): Promise<void> {
  await db
    .update(whatsappMessages)
    .set({ userId, status: 'processed' })
    .where(eq(whatsappMessages.metaMessageId, metaMessageId));
}

function buildVendorReply(opts: {
  shopName: string | null;
  body: string | null;
  isFirstContact: boolean;
}): string {
  const greetingName = opts.shopName?.trim() ? opts.shopName.trim() : 'there';
  const welcome =
    `Hi ${greetingName}, this is Shalmi. You can ask about your orders, ` +
    `update stock and prices, change order status, and more. ` +
    `Type 'help' anytime to see what I can do.`;

  const safeBody = (opts.body ?? '').trim();
  const echo = safeBody
    ? `You said: "${safeBody}". The bot brain is coming online soon.`
    : `Got your message. The bot brain is coming online soon.`;

  return opts.isFirstContact ? `${welcome}\n\n${echo}` : echo;
}

export function startInboundWorker(): Worker<InboundJobPayload> {
  const worker = new Worker<InboundJobPayload>(
    INBOUND_QUEUE_NAME,
    async (job: Job<InboundJobPayload>) => {
      const { message } = job.data;
      const identity = await resolveIdentity(message.phone);

      if (!identity) {
        // Unknown phone — reply once and stop.
        await markInboundProcessed(message.metaMessageId, null);
        await getOutboundQueue().add('send', {
          phoneE164: message.phone,
          body: UNRECOGNIZED_REPLY,
          userId: null,
          inReplyToMessageId: message.metaMessageId,
        });
        return { result: 'unrecognized' };
      }

      const { isFirstContact } = await atomicallyFlipFirstSeen(identity.userId);
      await upsertConversation(message.phone, identity.userId);
      await markInboundProcessed(message.metaMessageId, identity.userId);

      const reply = buildVendorReply({
        shopName: identity.shopName,
        body: message.body,
        isFirstContact,
      });

      await getOutboundQueue().add('send', {
        phoneE164: message.phone,
        body: reply,
        userId: identity.userId,
        inReplyToMessageId: message.metaMessageId,
      });

      return { result: 'ok', isFirstContact };
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
    }
  );

  worker.on('failed', (job, err) => {
    // eslint-disable-next-line no-console
    console.error(
      `[inbound] job ${job?.id ?? '?'} failed: ${err.message}`
    );
  });

  return worker;
}
