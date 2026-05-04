/**
 * Local test for parseWaapiInbound against captured waapi payloads.
 *
 * Usage:
 *   pnpm --filter whatsapp-worker parse-fixture
 *
 * tsx-watch this file while iterating on
 * `packages/whatsapp-core/src/waapi-client.ts` — no Railway, no
 * waapi, no Redis, no Postgres needed.
 */

import { parseWaapiInbound, readWaapiEventType } from '@repo/whatsapp-core';

interface Fixture {
  name: string;
  payload: unknown;
  expectation: 'parses' | 'null';
}

const fixtures: Fixture[] = [
  {
    name: 'real @lid sender (privacy-hidden, captured from prod)',
    expectation: 'parses',
    payload: {
      event: 'message',
      instanceId: 91000,
      data: {
        message: {
          _data: {
            id: {
              fromMe: false,
              remote: '153978989985921@lid',
              id: '3A3DDB572F923727A78E',
              _serialized: 'false_153978989985921@lid_3A3DDB572F923727A78E',
            },
            body: 'Hi',
            type: 'chat',
            t: 1777883782,
            notifyName: 'Aadel',
            from: '153978989985921@lid',
            to: '923054333909@c.us',
            ack: 1,
          },
          id: {
            fromMe: false,
            remote: '153978989985921@lid',
            id: '3A3DDB572F923727A78E',
            _serialized: 'false_153978989985921@lid_3A3DDB572F923727A78E',
          },
          ack: 1,
          hasMedia: false,
          body: 'Hi',
          type: 'chat',
          timestamp: 1777883782,
          from: '153978989985921@lid',
          to: '923054333909@c.us',
          fromMe: false,
        },
        media: null,
      },
    },
  },
  {
    name: '@c.us sender (mutual contact, expected E.164)',
    expectation: 'parses',
    payload: {
      event: 'message',
      instanceId: 91000,
      data: {
        message: {
          id: { _serialized: 'false_923001234567@c.us_ABC', fromMe: false },
          from: '923001234567@c.us',
          to: '923054333909@c.us',
          body: 'hi from saved contact',
          type: 'chat',
          timestamp: 1777883900,
          fromMe: false,
          hasMedia: false,
        },
      },
    },
  },
  {
    name: 'group message (must skip)',
    expectation: 'null',
    payload: {
      event: 'message',
      data: {
        message: {
          id: { _serialized: 'x' },
          from: '12345-67890@g.us',
          to: '923054333909@c.us',
          body: 'hi group',
          type: 'chat',
          fromMe: false,
        },
      },
    },
  },
  {
    name: 'self-authored (must skip)',
    expectation: 'null',
    payload: {
      event: 'message',
      data: {
        message: {
          id: { _serialized: 'x', fromMe: true },
          from: '923001234567@c.us',
          to: '923054333909@c.us',
          body: 'echo',
          type: 'chat',
          fromMe: true,
        },
      },
    },
  },
];

function divider(label: string): void {
  process.stdout.write(`\n── ${label} ${'─'.repeat(Math.max(0, 60 - label.length))}\n`);
}

let pass = 0;
let fail = 0;

for (const f of fixtures) {
  divider(f.name);
  process.stdout.write(`event=${readWaapiEventType(f.payload)}\n`);
  let result: ReturnType<typeof parseWaapiInbound> | 'threw' = 'threw';
  try {
    result = parseWaapiInbound(f.payload);
  } catch (err) {
    process.stdout.write(
      `threw: ${err instanceof Error ? err.message : String(err)}\n`
    );
  }
  if (result === 'threw') {
    fail += 1;
    continue;
  }

  const ok =
    f.expectation === 'parses' ? result !== null : result === null;
  if (ok) pass += 1;
  else fail += 1;

  if (result === null) {
    process.stdout.write(`null (skipped)  ${ok ? '✅' : '❌ expected to parse'}\n`);
  } else {
    process.stdout.write(
      `parsed → chatId=${result.chatId} phone=${result.phone} type=${result.messageType} body=${JSON.stringify(result.body)}  ${ok ? '✅' : '❌ expected null'}\n`
    );
  }
}

divider('summary');
process.stdout.write(`pass=${pass} fail=${fail}\n`);
process.exit(fail === 0 ? 0 : 1);
