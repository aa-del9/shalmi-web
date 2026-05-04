import type { z } from 'zod';

/**
 * The role of the WhatsApp conversation participant. Tools may opt in
 * to either or both audiences via the `roles` field on the tool def.
 */
export type ToolRole = 'vendor' | 'buyer';

/**
 * Resolved per-call context. Built once by the worker from the
 * conversation row + inbound message, then passed to every tool.
 *
 * Tools must read `subjectId`/`role`/`phone`/`conversationId` from
 * here — never as tool arguments. (CLAUDE.md WhatsApp rule.)
 */
export interface ToolContext {
  role: ToolRole;
  subjectId: string;
  phone: string;
  conversationId: string;
}

/**
 * Internal tool definition. Each tool exports one of these and calls
 * `registerTool` on import. The registry validates input/output, gates
 * by role, then invokes the handler with the supplied context.
 */
export interface ToolDefinition<I = unknown, O = unknown> {
  name: string;
  description: string;
  inputSchema: z.ZodType<I>;
  outputSchema: z.ZodType<O>;
  roles: ToolRole[];
  handler: (input: I, ctx: ToolContext) => Promise<O>;
  /**
   * Reserved for Phase 7. The registry currently ignores this field;
   * the worker's state machine is what gates confirmations.
   */
  requiresConfirmation?: boolean;
}

/**
 * Subset of Gemini's `FunctionDeclaration` shape. Inlined here to
 * avoid a runtime dependency on `@google/generative-ai` in the MCP
 * server package — the worker can import this and adapt it as needed.
 */
export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}
