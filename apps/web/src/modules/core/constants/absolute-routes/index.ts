export const ABSOLUTE_ROUTES = {
  ROOT: '/',
  AUTH: '/auth',
  AUTH_OTP: '/auth/otp',

  CHECKOUT: '/checkout',

  PROFILE: '/profile',
  PROFILE_ADDRESSES: '/profile/addresses',
  PROFILE_ORDERS: '/profile/orders',

  VENDOR: '/vendor',
  VENDOR_DASHBOARD: '/vendor/dashboard',
  VENDOR_PRODUCTS: '/vendor/products',
  VENDOR_PRODUCTS_NEW: '/vendor/products/new',
  VENDOR_ORDERS: '/vendor/orders',
  VENDOR_LEDGER: '/vendor/ledger',
  VENDOR_SETTINGS: '/vendor/settings',

  ADMIN: '/admin',
  ADMIN_DASHBOARD: `/admin/dashboard`,
  ADMIN_VENDORS: `/admin/vendors`,
  ADMIN_CATEGORIES: `/admin/categories`,
  ADMIN_PROMO_BANNERS: '/admin/promo-banners',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_USERS: '/admin/users',
  ADMIN_SALES_REPORTS: '/admin/sales-reports',
  ADMIN_AUDIT_LOG: '/admin/audit-log',
} as const;

export const AUTH_REQUIRED_PREFIXES = [
  ABSOLUTE_ROUTES.ADMIN,
  ABSOLUTE_ROUTES.VENDOR,
  ABSOLUTE_ROUTES.PROFILE,
] as const;

export const ADMIN_ONLY_PREFIX = ABSOLUTE_ROUTES.ADMIN;
export const VENDOR_ONLY_PREFIX = ABSOLUTE_ROUTES.VENDOR;
