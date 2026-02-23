export const ABSOLUTE_ROUTES = {
  ROOT: '/',
  AUTH: '/auth',
  AUTH_OTP: '/auth/otp',

  VENDOR: '/vendor',

  ADMIN: '/admin',
  ADMIN_DASHBOARD: `/admin/dashboard`,
  ADMIN_VENDORS: `/admin/vendors`,
} as const;

export const AUTH_REQUIRED_PREFIXES = [
  ABSOLUTE_ROUTES.ADMIN,
  ABSOLUTE_ROUTES.VENDOR,
] as const;

export const ADMIN_ONLY_PREFIX = ABSOLUTE_ROUTES.ADMIN;
