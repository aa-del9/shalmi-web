import { createAuthClient } from 'better-auth/react';
import { phoneNumberClient } from 'better-auth/client/plugins';
import { getBaseUrl } from '@/modules/core/utils/url';

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [phoneNumberClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
