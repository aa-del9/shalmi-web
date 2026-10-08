/**
 * WhatsApp worker entrypoint.
 *
 * Boots the Hono webhook server, starts the inbound + outbound
 * BullMQ consumers, and wires graceful shutdown so SIGTERM /
 * SIGINT drains queues + closes Redis cleanly.
 *
 * Lazy env loading: queue construction, waapi calls, and Gemini
 * each read process.env when they actually need it. The process
 * boots even when REDIS_URL, WAAPI_*, or GEMINI_API_KEY are missing
 * — failures surface at request time instead of startup.
 */

import { serve } from '@hono/node-server';
import { buildApp } from './webhook';
import { closeQueues } from './queues';
import { startInboundWorker } from './workers/inbound';
import { startOutboundWorker } from './workers/outbound';

const app = buildApp();
const port = Number(process.env.PORT) || 3000;

const server = serve({ fetch: app.fetch, port }, (info) => {
  // eslint-disable-next-line no-console
  console.log(`whatsapp-worker listening on :${info.port}`);
});

let inboundWorker: ReturnType<typeof startInboundWorker> | null = null;
let outboundWorker: ReturnType<typeof startOutboundWorker> | null = null;

if (process.env.REDIS_URL) {
  try {
    inboundWorker = startInboundWorker();
    outboundWorker = startOutboundWorker();
    // eslint-disable-next-line no-console
    console.log('whatsapp-worker: BullMQ workers started');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      'whatsapp-worker: failed to start BullMQ workers:',
      err instanceof Error ? err.message : String(err)
    );
  }
} else {
  // eslint-disable-next-line no-console
  console.warn(
    'whatsapp-worker: REDIS_URL not set — running without queue consumers (webhook ingest still works for diagnostics).'
  );
}

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  // eslint-disable-next-line no-console
  console.log(`whatsapp-worker: ${signal} received, draining…`);

  const tasks: Array<Promise<unknown>> = [];
  if (inboundWorker) tasks.push(inboundWorker.close());
  if (outboundWorker) tasks.push(outboundWorker.close());
  await Promise.allSettled(tasks);
  await closeQueues();

  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });

  // eslint-disable-next-line no-console
  console.log('whatsapp-worker: shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
