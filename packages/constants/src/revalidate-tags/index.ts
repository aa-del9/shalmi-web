/**
 * Next.js cache revalidation tags for on-demand revalidation
 */

export const REVALIDATE_TAGS = {
  // User-related
  USER: 'user',
  USER_PROFILE: 'user-profile',
  USER_SETTINGS: 'user-settings',

  // Product-related
  PRODUCTS: 'products',
  PRODUCT_DETAIL: 'product-detail',
  CATEGORIES: 'categories',

  // Order-related
  ORDERS: 'orders',
  ORDER_DETAIL: 'order-detail',
  SUB_ORDERS: 'sub-orders',

  // Cart
  CART: 'cart',

  // Catalog
  CATALOG: 'catalog',

  // Finance
  VENDOR_LEDGER: 'vendor-ledger',
  WALLET: 'wallet',

  // Global
  ALL: 'all',
} as const;

export type RevalidateTag =
  (typeof REVALIDATE_TAGS)[keyof typeof REVALIDATE_TAGS];
