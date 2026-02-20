export const ABSOLUTE_ROUTES = {
  ROOT: '/',
  ADMIN: '/admin',
  VENDOR: '/vendor',
} as const;

export const AUTH_REQUIRED_PREFIXES = [
  ABSOLUTE_ROUTES.ADMIN,
  ABSOLUTE_ROUTES.VENDOR,
] as const;

export const ADMIN_ONLY_PREFIX = ABSOLUTE_ROUTES.ADMIN;