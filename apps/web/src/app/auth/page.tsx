'use client';

import { useRouter } from 'next/navigation';
import { AuthModal } from '@/modules/auth/components/auth-modal';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

export default function AuthPage() {
  const router = useRouter();
  return (
    <AuthModal
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          router.push(ABSOLUTE_ROUTES.ROOT);
        }
      }}
    />
  );
}
