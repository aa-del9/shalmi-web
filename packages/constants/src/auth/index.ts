/**
 * Auth-related constants
 */

export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  LOGOUT: '/logout',
} as const;

export const PROTECTED_ROUTE_PREFIX = '/dashboard';

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  SESSION_EXPIRED: 'session_expired',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
} as const;
