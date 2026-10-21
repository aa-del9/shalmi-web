/**
 * Application-specific constants
 * For shared constants, use @repo/constants/*
 */

import { clientEnv } from '../../env/client';

export const APP_NAME = clientEnv.NEXT_PUBLIC_BRAND_NAME;
export const APP_DESCRIPTION = 'B2B Ecommerce Platform';
export const APP_VERSION = clientEnv.NEXT_PUBLIC_APP_VERSION;
