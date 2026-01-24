import { createAuthClient } from 'better-auth/react';
import { getBaseUrl } from '@/modules/core/utils/url';

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});

export const { signIn, signUp, signOut, useSession } = authClient;
