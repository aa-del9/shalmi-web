'use client';

import { Button } from '@repo/ui/components/button';
import { useRouter } from 'next/navigation';
import { signOut } from '@/modules/auth/client/auth-client';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push(ABSOLUTE_ROUTES.ROOT);
    router.refresh();
  };

  return (
    <Button onClick={handleLogout} type="button" variant="outline" size="sm">
      Log out
    </Button>
  );
}
