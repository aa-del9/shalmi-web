/**
 * Outbound consumer.
 *
 * Logs an outbound `whatsapp_messages` row before calling waapi.app
 * so audit trails survive a network blip. On success the row is
 * updated with waapi's `_serialized` message id and `status='sent'`.
 * On failure it carries the error and `status='failed'`.
 *
 * BullMQ retries the job 3 times with exponential backoff (set in
 * `queues/index.ts`).
 *
 * waapi has no 24-hour customer-service window — both inbound and
 * outbound flow freely while the WhatsApp account stays paired.
 */

import { Worker, type Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { db, whatsappMessages } from '@repo/database';
import {
  sendTextMessage,
  type OutboundJobPayload,
} from '@repo/whatsapp-core';
import { OUTBOUND_QUEUE_NAME, getRedisConnection } from '../queues';

async function logPendingOutbound(
  payload: OutboundJobPayload
): Promise<string> {
  const [row] = await db
    .insert(whatsappMessages)
    .values({
      phone: payload.phone,
      userId: payload.userId ?? null,
      direction: 'outbound',
      body: payload.body,
      messageType: 'text',
      status: 'pending',
    })
    .returning({ id: whatsappMessages.id });
  if (!row) {
    throw new Error('failed to log outbound whatsapp message');
  }
  return row.id;
}

async function markOutboundSent(
  rowId: string,
  metaMessageId: string,
  startedAt: number
): Promise<void> {
  const latencyMs = Date.now() - startedAt;
  await db
    .update(whatsappMessages)
    .set({
      metaMessageId: metaMessageId.length > 0 ? metaMessageId : null,
      status: 'sent',
      latencyMs,
    })
    .where(eq(whatsappMessages.id, rowId));
}

async function markOutboundFailed(
  rowId: string,
  err: unknown,
  startedAt: number
): Promise<void> {
  const latencyMs = Date.now() - startedAt;
  const message = err instanceof Error ? err.message : String(err);
  await db
    .update(whatsappMessages)
    .set({
      status: 'failed',
      error: message.slice(0, 1000),
      latencyMs,
    })
    .where(eq(whatsappMessages.id, rowId));
}

export function startOutboundWorker(): Worker<OutboundJobPayload> {
  const worker = new Worker<OutboundJobPayload>(
    OUTBOUND_QUEUE_NAME,
    async (job: Job<OutboundJobPayload>) => {
      const startedAt = Date.now();
      const rowId = await logPendingOutbound(job.data);

      try {
        const result = await sendTextMessage({
          chatId: job.data.chatId,
          body: job.data.body,
        });
        await markOutboundSent(rowId, result.messageId, startedAt);
        return { messageId: result.messageId, status: result.status };
      } catch (err) {
        await markOutboundFailed(rowId, err, startedAt);
        throw err;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
    }
  );

  worker.on('failed', (job, err) => {
    // eslint-disable-next-line no-console
    console.error(
      `[outbound] job ${job?.id ?? '?'} failed: ${err.message}`
    );
  });

  return worker;
}
