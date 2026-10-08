/**
 * Hono routes for the WhatsApp worker.
 *
 * - `GET  /health`                            liveness probe
 * - `GET  /webhook/whatsapp/:token`           sanity probe for the
 *                                              webhook URL
 * - `POST /webhook/whatsapp/:token`           waapi.app event ingress
 *                                              — verify path token,
 *                                              filter, dedupe, log,
 *                                              enqueue, ack
 * - `POST /internal/send-message`             allowlisted internal
 *                                              trigger for outbound
 *                                              (used by apps/web later)
 *
 * waapi.app does NOT sign webhook bodies. The security model is a
 * per-instance random token embedded in the webhook URL path —
 * compared constant-time against `WAAPI_WEBHOOK_TOKEN`.
 */

import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, whatsappMessages } from '@repo/database';
import {
  parseWaapiInbound,
  readWaapiEventType,
  verifyWebhookToken,
  normalizeToE164,
  resolveLidToE164,
  isLidPhone,
  e164ToWaapiChatId,
} from '@repo/whatsapp-core';
import { getInboundQueue, getOutboundQueue } from './queues';

export function buildApp(): Hono {
  const app = new Hono();

  app.get('/health', (c) => c.json({ ok: true, service: 'whatsapp-worker' }));

  app.get('/webhook/whatsapp/:token', (c) => {
    const token = c.req.param('token');
    if (!verifyWebhookToken(token)) {
      return c.json({ ok: false, error: 'invalid token' }, 401);
    }
    return c.json({
      ok: true,
      hint: 'POST events from waapi.app only.',
    });
  });

  app.post('/webhook/whatsapp/:token', async (c) => {
    const token = c.req.param('token');
    if (!verifyWebhookToken(token)) {
      return c.json({ ok: false, error: 'invalid token' }, 401);
    }

    let payload: unknown;
    try {
      payload = await c.req.json();
    } catch {
      return c.json({ ok: false, error: 'invalid json' }, 400);
    }

    const eventType = readWaapiEventType(payload);
    if (eventType !== 'message') {
      // Lifecycle events (`ready`, `qr`, `disconnected`,
      // `authenticated`, etc.) and message status callbacks are
      // ack'd quietly. Not processed in Phase 5.
      // eslint-disable-next-line no-console
      console.log(`[webhook] skipped event=${eventType ?? 'unknown'}`);
      return c.json({ ok: true, skipped: eventType ?? 'unknown' });
    }

    let inbound;
    try {
      inbound = parseWaapiInbound(payload);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        '[webhook] parse error:',
        err instanceof Error ? err.message : String(err)
      );
      return c.json({ ok: false, error: 'bad inbound payload' }, 400);
    }
    if (!inbound) {
      // eslint-disable-next-line no-console
      console.log('[webhook] message skipped (group/self/unknown chat-id)');
      return c.json({ ok: true, skipped: 'group_or_self' });
    }

    // For privacy-hidden @lid senders, try to resolve the underlying
    // phone via waapi's contact API so vendor identity lookup works.
    // On any failure we fall back to the LID — identity lookup will
    // miss and the worker will fire the "unrecognized" path.
    if (isLidPhone(inbound.phone)) {
      try {
        const resolved = await resolveLidToE164(inbound.chatId);
        if (resolved) {
          // eslint-disable-next-line no-console
          console.log(
            `[webhook] resolved @lid → ${resolved} (chatId=${inbound.chatId})`
          );
          inbound = { ...inbound, phone: resolved };
        } else {
          // eslint-disable-next-line no-console
          console.log(
            `[webhook] could not resolve @lid (chatId=${inbound.chatId}) — falling back`
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(
          '[webhook] @lid resolution failed:',
          err instanceof Error ? err.message : String(err)
        );
      }
    }
    // eslint-disable-next-line no-console
    console.log(
      `[webhook] inbound chatId=${inbound.chatId} phone=${inbound.phone} type=${inbound.messageType} id=${inbound.metaMessageId}`
    );

    // Dedupe — waapi may retry on timeout. If we've already logged
    // this message id, ack and stop.
    const dupe = await db
      .select({ id: whatsappMessages.id })
      .from(whatsappMessages)
      .where(eq(whatsappMessages.metaMessageId, inbound.metaMessageId))
      .limit(1);
    if (dupe.length > 0) {
      return c.json({ ok: true, deduped: true });
    }

    await db.insert(whatsappMessages).values({
      phone: inbound.phone,
      userId: null,
      direction: 'inbound',
      metaMessageId: inbound.metaMessageId,
      body: inbound.body,
      messageType: inbound.messageType,
      status: 'pending',
    });

    await getInboundQueue().add(
      'process',
      { message: inbound },
      { jobId: inbound.metaMessageId }
    );

    return c.json({ ok: true });
  });

  app.post('/internal/send-message', async (c) => {
    const expected = process.env.INTERNAL_API_KEY;
    if (!expected) {
      return c.json(
        { ok: false, error: 'INTERNAL_API_KEY not configured' },
        503
      );
    }
    const provided = c.req.header('x-internal-api-key');
    if (provided !== expected) {
      return c.json({ ok: false, error: 'unauthorized' }, 401);
    }

    let body: { to?: unknown; body?: unknown };
    try {
      body = (await c.req.json()) as { to?: unknown; body?: unknown };
    } catch {
      return c.json({ ok: false, error: 'invalid json' }, 400);
    }

    if (typeof body.to !== 'string' || typeof body.body !== 'string') {
      return c.json({ ok: false, error: 'to and body must be strings' }, 400);
    }
    if (body.body.trim().length === 0) {
      return c.json({ ok: false, error: 'body cannot be empty' }, 400);
    }

    let phoneE164: string;
    try {
      phoneE164 = normalizeToE164(body.to);
    } catch (err) {
      return c.json(
        {
          ok: false,
          error: err instanceof Error ? err.message : 'invalid phone',
        },
        400
      );
    }

    await getOutboundQueue().add('send', {
      chatId: e164ToWaapiChatId(phoneE164),
      phone: phoneE164,
      body: body.body,
      userId: null,
      inReplyToMessageId: null,
    });

    return c.json({ ok: true });
  });

  return app;
}
