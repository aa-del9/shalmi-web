import { createAuthClient } from 'better-auth/react';
import { clientEnv } from '@/modules/core/env';

export const authClient = createAuthClient({
  baseURL: clientEnv.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
