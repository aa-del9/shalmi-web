// TODO: future contents of @repo/mcp-server
//   - MCP server bootstrap (stdio or in-process transport for the worker)
//   - tool registry: one file per tool under ./tools/
//     vendor reads:  list_orders, get_order, list_products, get_product,
//                    get_kpis, get_low_stock, get_payouts
//     vendor writes: advance_sub_order_status, update_product_stock,
//                    update_product_price, update_product_status
//   - confirmation step wrapper for every write tool (fat-finger guard)
//   - caller authentication: resolve vendor_id from worker-supplied
//     conversation context — never accept user_id/vendor_id as a tool arg
export {};
