'use client';

import { useModalStore } from '@/modules/core/stores/modal-store';
import { AuthModal } from '@/modules/auth/components/auth-modal';

export function GlobalModals() {
  const type = useModalStore((s) => s.type);
  const redirectUrl = useModalStore((s) => s.redirectUrl);
  const closeModal = useModalStore((s) => s.closeModal);

  const open = type === 'auth';

  return (
    <>
      {type === 'auth' && (
        <AuthModal
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) closeModal();
          }}
          redirectUrl={redirectUrl}
        />
      )}
    </>
  );
}
