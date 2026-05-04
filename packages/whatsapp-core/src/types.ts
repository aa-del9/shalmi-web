/**
 * Cross-package WhatsApp message types.
 *
 * Both the worker (apps/whatsapp-worker) and any internal caller
 * (apps/web → /internal/send-message) speak in these shapes. The
 * waapi webhook payload is normalized into `InboundMessage` by
 * `parseWaapiInbound`; outbound jobs go onto the queue as
 * `OutboundJobPayload` and produce an `OutboundMessage` after a
 * successful waapi API call.
 *
 * Two distinct identifiers travel together:
 *   - `chatId` is what waapi/WhatsApp uses to ROUTE messages
 *     (`<digits>@c.us` or `<id>@lid`). We must reply on the same
 *     chat-id we received from, otherwise the recipient sees a new
 *     conversation thread.
 *   - `phone` is what we use for IDENTITY lookup against
 *     `user.phone_number`. For `@c.us` chats this is the normalized
 *     E.164. For `@lid` chats we try to resolve via waapi's contact
 *     API; if resolution succeeds, this is the resolved E.164.
 *     Otherwise it falls back to the LID itself (and identity lookup
 *     will naturally miss → "unrecognized" path fires).
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
  /**
   * waapi/WhatsApp chat-id, e.g. `923001234567@c.us` or
   * `153978989985921@lid`. Use this for outbound routing.
   */
  chatId: string;
  /**
   * Identity key for vendor lookup. E.164 (`+923001234567`) when the
   * sender is a `@c.us`/`@s.whatsapp.net` contact OR a resolved LID;
   * the raw `@lid` string when resolution fails.
   */
  phone: string;
  /** Stable message id (e.g. `id._serialized`). Used for dedup. */
  metaMessageId: string;
  /** Plain text body when the inbound is text-shaped. Null otherwise. */
  body: string | null;
  /** Best-effort message classification. */
  messageType: InboundMessageType;
  /** Raw waapi webhook payload — kept for audit + future extraction. */
  rawPayload: unknown;
  /** ISO-8601 timestamp when waapi observed the message. */
  receivedAt: string;
}

export interface OutboundMessage {
  /** waapi's response message id once sent. */
  messageId: string;
  /** waapi's reported send status, e.g. `sent`. */
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
 * logs a `whatsapp_messages` row, then calls waapi to send.
 */
export interface OutboundJobPayload {
  /** waapi chat-id to send to (e.g. `<digits>@c.us` or `<id>@lid`). */
  chatId: string;
  /** Identity-side phone string for the log row's `phone` column. */
  phone: string;
  /** Plain-text body. */
  body: string;
  /** Optional user_id to attach to the `whatsapp_messages` log row. */
  userId?: string | null;
  /** Optional correlation id (e.g. inbound message id) to thread the log. */
  inReplyToMessageId?: string | null;
}
