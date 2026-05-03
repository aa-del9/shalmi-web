'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccountDrawerStore } from '@/modules/buyer-account-drawer/store';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

/**
 * Per gap-analysis Q7: `/profile` is a deep-link surface — flip the
 * drawer open and replace history with `/` so the back button doesn't
 * trap the user on a route with no visible content.
 */
export default function ProfileDeepLinkPage() {
  const router = useRouter();
  const open = useAccountDrawerStore((s) => s.open);

  useEffect(() => {
    open();
    router.replace(ABSOLUTE_ROUTES.ROOT);
  }, [open, router]);

  return null;
}
