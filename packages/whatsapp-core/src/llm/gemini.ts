/**
 * Gemini client used by the inbound consumer.
 *
 * Two entry points:
 *   - `runVendorTurn`: first call of a turn — system prompt + history +
 *     user message + tool declarations.
 *   - `runVendorFollowupTurn`: second call of the same turn after a
 *     tool finishes — replays history + the model's `functionCall` and
 *     our `functionResponse` so Gemini can render a final natural
 *     language reply.
 *
 * Both wrap `ai.models.generateContent` on `gemini-2.5-flash` (free
 * tier) with `temperature: 0.2` and `maxOutputTokens: 300`.
 */

import {
  GoogleGenAI,
  type Content,
  type FunctionCall,
  type FunctionDeclaration,
  type GenerateContentResponse,
  type Part,
} from '@google/genai';

const MODEL = 'gemini-2.5-flash';
const TEMPERATURE = 0.2;
const MAX_OUTPUT_TOKENS = 300;

let cachedClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
}

/** A single past turn we want to feed back into the model. */
export interface ConversationTurn {
  role: 'user' | 'model';
  content: string;
}

export interface RunVendorTurnInput {
  message: string;
  conversation: ConversationTurn[];
  tools: FunctionDeclaration[];
  system: string;
}

export interface RunVendorFollowupTurnInput {
  message: string;
  conversation: ConversationTurn[];
  tools: FunctionDeclaration[];
  system: string;
  functionCall: FunctionCall;
  functionResult: Record<string, unknown>;
}

export interface RunVendorFollowupTurnMultiInput {
  message: string;
  conversation: ConversationTurn[];
  tools: FunctionDeclaration[];
  system: string;
  /** N parallel function calls returned by Gemini in the prior turn. */
  functionCalls: FunctionCall[];
  /** Results aligned 1:1 with `functionCalls` (same order). */
  functionResults: Record<string, unknown>[];
}

export interface GeminiUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export function extractUsage(response: GenerateContentResponse): GeminiUsage {
  const meta = response.usageMetadata;
  return {
    inputTokens: meta?.promptTokenCount ?? 0,
    outputTokens: meta?.candidatesTokenCount ?? 0,
    totalTokens: meta?.totalTokenCount ?? 0,
  };
}

function turnsToContents(turns: ConversationTurn[]): Content[] {
  return turns.map((t) => ({
    role: t.role,
    parts: [{ text: t.content }],
  }));
}

/**
 * Pick the first function call from a Gemini response. Convenience —
 * the worker uses this rather than the array form because we only
 * dispatch a single tool per turn.
 */
export function firstFunctionCall(
  response: GenerateContentResponse
): FunctionCall | null {
  const calls = response.functionCalls;
  if (calls && calls.length > 0 && calls[0]) return calls[0];
  // Fallback: walk the parts of the first candidate.
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.functionCall) return part.functionCall;
  }
  return null;
}

/**
 * Pull every function call from a Gemini response, in order. Used by
 * the compound-read path — the worker dispatches multiple read tools
 * in one turn and folds all results into a single followup call.
 *
 * Falls back to the parts-walk if `response.functionCalls` is absent
 * (older shape returned for some models).
 */
export function allFunctionCalls(
  response: GenerateContentResponse
): FunctionCall[] {
  const calls = response.functionCalls;
  if (calls && calls.length > 0) return calls;
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const out: FunctionCall[] = [];
  for (const part of parts) {
    if (part.functionCall) out.push(part.functionCall);
  }
  return out;
}

export async function runVendorTurn(
  input: RunVendorTurnInput
): Promise<GenerateContentResponse> {
  const client = getClient();
  const contents: Content[] = [
    ...turnsToContents(input.conversation),
    { role: 'user', parts: [{ text: input.message }] },
  ];

  return client.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: { parts: [{ text: input.system }] },
      temperature: TEMPERATURE,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      tools: input.tools.length > 0
        ? [{ functionDeclarations: input.tools }]
        : undefined,
    },
  });
}

export async function runVendorFollowupTurn(
  input: RunVendorFollowupTurnInput
): Promise<GenerateContentResponse> {
  const client = getClient();

  const functionCallPart: Part = { functionCall: input.functionCall };
  const functionResponsePart: Part = {
    functionResponse: {
      name: input.functionCall.name ?? 'unknown',
      response: input.functionResult,
    },
  };

  const contents: Content[] = [
    ...turnsToContents(input.conversation),
    { role: 'user', parts: [{ text: input.message }] },
    { role: 'model', parts: [functionCallPart] },
    { role: 'user', parts: [functionResponsePart] },
  ];

  return client.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: { parts: [{ text: input.system }] },
      temperature: TEMPERATURE,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      tools: input.tools.length > 0
        ? [{ functionDeclarations: input.tools }]
        : undefined,
    },
  });
}

/**
 * Same shape as `runVendorFollowupTurn` but feeds back N parallel
 * function calls + their results in a single followup. Used by the
 * compound-read path.
 *
 * Conversation contents become:
 *   [...prior turns, user, model(N functionCalls), user(N functionResponses)]
 *
 * The model sees every result at once and produces a single
 * natural-language summary across all of them, capped by
 * `maxOutputTokens: 300`.
 */
export async function runVendorFollowupTurnMulti(
  input: RunVendorFollowupTurnMultiInput
): Promise<GenerateContentResponse> {
  if (input.functionCalls.length !== input.functionResults.length) {
    throw new Error(
      `runVendorFollowupTurnMulti: functionCalls (${input.functionCalls.length}) and functionResults (${input.functionResults.length}) must align`
    );
  }
  const client = getClient();

  const modelParts: Part[] = input.functionCalls.map((fc) => ({
    functionCall: fc,
  }));

  const responseParts: Part[] = input.functionCalls.map((fc, idx) => {
    const result = input.functionResults[idx] ?? {};
    return {
      functionResponse: {
        name: fc.name ?? 'unknown',
        response: result,
      },
    };
  });

  const contents: Content[] = [
    ...turnsToContents(input.conversation),
    { role: 'user', parts: [{ text: input.message }] },
    { role: 'model', parts: modelParts },
    { role: 'user', parts: responseParts },
  ];

  return client.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: { parts: [{ text: input.system }] },
      temperature: TEMPERATURE,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      tools: input.tools.length > 0
        ? [{ functionDeclarations: input.tools }]
        : undefined,
    },
  });
}

export type { FunctionCall, FunctionDeclaration, GenerateContentResponse };
