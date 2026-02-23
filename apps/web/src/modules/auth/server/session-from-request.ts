import type { NextRequest } from 'next/server';
import { auth } from '@/modules/auth/server/auth-client';

export async function getSessionFromRequest(request: NextRequest) {
  return auth.api.getSession({
    headers: request.headers,
  });
}
