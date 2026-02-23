'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { authClient } from '@/modules/auth/client/auth-client';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { USER_ROLES } from '@/modules/core/constants/user-roles';

function isSafeRedirectUrl(url: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('/') && !url.startsWith('//');
}

function getPostAuthRedirectUrl(
  redirectUrl: string | null,
  role?: string
): string {
  if (redirectUrl && isSafeRedirectUrl(redirectUrl)) return redirectUrl;
  if (role === USER_ROLES.ADMIN) return ABSOLUTE_ROUTES.ADMIN;
  if (role === USER_ROLES.VENDOR) return ABSOLUTE_ROUTES.VENDOR;
  return ABSOLUTE_ROUTES.ROOT;
}

function AuthOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone');
  const redirectParam = searchParams.get('redirect');

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const phone = phoneParam?.trim() ?? '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Missing phone number. Start from the sign-in page.');
      return;
    }
    setError(null);
    setIsLoading(true);
    const { data, error: verifyError } = await authClient.phoneNumber.verify({
      phoneNumber: phone,
      code: code.trim(),
      disableSession: false,
    });
    setIsLoading(false);

    if (verifyError) {
      setError(verifyError.message ?? 'Verification failed');
      return;
    }

    const user = data?.user as { role?: string } | undefined;
    const targetUrl = getPostAuthRedirectUrl(redirectParam, user?.role);
    router.push(targetUrl);
  };

  if (!phone) {
    return (
      <div className="container flex max-w-md flex-col gap-4 py-12">
        <h1 className="text-xl font-semibold">Verify OTP</h1>
        <p className="text-muted-foreground text-sm">
          Missing phone number. Please start by entering your phone number on
          the{' '}
          <a href={ABSOLUTE_ROUTES.AUTH} className="underline">
            sign-in page
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="container flex max-w-md flex-col gap-6 py-12">
      <div>
        <h1 className="text-xl font-semibold">Enter verification code</h1>
        <p className="text-muted-foreground text-sm">
          We sent a code to {phone}. Enter it below.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="otp-code">Code</Label>
          <Input
            id="otp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            maxLength={6}
            required
            disabled={isLoading}
          />
        </div>
        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Verifying…' : 'Verify'}
        </Button>
      </form>
    </div>
  );
}

export default function AuthOtpPage() {
  return (
    <Suspense fallback={<div className="container py-12">Loading…</div>}>
      <AuthOtpContent />
    </Suspense>
  );
}
