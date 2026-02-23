'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { authClient } from '@/modules/auth/client/auth-client';
import { useModalStore } from '@/modules/core/stores/modal-store';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectUrl?: string | null;
}

export function AuthModal({ open, onOpenChange, redirectUrl }: AuthModalProps) {
  const router = useRouter();
  const closeModal = useModalStore((s) => s.closeModal);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = (open: boolean) => {
    if (!open) {
      setPhoneNumber('');
      setError(null);
      closeModal();
    }
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const { error: sendError } = await authClient.phoneNumber.sendOtp({
      phoneNumber: phoneNumber.trim(),
    });
    setIsLoading(false);

    if (sendError) {
      setError(sendError.message ?? 'Failed to send code');
      return;
    }

    const params = new URLSearchParams();
    params.set('phone', phoneNumber.trim());
    if (
      redirectUrl &&
      redirectUrl.startsWith('/') &&
      !redirectUrl.startsWith('//')
    ) {
      params.set('redirect', redirectUrl);
    }
    handleClose(false);
    router.push(`${ABSOLUTE_ROUTES.AUTH_OTP}?${params.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>
            Enter your phone number. We&apos;ll send you a verification code.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="auth-phone">Phone number</Label>
              <Input
                id="auth-phone"
                type="tel"
                placeholder="+923000000000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoComplete="tel"
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending code…' : 'Continue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
