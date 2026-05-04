export {
  normalizeToE164,
  isE164,
  splitE164,
} from './phone';
export {
  sendTextMessage,
  setInstanceWebhook,
  getInstanceClientStatus,
  getInstance,
  verifyWebhookToken,
  parseWaapiInbound,
  readWaapiEventType,
  e164ToWaapiChatId,
  WaapiApiError,
  WaapiConfigError,
  WaapiInboundError,
  type SendTextMessageInput,
  type SetInstanceWebhookInput,
} from './waapi-client';
export type {
  InboundMessage,
  InboundMessageType,
  OutboundMessage,
  InboundJobPayload,
  OutboundJobPayload,
} from './types';
