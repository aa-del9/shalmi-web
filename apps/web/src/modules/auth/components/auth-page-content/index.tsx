'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AuthModal } from '@/modules/auth/components/auth-modal';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

/**
 * Content for the /auth page: reads redirect from URL and renders AuthModal.
 */
export function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectFromUrl = searchParams.get('redirect');

  return (
    <AuthModal
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          router.push(ABSOLUTE_ROUTES.ROOT);
        }
      }}
      redirectUrl={redirectFromUrl}
    />
  );
}
