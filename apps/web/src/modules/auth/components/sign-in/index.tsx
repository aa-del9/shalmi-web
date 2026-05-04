'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  History,
  Info,
  RefreshCw,
  Sparkles,
  Truck,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';
import { Label } from '@repo/ui/components/label';
import { Spinner } from '@repo/ui/components/spinner';
import { authClient } from '@/modules/auth/client/auth-client';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import {
  isSafeRedirectUrl,
  buildFullRedirectUrl,
} from '@/modules/auth/utils/redirect';
import { PAKISTAN_MOBILE_REGEX } from '@/modules/auth/constants';
import {
  assemblePakistanE164,
  normalizeTenDigitInput,
} from '@/modules/auth/utils/phone-format';
import { PhoneChipInput } from '@/modules/auth/components/phone-chip-input';
import { AuthBrandCluster } from '@/modules/auth/components/auth-brand-cluster';
import { AuthMobileAppBar } from '@/modules/auth/components/auth-mobile-app-bar';
import { useCartStore } from '@/modules/cart/stores/cart-store';

export function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectFromUrl = searchParams.get('redirect');
  const phonePrefill = searchParams.get('phone');

  const [phoneDigits, setPhoneDigits] = useState(() =>
    normalizeTenDigitInput(phonePrefill ?? '')
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const items = useCartStore((s) => s.items);
  const setGuestSessionId = useCartStore((s) => s.setGuestSessionId);

  useEffect(() => {
    if (validationError && PAKISTAN_MOBILE_REGEX.test(phoneDigits)) {
      setValidationError(null);
    }
  }, [phoneDigits, validationError]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!PAKISTAN_MOBILE_REGEX.test(phoneDigits)) {
      setValidationError(
        'Enter a valid Pakistan mobile number (10 digits starting with 3).'
      );
      return;
    }
    setValidationError(null);
    setIsLoading(true);
    const { error: sendError } = await authClient.phoneNumber.sendOtp({
      phoneNumber: assemblePakistanE164(phoneDigits),
    });
    setIsLoading(false);
    if (sendError) {
      toast.error(sendError.message ?? 'Failed to send code');
      return;
    }
    const params = new URLSearchParams();
    params.set('phone', assemblePakistanE164(phoneDigits));
    if (redirectFromUrl && isSafeRedirectUrl(redirectFromUrl)) {
      params.set('redirect', buildFullRedirectUrl(redirectFromUrl));
    }
    router.push(`${ABSOLUTE_ROUTES.AUTH_OTP}?${params.toString()}`);
  }

  function handleContinueAsGuest() {
    // Per gap-analysis Q6 (a): mint guestSessionId via crypto.randomUUID()
    // and persist into cart-store. Q5 (b): cart empty → /cart, items → /checkout.
    const guestId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setGuestSessionId(guestId);
    router.push(items.length > 0 ? ABSOLUTE_ROUTES.CHECKOUT : '/cart');
  }

  return (
    <>
      <AuthMobileAppBar />
      <div className="mx-auto flex w-full max-w-[480px] flex-col px-4 py-6 md:py-12">
        <div className="hidden md:block">
          <AuthBrandCluster />
        </div>

        <h1 className="mt-6 font-sans text-[28px] font-extrabold leading-tight tracking-[-0.01em] text-ink md:mt-12 md:text-[30px]">
          Welcome back
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
          Sign in with the phone number you registered.
        </p>

        <form onSubmit={handleSendOtp} className="mt-6 md:mt-8">
          <div className="grid gap-2">
            <Label
              htmlFor="signin-phone"
              className="text-[13px] font-bold text-ink-2"
            >
              Phone number
            </Label>
            <PhoneChipInput
              id="signin-phone"
              value={phoneDigits}
              onChange={setPhoneDigits}
              disabled={isLoading}
              invalid={validationError !== null}
              autoFocus={!phonePrefill}
              ariaLabel="Phone number"
            />
            {validationError ? (
              <p
                className="text-destructive text-sm"
                role="alert"
                aria-live="polite"
              >
                {validationError}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-6 h-[52px] w-full bg-green-2 text-base font-extrabold text-white hover:bg-green-2/90 md:h-14"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 size-4" />
                Sending code…
              </>
            ) : (
              'Send OTP'
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-start gap-2 rounded-md border-[1.5px] border-dashed border-rule-2 bg-paper-2 px-3 py-2.5">
          <Info
            className="mt-0.5 size-4 shrink-0 text-ink-3"
            aria-hidden
            strokeWidth={1.75}
          />
          <p className="text-[13px] text-ink-2">
            You&apos;ll receive a 6-digit OTP on this number.
          </p>
        </div>

        <div aria-hidden className="mt-6 h-px w-full bg-rule" />

        <p className="mt-6 text-center text-sm text-ink-3">
          New to Shalmi?{' '}
          <Link
            href="/sign-up?type=generic"
            className="font-bold text-ink underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>

        <p className="mt-4 text-center text-xs font-semibold text-ink-3">
          Sign in as Vendor · Admin login
        </p>

        <div className="mt-6 flex items-center gap-3">
          <span aria-hidden className="h-px flex-1 bg-rule" />
          <span className="rounded-sm bg-paper-2 px-2 py-1 font-mono text-[11px] font-bold tracking-[0.12em] text-ink-3">
            OR
          </span>
          <span aria-hidden className="h-px flex-1 bg-rule" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleContinueAsGuest}
          className="mt-6 h-12 w-full border-[1.5px] border-rule-2 bg-white text-base font-bold text-ink hover:bg-paper-2"
        >
          <UserRound className="mr-2 size-4" aria-hidden strokeWidth={1.75} />
          Continue as Guest
        </Button>

        <div className="mt-6 rounded-xl border-[1.5px] border-dashed border-rule-2 bg-paper-2 p-3.5">
          <div className="flex items-center gap-2">
            <Sparkles
              className="size-3.5 text-green-700"
              aria-hidden
              strokeWidth={2}
            />
            <span className="text-[13px] font-bold text-green-700">
              Why sign in?
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] font-bold tracking-[0.12em] text-ink-3">
            GUESTS MISS OUT ON
          </p>
          <ul className="mt-2 space-y-1.5">
            <BenefitRow
              icon={<History className="size-4 text-ink-2" aria-hidden />}
              label="Full order history & invoices"
            />
            <BenefitRow
              icon={<RefreshCw className="size-4 text-ink-2" aria-hidden />}
              label="One-tap reorder of past carts"
            />
            <BenefitRow
              icon={<Truck className="size-4 text-ink-2" aria-hidden />}
              label="Track every MNP delivery in real time"
            />
          </ul>
        </div>

        <p className="mt-8 text-center font-mono text-[11px] text-ink-3">
          © 2025 Shalmi · Privacy · Terms
        </p>
      </div>
    </>
  );
}

function BenefitRow({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2">
      {icon}
      <span className="text-[13px] font-semibold text-ink-2">{label}</span>
    </li>
  );
}
