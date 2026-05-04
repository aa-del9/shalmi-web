/**
 * Quick CLI to read the waapi instance state — useful while pairing
 * the WhatsApp account or debugging an outage.
 *
 * Usage:
 *   pnpm --filter whatsapp-worker waapi-status
 *
 * Required env: WAAPI_API_TOKEN, WAAPI_INSTANCE_ID.
 */

import {
  getInstance,
  getInstanceClientStatus,
  WaapiApiError,
} from '@repo/whatsapp-core';

async function main(): Promise<void> {
  process.stdout.write('── instance ────────────────────────────────────────\n');
  try {
    const inst = await getInstance();
    process.stdout.write(`${JSON.stringify(inst, null, 2)}\n`);
  } catch (err) {
    process.stdout.write(
      `instance read failed: ${err instanceof Error ? err.message : String(err)}\n`
    );
  }

  process.stdout.write('── client status ───────────────────────────────────\n');
  try {
    const status = await getInstanceClientStatus();
    process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
  } catch (err) {
    process.stdout.write(
      `status read failed: ${err instanceof Error ? err.message : String(err)}\n`
    );
  }
}

main().catch((err: unknown) => {
  if (err instanceof WaapiApiError) {
    process.stdout.write(
      `WaapiApiError [${err.status}]: ${err.message}\nresponse: ${err.responseBody}\n`
    );
    process.exit(1);
  }
  process.stdout.write(
    `waapi-status crashed: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`
  );
  process.exit(1);
});
