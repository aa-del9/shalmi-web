/**
 * waapi.app REST client.
 *
 * waapi.app is an unofficial WhatsApp BSP — it pairs a phone via QR
 * code and runs WhatsApp Web on its own infrastructure (under the
 * hood, `whatsapp-web.js` over Puppeteer). For our worker that
 * surfaces three things:
 *
 *   1. Auth is a single Bearer token + an `instanceId` that pins
 *      the request to one paired phone.
 *   2. There's NO HMAC on inbound webhooks — the security model is
 *      a per-instance random token embedded in the webhook URL
 *      path. We compare it constant-time against
 *      `WAAPI_WEBHOOK_TOKEN`.
 *   3. There's no 24-hour customer-service window concept, no
 *      message templates, and chat ids are
 *      `<digits>@c.us` (individuals) or `<id>@g.us` (groups).
 *
 * Lazy env loading: every helper reads `process.env` inside the
 * function body. The worker boots without `WAAPI_*` set; failures
 * surface only when an outbound is attempted or when the webhook is
 * called.
 */

import { timingSafeEqual } from 'node:crypto';
import { isE164, normalizeToE164 } from './phone';
import type { InboundMessage, InboundMessageType, OutboundMessage } from './types';

const DEFAULT_BASE_URL = 'https://waapi.app';

interface WaapiConfig {
  apiToken: string;
  baseUrl: string;
  instanceId: string;
}

function readBaseUrl(): string {
  const raw = process.env.WAAPI_BASE_URL ?? DEFAULT_BASE_URL;
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

function getWaapiConfig(): WaapiConfig {
  const apiToken = process.env.WAAPI_API_TOKEN;
  const instanceId = process.env.WAAPI_INSTANCE_ID;
  if (!apiToken) throw new WaapiConfigError('WAAPI_API_TOKEN is not set');
  if (!instanceId) throw new WaapiConfigError('WAAPI_INSTANCE_ID is not set');
  return { apiToken, instanceId, baseUrl: readBaseUrl() };
}

function getWebhookToken(): string {
  const token = process.env.WAAPI_WEBHOOK_TOKEN;
  if (!token) throw new WaapiConfigError('WAAPI_WEBHOOK_TOKEN is not set');
  return token;
}

export class WaapiConfigError extends Error {
  override name = 'WaapiConfigError';
}

export class WaapiApiError extends Error {
  override name = 'WaapiApiError';
  status: number;
  responseBody: string;
  constructor(message: string, opts: { status: number; responseBody: string }) {
    super(message);
    this.status = opts.status;
    this.responseBody = opts.responseBody;
  }
}

async function waapiFetch(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
): Promise<unknown> {
  const { apiToken, baseUrl } = getWaapiConfig();
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new WaapiApiError(
      `waapi ${method} ${path} ${res.status}: ${text.slice(0, 500)}`,
      { status: res.status, responseBody: text }
    );
  }
  if (text.length === 0) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Convert an E.164 phone (`+923001234567`) to waapi's chat-id
 * shape (`923001234567@c.us`). Throws when the input is not E.164.
 */
export function e164ToWaapiChatId(e164: string): string {
  if (!isE164(e164)) {
    throw new Error(`e164ToWaapiChatId: not E.164: ${e164}`);
  }
  return `${e164.slice(1)}@c.us`;
}

export interface SendTextMessageInput {
  phoneE164: string;
  body: string;
}

interface ExecutedActionPayload {
  data?: {
    id?: { _serialized?: string; id?: string };
    ack?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface SendMessageResponse {
  data?: ExecutedActionPayload;
  [key: string]: unknown;
}

/**
 * Send a free-form text message to a phone. waapi has no template /
 * window concept, so this is the only outbound shape we need.
 */
export async function sendTextMessage(
  input: SendTextMessageInput
): Promise<OutboundMessage> {
  const { instanceId } = getWaapiConfig();
  const chatId = e164ToWaapiChatId(input.phoneE164);
  const result = (await waapiFetch(
    'POST',
    `/api/v1/instances/${instanceId}/client/action/send-message`,
    { chatId, message: input.body }
  )) as SendMessageResponse | null;

  // ExecutedAction shape: { data: { data: { id: { _serialized } }, ack, ... } }
  const inner = result?.data?.data as
    | { id?: { _serialized?: string; id?: string } }
    | undefined;
  const messageId =
    inner?.id?._serialized ?? inner?.id?.id ?? '';
  return { messageId, status: 'sent' };
}

export interface SetInstanceWebhookInput {
  url: string;
  events: string[];
}

/**
 * Configure the instance's webhook URL + event subscription. Call
 * this once after pairing, and again whenever the URL changes.
 * waapi has no dashboard for this — it must be done via API.
 */
export async function setInstanceWebhook(
  input: SetInstanceWebhookInput
): Promise<unknown> {
  const { instanceId } = getWaapiConfig();
  return waapiFetch('PUT', `/api/v1/instances/${instanceId}`, {
    webhook: { url: input.url, events: input.events },
  });
}

/**
 * Read the WhatsApp client connection state. Useful to confirm the
 * paired number is `'ready'` (vs `'qr'` / `'disconnected'`).
 */
export async function getInstanceClientStatus(): Promise<unknown> {
  const { instanceId } = getWaapiConfig();
  return waapiFetch(
    'GET',
    `/api/v1/instances/${instanceId}/client/status`
  );
}

/**
 * Read the instance row (includes `webhook.url` and `webhook.events`).
 */
export async function getInstance(): Promise<unknown> {
  const { instanceId } = getWaapiConfig();
  return waapiFetch('GET', `/api/v1/instances/${instanceId}`);
}

/**
 * Constant-time compare an inbound webhook path token against the
 * expected `WAAPI_WEBHOOK_TOKEN`. Returns false (no throw) when the
 * env is missing or the lengths differ.
 */
export function verifyWebhookToken(
  provided: string | null | undefined
): boolean {
  if (typeof provided !== 'string' || provided.length === 0) return false;
  let expected: string;
  try {
    expected = getWebhookToken();
  } catch {
    return false;
  }
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

interface WaapiMessageId {
  id?: string;
  _serialized?: string;
  fromMe?: boolean;
  remote?: string;
}

interface WaapiMessage {
  id?: WaapiMessageId;
  from?: string;
  to?: string;
  body?: string;
  type?: string;
  timestamp?: number;
  fromMe?: boolean;
  hasMedia?: boolean;
}

interface WaapiInboundEnvelope {
  event?: string;
  instanceId?: number | string;
  data?: {
    message?: WaapiMessage;
    media?: {
      mimetype?: string;
      data?: string;
      filename?: string;
      filesize?: number;
    };
  };
}

function classifyWaapiType(
  type: string | undefined,
  hasMedia: boolean | undefined
): InboundMessageType {
  if (type === 'chat') return 'text';
  if (type === 'image') return 'image';
  if (type === 'audio' || type === 'ptt') return 'audio';
  if (type === 'video') return 'video';
  if (type === 'document') return 'document';
  if (type === 'sticker') return 'sticker';
  if (type === 'location') return 'location';
  if (type === 'vcard' || type === 'multi_vcard' || type === 'contacts')
    return 'contacts';
  if (hasMedia) return 'document';
  return 'unknown';
}

export class WaapiInboundError extends Error {
  override name = 'WaapiInboundError';
}

/**
 * Convert a waapi `event: "message"` webhook payload into the shape
 * the worker uses internally. Returns `null` for valid envelopes the
 * worker should silently ack and skip — group chats and any messages
 * the bot itself authored. Throws on malformed payloads, which the
 * webhook handler converts to a 400.
 */
export function parseWaapiInbound(
  payload: unknown
): InboundMessage | null {
  if (!payload || typeof payload !== 'object') {
    throw new WaapiInboundError('payload is not an object');
  }
  const env = payload as WaapiInboundEnvelope;
  const msg = env.data?.message;
  if (!msg) throw new WaapiInboundError('missing data.message');

  if (msg.fromMe === true || msg.id?.fromMe === true) {
    return null;
  }

  const fromRaw = (msg.from ?? '').trim();
  if (!fromRaw.endsWith('@c.us')) {
    // Group (`@g.us`), broadcast, status, etc. — out of scope for
    // the vendor 1-on-1 bot.
    return null;
  }

  const digits = fromRaw.slice(0, fromRaw.length - '@c.us'.length).trim();
  if (!digits) throw new WaapiInboundError('empty phone digits in `from`');
  const phone = normalizeToE164(digits);

  const metaMessageId = msg.id?._serialized?.trim() ?? msg.id?.id?.trim();
  if (!metaMessageId) {
    throw new WaapiInboundError('missing data.message.id._serialized / id.id');
  }

  return {
    phone,
    metaMessageId,
    body: msg.body ?? null,
    messageType: classifyWaapiType(msg.type, msg.hasMedia),
    rawPayload: payload,
    receivedAt:
      typeof msg.timestamp === 'number'
        ? new Date(msg.timestamp * 1000).toISOString()
        : new Date().toISOString(),
  };
}

/**
 * Read the inbound envelope's top-level `event` field. The worker
 * uses this to ack-and-skip non-message events (`ready`, `qr`,
 * `disconnected`, status callbacks, etc.).
 */
export function readWaapiEventType(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const env = payload as WaapiInboundEnvelope;
  return typeof env.event === 'string' ? env.event : null;
}
