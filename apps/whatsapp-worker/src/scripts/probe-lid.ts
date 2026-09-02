/**
 * Probe waapi's whatsapp-web.js actions to see if any of them can
 * resolve an `@lid` chat-id back to a real phone (`@c.us`).
 *
 * Usage:
 *   pnpm --filter whatsapp-worker probe-lid <id-or-lid>
 *
 * Example:
 *   pnpm --filter whatsapp-worker probe-lid 153978989985921@lid
 *
 * Tries each known whatsapp-web.js action by name. waapi accepts
 * `executeInstanceAction(action, payload)` where the action mirrors
 * a method on the underlying Client. Errors are expected — we just
 * want to see which actions return useful data.
 */

import { WaapiApiError } from '@repo/whatsapp-core';

const DEFAULT_BASE_URL = 'https://waapi.app';

function getConfig(): { apiToken: string; instanceId: string; baseUrl: string } {
  const apiToken = process.env.WAAPI_API_TOKEN;
  const instanceId = process.env.WAAPI_INSTANCE_ID;
  if (!apiToken) throw new Error('WAAPI_API_TOKEN not set');
  if (!instanceId) throw new Error('WAAPI_INSTANCE_ID not set');
  const rawBase = process.env.WAAPI_BASE_URL ?? DEFAULT_BASE_URL;
  const baseUrl = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
  return { apiToken, instanceId, baseUrl };
}

async function callAction(
  action: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const { apiToken, instanceId, baseUrl } = getConfig();
  const res = await fetch(
    `${baseUrl}/api/v1/instances/${instanceId}/client/action/${action}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  const text = await res.text();
  if (!res.ok) {
    throw new WaapiApiError(`waapi ${action} ${res.status}`, {
      status: res.status,
      responseBody: text,
    });
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function divider(label: string): void {
  process.stdout.write(`\n── ${label} ${'─'.repeat(Math.max(0, 60 - label.length))}\n`);
}

async function tryAction(
  action: string,
  body: Record<string, unknown>
): Promise<void> {
  divider(`${action}  ${JSON.stringify(body)}`);
  try {
    const result = await callAction(action, body);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (err) {
    if (err instanceof WaapiApiError) {
      process.stdout.write(
        `WaapiApiError ${err.status}: ${err.responseBody.slice(0, 400)}\n`
      );
    } else {
      process.stdout.write(
        `error: ${err instanceof Error ? err.message : String(err)}\n`
      );
    }
  }
}

async function main(): Promise<void> {
  const arg = process.argv[2]?.trim();
  if (!arg) {
    process.stdout.write(
      'Usage: pnpm --filter whatsapp-worker probe-lid <id-or-lid>\n'
    );
    process.exit(1);
  }

  // Candidate actions exposed by waapi (mirror whatsapp-web.js Client
  // methods). Some will 404, that's fine — we want to see which ones
  // succeed and what fields they return.
  await tryAction('get-contact-by-id', { contactId: arg });
  await tryAction('get-contact-by-id', { id: arg });
  await tryAction('get-chat-by-id', { chatId: arg });
  await tryAction('get-number-id', { number: arg });
  await tryAction('is-registered-user', { id: arg });
  await tryAction('get-formatted-number', { number: arg });

  process.stdout.write('\nprobe done.\n');
}

main().catch((err: unknown) => {
  process.stdout.write(
    `probe-lid crashed: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`
  );
  process.exit(1);
});
