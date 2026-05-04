// Side-effect imports register each tool in the registry as soon as
// the package is loaded. Add new read tools here.
import './tools/list-orders';
import './tools/get-order-details';
import './tools/list-products';

export {
  callTool,
  getRegisteredToolNames,
  getToolsForRole,
  getGeminiToolDeclarations,
  registerTool,
  ToolDispatchError,
  _resetRegistryForTesting,
} from './registry';

export type {
  GeminiFunctionDeclaration,
  ToolContext,
  ToolDefinition,
  ToolRole,
} from './types';
