'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';
import { Spinner } from '@repo/ui/components/spinner';
import { Stamp } from '@repo/ui/components/stamp';
import { authClient } from '@/modules/auth/client/auth-client';
import { getPostAuthRedirectUrl } from '@/modules/auth/utils/redirect';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { formatPakistanE164ForDisplay } from '@/modules/auth/utils/phone-format';
import {
  OTP_RESEND_COUNTDOWN_SECONDS,
  OTP_RESEND_MAX_ATTEMPTS,
} from '@/modules/auth/constants';
import { AuthBrandCluster } from '@/modules/auth/components/auth-brand-cluster';
import { AuthMobileAppBar } from '@/modules/auth/components/auth-mobile-app-bar';
import { OtpGrid, type OtpGridHandle } from '@/modules/auth/components/otp-grid';
import { OtpHelpDialog } from '@/modules/auth/components/otp-help-dialog';

const OTP_LENGTH = 6;

export function OtpVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone')?.trim() ?? '';
  const redirectParam = searchParams.get('redirect');

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_COUNTDOWN_SECONDS);
  const [resendCount, setResendCount] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [lockedOut, setLockedOut] = useState(false);
  const gridRef = useRef<OtpGridHandle>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const formattedPhone = formatPakistanE164ForDisplay(phoneParam);
  const resendsExhausted = resendCount >= OTP_RESEND_MAX_ATTEMPTS;
  const canResend = secondsLeft <= 0 && !resendsExhausted && !isResending;
  const timerLabel = formatTimer(secondsLeft);

  async function handleVerify(finalCode?: string) {
    if (!phoneParam) return;
    const submitted = (finalCode ?? code).trim();
    if (submitted.length !== OTP_LENGTH) return;
    setError(null);
    setIsVerifying(true);
    const { error: verifyError } = await authClient.phoneNumber.verify({
      phoneNumber: phoneParam,
      code: submitted,
      disableSession: false,
    });
    setIsVerifying(false);
    if (verifyError) {
      const msg = verifyError.message ?? 'Verification failed';
      // Better-auth surfaces the lockout (after `allowedAttempts: 3`) as
      // a non-validation error. Use a substring sniff to flip into the
      // lockout state per Q8(a).
      if (/too many|invalid attempts|exceed/i.test(msg)) {
        setLockedOut(true);
        setSecondsLeft(OTP_RESEND_COUNTDOWN_SECONDS);
        setError('Too many attempts — resend the code or try again in a moment.');
        return;
      }
      setError(msg);
      return;
    }
    const { data: session } = await authClient.getSession();
    const role = (session?.user as { role?: string } | undefined)?.role;
    router.push(getPostAuthRedirectUrl(redirectParam, role));
  }

  async function handleResend() {
    if (!phoneParam || !canResend) return;
    setIsResending(true);
    const { error: sendError } = await authClient.phoneNumber.sendOtp({
      phoneNumber: phoneParam,
    });
    setIsResending(false);
    if (sendError) {
      toast.error(sendError.message ?? 'Failed to resend code');
      return;
    }
    setResendCount((n) => n + 1);
    setSecondsLeft(OTP_RESEND_COUNTDOWN_SECONDS);
    setLockedOut(false);
    setError(null);
    setCode('');
    gridRef.current?.reset();
    toast.success('Code re-sent.');
  }

  if (!phoneParam) {
    // Per Q14(a) — preserve the missing-phone fallback verbatim from the
    // legacy form.
    return (
      <div className="container flex max-w-md flex-col gap-4 py-12">
        <h1 className="text-xl font-semibold">Verify OTP</h1>
        <p className="text-muted-foreground text-sm">
          Missing phone number. Please start by entering your phone number on
          the{' '}
          <Link href={ABSOLUTE_ROUTES.AUTH} className="underline">
            sign-in page
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <AuthMobileAppBar />
      <div className="mx-auto flex w-full max-w-[480px] flex-col px-4 py-6 md:py-12">
        <div className="hidden md:block">
          <AuthBrandCluster
            trailing={
              <Stamp variant="success" className="-rotate-2">
                <ShieldCheck className="mr-1 size-3" aria-hidden />
                SECURE
              </Stamp>
            }
          />
        </div>
        <div className="md:hidden">
          <Stamp variant="success" className="ml-auto -rotate-2">
            <ShieldCheck className="mr-1 size-3" aria-hidden />
            SECURE
          </Stamp>
        </div>

        <div className="mt-6 flex items-start gap-2.5 rounded-md border border-rule bg-paper-2 px-3 py-2.5">
          <Shield
            className="mt-0.5 size-4 shrink-0 text-ink-2"
            aria-hidden
            strokeWidth={1.75}
          />
          <p className="text-[13px] text-ink-2">
            Never share your OTP code with anyone.
          </p>
        </div>

        <p className="mt-6 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-green-700">
          STEP 2 OF 2
        </p>

        <h1 className="mt-2 font-sans text-[28px] font-extrabold leading-tight tracking-[-0.01em] text-ink md:text-[30px]">
          Verify your number
        </h1>

        {/* Sub: desktop inline "Change number"; mobile separate line per Q11(b). */}
        <div className="mt-2 text-[15px] text-ink-2">
          <span>We sent a 6-digit code to {formattedPhone}.</span>{' '}
          <Link
            href={ABSOLUTE_ROUTES.AUTH}
            className="hidden font-bold text-ink underline-offset-4 hover:underline md:inline"
          >
            Change number
          </Link>
          <Link
            href={ABSOLUTE_ROUTES.AUTH}
            className="mt-1 block font-bold text-ink underline-offset-4 hover:underline md:hidden"
          >
            Change number
          </Link>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleVerify();
          }}
          className="mt-6"
        >
          <OtpGrid
            ref={gridRef}
            length={OTP_LENGTH}
            value={code}
            onChange={(next) => {
              if (lockedOut) setLockedOut(false);
              setError(null);
              setCode(next);
            }}
            onComplete={(final) => void handleVerify(final)}
            disabled={isVerifying || lockedOut}
            invalid={error !== null}
            ariaLabel="One-time password"
          />
          {error ? (
            <p
              className="mt-2 text-destructive text-sm"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={
              isVerifying || code.length !== OTP_LENGTH || lockedOut
            }
            className="mt-6 h-[52px] w-full bg-green-2 text-base font-extrabold text-white hover:bg-green-2/90 md:h-14"
          >
            {isVerifying ? (
              <>
                Verify and continue
                <Spinner className="ml-2 size-4" />
              </>
            ) : (
              <>
                Verify and continue
                <ChevronRight className="ml-2 size-4" aria-hidden />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-[13px]">
          {canResend ? (
            <button
              type="button"
              onClick={() => void handleResend()}
              className="font-mono font-semibold text-ink underline-offset-4 hover:underline"
            >
              Resend code
            </button>
          ) : (
            <span className="font-mono text-ink-3">
              {resendsExhausted
                ? 'Resends exhausted'
                : `Resend code in ${timerLabel}`}
            </span>
          )}
          <OtpHelpDialog
            trigger={
              <button
                type="button"
                className="text-[13px] font-bold text-ink hover:underline"
              >
                Get help
              </button>
            }
          />
        </div>

        <p className="mt-8 text-center font-mono text-[11px] text-ink-3">
          © 2025 Shalmi · Privacy · Terms
        </p>
      </div>
    </>
  );
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
