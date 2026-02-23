/**
 * Service error response schemas for API error handling
 */

import { z } from 'zod';

/**
 * Single validation error schema
 */
export const validationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

export type ValidationError = z.infer<typeof validationErrorSchema>;

/**
 * Standard API error response schema
 */
export const serviceErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.string().optional(),
    validationErrors: z.array(validationErrorSchema).optional(),
    timestamp: z.string().datetime().optional(),
    requestId: z.string().optional(),
  }),
});

export type ServiceErrorResponse = z.infer<typeof serviceErrorResponseSchema>;

/**
 * HTTP error status codes
 */
export const httpErrorCodes = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Common error codes
 */
export const errorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof errorCodes)[keyof typeof errorCodes];

/**
 * Create a typed error response
 */
export const createErrorResponse = (
  code: ErrorCode,
  message: string,
  details?: string,
  validationErrors?: ValidationError[]
): ServiceErrorResponse => ({
  error: {
    code,
    message,
    details,
    validationErrors,
    timestamp: new Date().toISOString(),
  },
});
