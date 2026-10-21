'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Spinner } from '@repo/ui/components/spinner';
import { signupGenericSchema } from '@repo/schemas/auth/signup';
import { authClient } from '@/modules/auth/client/auth-client';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { PAKISTAN_MOBILE_REGEX } from '@/modules/auth/constants';
import {
  assemblePakistanE164,
  normalizeTenDigitInput,
} from '@/modules/auth/utils/phone-format';
import { PhoneChipInput } from '@/modules/auth/components/phone-chip-input';
import { setPendingSignup } from '@/modules/auth/utils/pending-signup';

interface GenericFormProps {
  phonePrefill?: string | null;
}

export function GenericSignupForm({ phonePrefill }: GenericFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState(() =>
    normalizeTenDigitInput(phonePrefill ?? '')
  );
  const [phoneAlreadyRegistered, setPhoneAlreadyRegistered] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (phoneAlreadyRegistered) setPhoneAlreadyRegistered(false);
    // user is editing — clear stale field errors as the value changes
    if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
  }, [phoneDigits]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const next: { name?: string; phone?: string } = {};
    const nameParse = signupGenericSchema.shape.name.safeParse(trimmedName);
    if (!nameParse.success) {
      next.name = nameParse.error.errors[0]?.message ?? 'Invalid name';
    }
    if (!PAKISTAN_MOBILE_REGEX.test(phoneDigits)) {
      next.phone = 'Enter a valid Pakistan mobile (10 digits starting with 3).';
    }
    if (next.name || next.phone) {
      setErrors(next);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    setPendingSignup({ retailerType: 'generic', name: trimmedName });

    const phoneE164 = assemblePakistanE164(phoneDigits);
    const { error: sendError } = await authClient.phoneNumber.sendOtp({
      phoneNumber: phoneE164,
    });
    setIsSubmitting(false);

    if (sendError) {
      const msg = sendError.message ?? '';
      if (/already|registered|unique|exists/i.test(msg)) {
        // Per Q9(a) — inline conflict error with a "Sign in" link.
        setPhoneAlreadyRegistered(true);
        return;
      }
      toast.error(msg || 'Failed to send code');
      return;
    }

    const params = new URLSearchParams();
    params.set('phone', phoneE164);
    router.push(`${ABSOLUTE_ROUTES.AUTH_OTP}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="signup-name" className="text-[13px] font-bold text-ink-2">
          Full name
        </Label>
        <Input
          id="signup-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((er) => ({ ...er, name: undefined }));
          }}
          disabled={isSubmitting}
          aria-invalid={errors.name ? true : undefined}
          className="h-12"
          placeholder="Your name"
        />
        {errors.name ? (
          <p className="text-destructive text-sm" role="alert">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label
          htmlFor="signup-phone"
          className="text-[13px] font-bold text-ink-2"
        >
          Phone number
        </Label>
        <PhoneChipInput
          id="signup-phone"
          value={phoneDigits}
          onChange={(digits) => {
            setPhoneDigits(digits);
          }}
          disabled={isSubmitting}
          invalid={errors.phone !== undefined || phoneAlreadyRegistered}
          ariaLabel="Phone number"
        />
        {errors.phone ? (
          <p className="text-destructive text-sm" role="alert">
            {errors.phone}
          </p>
        ) : null}
        {phoneAlreadyRegistered ? (
          <p className="text-destructive text-sm" role="alert">
            This number is already registered.{' '}
            <a
              href={`${ABSOLUTE_ROUTES.AUTH}?phone=${encodeURIComponent(assemblePakistanE164(phoneDigits))}`}
              className="font-bold underline-offset-4 hover:underline"
            >
              Sign in
            </a>{' '}
            instead.
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-[52px] w-full bg-green-2 text-base font-extrabold text-white hover:bg-green-2/90"
      >
        Continue
        {isSubmitting ? (
          <Spinner className="ml-2 size-4" />
        ) : (
          <ChevronRight className="ml-2 size-4" aria-hidden />
        )}
      </Button>

      <div className="mt-2 flex items-start gap-2 rounded-md border-[1.5px] border-dashed border-rule-2 bg-paper-2 px-3 py-2.5">
        <Info
          className="mt-0.5 size-4 shrink-0 text-ink-3"
          aria-hidden
          strokeWidth={1.75}
        />
        <p className="text-[13px] text-ink-2">
          You&apos;ll receive a 6-digit OTP on this number to verify.
        </p>
      </div>
    </form>
  );
}
