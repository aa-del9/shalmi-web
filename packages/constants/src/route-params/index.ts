/**
 * Dynamic route parameter names for type-safe route handling
 */

export const ROUTE_PARAMS = {
  // User
  USER_ID: "userId",

  // Product
  PRODUCT_ID: "productId",
  PRODUCT_SLUG: "productSlug",

  // Category
  CATEGORY_ID: "categoryId",
  CATEGORY_SLUG: "categorySlug",

  // Order
  ORDER_ID: "orderId",
  ORDER_NUMBER: "orderNumber",

  // Organization / Business
  ORG_ID: "orgId",
  ORG_SLUG: "orgSlug",

  // General
  ID: "id",
  SLUG: "slug",
} as const;

export type RouteParam = (typeof ROUTE_PARAMS)[keyof typeof ROUTE_PARAMS];
