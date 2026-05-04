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
  getContactById,
  resolveLidToE164,
  verifyWebhookToken,
  parseWaapiInbound,
  readWaapiEventType,
  isLidPhone,
  e164ToWaapiChatId,
  WaapiApiError,
  WaapiConfigError,
  WaapiInboundError,
  type SendTextMessageInput,
  type SetInstanceWebhookInput,
  type WaapiContact,
} from './waapi-client';
export type {
  InboundMessage,
  InboundMessageType,
  OutboundMessage,
  InboundJobPayload,
  OutboundJobPayload,
} from './types';
