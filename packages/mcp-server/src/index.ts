// Side-effect imports register each tool in the registry as soon as
// the package is loaded. Add new tool files here.
import './tools/list-orders';
import './tools/get-order-details';
import './tools/list-products';
import './tools/update-product-price';
import './tools/update-product-stock';
import './tools/update-order-status';

export {
  callTool,
  getRegisteredToolNames,
  getToolsForRole,
  getTool,
  getGeminiToolDeclarations,
  registerTool,
  ToolDispatchError,
  _resetRegistryForTesting,
} from './registry';

export {
  previewUpdateProductPrice,
  type UpdateProductPricePreview,
} from './tools/update-product-price';
export {
  previewUpdateProductStock,
  type UpdateProductStockPreview,
} from './tools/update-product-stock';
export {
  previewUpdateOrderStatus,
  type UpdateOrderStatusPreview,
} from './tools/update-order-status';

export {
  buildIdempotencyKey,
  wrapWithIdempotency,
} from './idempotency';

export type {
  GeminiFunctionDeclaration,
  ToolContext,
  ToolDefinition,
  ToolRole,
} from './types';
