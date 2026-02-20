import { auth } from '@/modules/auth/server/auth-client';
import { toNextJsHandler } from 'better-auth/next-js';

export const { POST, GET } = toNextJsHandler(auth);
