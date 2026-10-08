/**
 * One-shot CLI to register the worker's webhook URL with waapi.app.
 *
 * Usage:
 *   pnpm --filter whatsapp-worker setup-webhook
 *
 * Required env (read at run time):
 *   WAAPI_API_TOKEN          Bearer token from waapi.app dashboard
 *   WAAPI_INSTANCE_ID        the paired instance id
 *   WAAPI_WEBHOOK_TOKEN      random string we choose; must match the
 *                            value the worker validates against
 *   WORKER_PUBLIC_URL        e.g. `https://shalmi-whatsapp-worker.up.railway.app`
 *                            (no trailing slash — the script appends
 *                            `/webhook/whatsapp/<token>`)
 *
 * Optional env:
 *   WAAPI_WEBHOOK_EVENTS     comma-separated event list to subscribe.
 *                            Defaults to `message,ready,qr,disconnected,authenticated`.
 *
 * What it does:
 *   1. Reads instance status (sanity check — the token is valid and
 *      the instance is paired).
 *   2. PUTs the webhook config to waapi.
 *   3. Re-reads the instance to confirm the webhook url + events
 *      were saved.
 */

import {
  getInstance,
  getInstanceClientStatus,
  setInstanceWebhook,
  WaapiApiError,
  WaapiConfigError,
} from '@repo/whatsapp-core';

const DEFAULT_EVENTS = [
  'message',
  'ready',
  'qr',
  'disconnected',
  'authenticated',
];

function readWorkerPublicUrl(): string {
  const url = process.env.WORKER_PUBLIC_URL;
  if (!url) throw new Error('WORKER_PUBLIC_URL is not set');
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function readWebhookToken(): string {
  const tok = process.env.WAAPI_WEBHOOK_TOKEN;
  if (!tok) throw new Error('WAAPI_WEBHOOK_TOKEN is not set');
  return tok;
}

function readSubscribedEvents(): string[] {
  const raw = process.env.WAAPI_WEBHOOK_EVENTS;
  if (!raw) return DEFAULT_EVENTS;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function divider(label: string): void {
  process.stdout.write(`\n── ${label} ${'─'.repeat(Math.max(0, 60 - label.length))}\n`);
}

async function main(): Promise<void> {
  const publicUrl = readWorkerPublicUrl();
  const token = readWebhookToken();
  const events = readSubscribedEvents();

  const webhookUrl = `${publicUrl}/webhook/whatsapp/${token}`;

  divider('config');
  process.stdout.write(`webhook url:    ${webhookUrl}\n`);
  process.stdout.write(`events:         ${events.join(', ')}\n`);

  divider('client status (before)');
  try {
    const status = await getInstanceClientStatus();
    process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
  } catch (err) {
    process.stdout.write(
      `status read failed: ${err instanceof Error ? err.message : String(err)}\n`
    );
  }

  divider('PUT instance webhook');
  const updated = await setInstanceWebhook({ url: webhookUrl, events });
  process.stdout.write(`${JSON.stringify(updated, null, 2)}\n`);

  divider('GET instance (after)');
  const after = await getInstance();
  process.stdout.write(`${JSON.stringify(after, null, 2)}\n`);

  process.stdout.write('\nsetup-webhook done.\n');
}

main().catch((err: unknown) => {
  if (err instanceof WaapiApiError) {
    process.stdout.write(
      `WaapiApiError [${err.status}]: ${err.message}\nresponse: ${err.responseBody}\n`
    );
    process.exit(1);
  }
  if (err instanceof WaapiConfigError) {
    process.stdout.write(`config error: ${err.message}\n`);
    process.exit(1);
  }
  process.stdout.write(
    `setup-webhook crashed: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`
  );
  process.exit(1);
});
