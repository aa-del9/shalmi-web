/**
 * BullMQ queue factory for the WhatsApp worker.
 *
 * Lazy initialization: the connection + queues are constructed on
 * first access so the worker can boot in environments where Redis
 * is misconfigured or unreachable. The webhook handler will fail
 * loudly when it actually tries to enqueue.
 */

import { Queue, type ConnectionOptions } from 'bullmq';
import IORedis, { type Redis } from 'ioredis';
import type {
  InboundJobPayload,
  OutboundJobPayload,
} from '@repo/whatsapp-core';

// BullMQ v5 forbids `:` in queue names (collides with internal Redis
// key separators), so we use `-`.
export const INBOUND_QUEUE_NAME = 'whatsapp-inbound';
export const OUTBOUND_QUEUE_NAME = 'whatsapp-outbound';

let connection: Redis | null = null;
let inboundQueue: Queue<InboundJobPayload> | null = null;
let outboundQueue: Queue<OutboundJobPayload> | null = null;

function getRedisUrl(): string {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error(
      'REDIS_URL is not set — the WhatsApp worker needs Redis for BullMQ.'
    );
  }
  return url;
}

export function getRedisConnection(): Redis {
  if (!connection) {
    connection = new IORedis(getRedisUrl(), {
      // BullMQ requirement: queue/worker connections must keep
      // retrying long-poll commands forever.
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    connection.on('error', (err) => {
      // Surface but don't crash the process — BullMQ will reconnect.
      // eslint-disable-next-line no-console
      console.error('[redis] connection error:', err.message);
    });
  }
  return connection;
}

function asConnectionOptions(): ConnectionOptions {
  return getRedisConnection();
}

export function getInboundQueue(): Queue<InboundJobPayload> {
  if (!inboundQueue) {
    inboundQueue = new Queue<InboundJobPayload>(INBOUND_QUEUE_NAME, {
      connection: asConnectionOptions(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2_000 },
        removeOnComplete: { age: 24 * 3600, count: 1_000 },
        removeOnFail: { age: 7 * 24 * 3600 },
      },
    });
  }
  return inboundQueue;
}

export function getOutboundQueue(): Queue<OutboundJobPayload> {
  if (!outboundQueue) {
    outboundQueue = new Queue<OutboundJobPayload>(OUTBOUND_QUEUE_NAME, {
      connection: asConnectionOptions(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2_000 },
        removeOnComplete: { age: 24 * 3600, count: 1_000 },
        removeOnFail: { age: 7 * 24 * 3600 },
      },
    });
  }
  return outboundQueue;
}

export async function closeQueues(): Promise<void> {
  const tasks: Array<Promise<void>> = [];
  if (inboundQueue) tasks.push(inboundQueue.close());
  if (outboundQueue) tasks.push(outboundQueue.close());
  await Promise.allSettled(tasks);
  inboundQueue = null;
  outboundQueue = null;
  if (connection) {
    await connection.quit().catch(() => undefined);
    connection = null;
  }
}
