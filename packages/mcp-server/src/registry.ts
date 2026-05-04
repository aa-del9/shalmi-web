import type { ZodError } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ServiceError } from '@repo/services/errors';
import type {
  GeminiFunctionDeclaration,
  ToolContext,
  ToolDefinition,
  ToolRole,
} from './types';

function firstZodMessage(error: ZodError, fallback: string): string {
  const flat = error.flatten();
  if (flat.formErrors[0]) return flat.formErrors[0];
  for (const list of Object.values(flat.fieldErrors)) {
    if (list && list.length > 0 && list[0]) return list[0];
  }
  return fallback;
}

const registry = new Map<string, ToolDefinition>();
const geminiCache = new Map<ToolRole, GeminiFunctionDeclaration[]>();

/**
 * Thrown when the registry rejects a call before it reaches the
 * handler — unknown tool, role mismatch, or input/output schema
 * failure. Worker code should map this to a user-facing error.
 */
export class ToolDispatchError extends Error {
  readonly code:
    | 'UNKNOWN_TOOL'
    | 'ROLE_FORBIDDEN'
    | 'INPUT_VALIDATION'
    | 'OUTPUT_VALIDATION';

  constructor(code: ToolDispatchError['code'], message: string) {
    super(message);
    this.name = 'ToolDispatchError';
    this.code = code;
  }
}

/**
 * Add a tool to the in-memory registry. Each tool file calls this on
 * import; `src/index.ts` imports every tool file so registration is
 * complete after the package is loaded.
 *
 * Re-registering a tool with the same name is allowed (last write
 * wins) so HMR/test-harness reloads don't blow up. The Gemini
 * declaration cache is invalidated on every registration.
 */
export function registerTool<I, O>(tool: ToolDefinition<I, O>): void {
  registry.set(tool.name, tool as unknown as ToolDefinition);
  geminiCache.clear();
}

export function getRegisteredToolNames(): string[] {
  return [...registry.keys()].sort();
}

export function getToolsForRole(role: ToolRole): ToolDefinition[] {
  return [...registry.values()].filter((t) => t.roles.includes(role));
}

/**
 * Look up a tool, validate input/output, gate by role, and invoke the
 * handler. The handler reads identity from `ctx`; the registry never
 * trusts the input object for vendor/user identity.
 */
export async function callTool(
  name: string,
  input: unknown,
  ctx: ToolContext
): Promise<unknown> {
  const tool = registry.get(name);
  if (!tool) {
    throw new ToolDispatchError('UNKNOWN_TOOL', `Unknown tool: ${name}`);
  }

  if (!tool.roles.includes(ctx.role)) {
    throw new ToolDispatchError(
      'ROLE_FORBIDDEN',
      `Tool "${name}" is not available for role "${ctx.role}"`
    );
  }

  const inputResult = tool.inputSchema.safeParse(input);
  if (!inputResult.success) {
    throw new ToolDispatchError(
      'INPUT_VALIDATION',
      firstZodMessage(inputResult.error, 'Invalid input')
    );
  }

  const output = await tool.handler(inputResult.data, ctx);

  const outputResult = tool.outputSchema.safeParse(output);
  if (!outputResult.success) {
    throw new ToolDispatchError(
      'OUTPUT_VALIDATION',
      firstZodMessage(outputResult.error, 'Invalid output')
    );
  }

  return outputResult.data;
}

/**
 * Build the Gemini `FunctionDeclaration[]` payload for a given role.
 * Cached per process so we only walk the zod tree once. Cache is
 * cleared whenever a new tool registers.
 */
export function getGeminiToolDeclarations(
  role: ToolRole
): GeminiFunctionDeclaration[] {
  const cached = geminiCache.get(role);
  if (cached) return cached;

  const tools = getToolsForRole(role);
  const declarations = tools.map<GeminiFunctionDeclaration>((tool) => {
    const jsonSchema = zodToJsonSchema(tool.inputSchema, {
      target: 'openApi3',
      $refStrategy: 'none',
    });
    const raw = jsonSchema as Record<string, unknown>;
    const parameters: Record<string, unknown> = { ...raw };
    delete parameters.$schema;
    return {
      name: tool.name,
      description: tool.description,
      parameters,
    };
  });

  geminiCache.set(role, declarations);
  return declarations;
}

/**
 * For test-harness / debugging only. Drops the entire registry.
 */
export function _resetRegistryForTesting(): void {
  registry.clear();
  geminiCache.clear();
}

export type { ToolContext, ToolDefinition, ToolRole } from './types';
export { ServiceError };
