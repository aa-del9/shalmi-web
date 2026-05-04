/**
 * Cross-package WhatsApp message types.
 *
 * Both the worker (apps/whatsapp-worker) and any internal caller
 * (apps/web → /internal/send-message) speak in these shapes. The
 * Interakt webhook payload is normalized into `InboundMessage` by
 * `parseInteraktInbound`; outbound jobs go onto the queue as
 * `OutboundJobPayload` and produce an `OutboundMessage` after a
 * successful Interakt API call.
 */

export type InboundMessageType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'sticker'
  | 'location'
  | 'contacts'
  | 'interactive'
  | 'button'
  | 'template_reply'
  | 'unknown';

export interface InboundMessage {
  /** E.164 phone, e.g. `+923001234567`. */
  phone: string;
  /** Interakt's internal message id from `data.message.id`. Used for dedup. */
  metaMessageId: string;
  /** Plain text body when the inbound is text-shaped. Null otherwise. */
  body: string | null;
  /** Best-effort message classification. */
  messageType: InboundMessageType;
  /** Raw Interakt webhook payload — kept for audit + future extraction. */
  rawPayload: unknown;
  /** ISO-8601 timestamp when Interakt observed the message. */
  receivedAt: string;
}

export interface OutboundMessage {
  /** Interakt's response message id once sent. */
  messageId: string;
  /** Interakt's reported send status, e.g. `sent`, `queued`, `failed`. */
  status: string;
}

/**
 * Job placed on the inbound BullMQ queue. The worker receives this,
 * resolves identity, and decides what reply (if any) to send.
 */
export interface InboundJobPayload {
  message: InboundMessage;
}

/**
 * Job placed on the outbound BullMQ queue. The worker reads this,
 * logs a `whatsapp_messages` row, then calls Interakt to send.
 */
export interface OutboundJobPayload {
  /** E.164 phone the message is addressed to. */
  phoneE164: string;
  /** Plain-text body. */
  body: string;
  /** Optional user_id to attach to the `whatsapp_messages` log row. */
  userId?: string | null;
  /** Optional correlation id (e.g. inbound message id) to thread the log. */
  inReplyToMessageId?: string | null;
}
