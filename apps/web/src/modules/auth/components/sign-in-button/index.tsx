'use client';

import { Button } from '@repo/ui/components/button';
import { useRouter } from 'next/navigation';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

export function SignInButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.push(ABSOLUTE_ROUTES.AUTH)} type="button">
      Sign in
    </Button>
  );
}
