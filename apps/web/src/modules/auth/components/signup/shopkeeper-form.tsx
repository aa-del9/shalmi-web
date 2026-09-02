'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Spinner } from '@repo/ui/components/spinner';
import { signupShopkeeperSchema } from '@repo/schemas/auth/signup';
import { authClient } from '@/modules/auth/client/auth-client';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { PAKISTAN_MOBILE_REGEX } from '@/modules/auth/constants';
import {
  assemblePakistanE164,
  normalizeTenDigitInput,
} from '@/modules/auth/utils/phone-format';
import { PhoneChipInput } from '@/modules/auth/components/phone-chip-input';
import { setPendingSignup } from '@/modules/auth/utils/pending-signup';

interface ShopkeeperFormProps {
  phonePrefill?: string | null;
}

interface FieldErrors {
  name?: string;
  shopName?: string;
  shopAddress?: string;
  phone?: string;
}

export function ShopkeeperSignupForm({ phonePrefill }: ShopkeeperFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [phoneDigits, setPhoneDigits] = useState(() =>
    normalizeTenDigitInput(phonePrefill ?? '')
  );
  const [phoneAlreadyRegistered, setPhoneAlreadyRegistered] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (phoneAlreadyRegistered) setPhoneAlreadyRegistered(false);
    if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
  }, [phoneDigits]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedShopName = shopName.trim();
    const trimmedShopAddress = shopAddress.trim();

    const next: FieldErrors = {};
    const nameParse =
      signupShopkeeperSchema.shape.name.safeParse(trimmedName);
    if (!nameParse.success)
      next.name = nameParse.error.errors[0]?.message ?? 'Invalid name';
    const sname =
      signupShopkeeperSchema.shape.shopName.safeParse(trimmedShopName);
    if (!sname.success)
      next.shopName = sname.error.errors[0]?.message ?? 'Invalid shop name';
    const saddr =
      signupShopkeeperSchema.shape.shopAddress.safeParse(trimmedShopAddress);
    if (!saddr.success)
      next.shopAddress = saddr.error.errors[0]?.message ?? 'Invalid shop address';
    if (!PAKISTAN_MOBILE_REGEX.test(phoneDigits))
      next.phone = 'Enter a valid Pakistan mobile (10 digits starting with 3).';

    if (next.name || next.shopName || next.shopAddress || next.phone) {
      setErrors(next);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    setPendingSignup({
      retailerType: 'shopkeeper',
      name: trimmedName,
      shopName: trimmedShopName,
      shopAddress: trimmedShopAddress,
    });

    const phoneE164 = assemblePakistanE164(phoneDigits);
    const { error: sendError } = await authClient.phoneNumber.sendOtp({
      phoneNumber: phoneE164,
    });
    setIsSubmitting(false);

    if (sendError) {
      const msg = sendError.message ?? '';
      if (/already|registered|unique|exists/i.test(msg)) {
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
      <FieldGroup label="Shopkeeper name" error={errors.name} htmlFor="sk-name">
        <Input
          id="sk-name"
          type="text"
          autoComplete="name"
          placeholder="Saleem Bhai"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((er) => ({ ...er, name: undefined }));
          }}
          disabled={isSubmitting}
          aria-invalid={errors.name ? true : undefined}
          className="h-12"
        />
      </FieldGroup>

      <FieldGroup label="Shop name" error={errors.shopName} htmlFor="sk-shop">
        <Input
          id="sk-shop"
          type="text"
          autoComplete="organization"
          placeholder="Saleem Snacks Co."
          value={shopName}
          onChange={(e) => {
            setShopName(e.target.value);
            if (errors.shopName)
              setErrors((er) => ({ ...er, shopName: undefined }));
          }}
          disabled={isSubmitting}
          aria-invalid={errors.shopName ? true : undefined}
          className="h-12"
        />
      </FieldGroup>

      <FieldGroup
        label="Shop address"
        error={errors.shopAddress}
        htmlFor="sk-addr"
      >
        <textarea
          id="sk-addr"
          autoComplete="street-address"
          placeholder="Block 4, Satellite Town, Gujranwala 52250, Punjab"
          value={shopAddress}
          onChange={(e) => {
            setShopAddress(e.target.value);
            if (errors.shopAddress)
              setErrors((er) => ({ ...er, shopAddress: undefined }));
          }}
          disabled={isSubmitting}
          aria-invalid={errors.shopAddress ? true : undefined}
          rows={3}
          className="h-20 w-full rounded-sm border-[1.5px] border-rule-2 bg-white p-3 text-sm text-ink-2 placeholder:text-ink-4 focus:border-ink focus:outline-none aria-[invalid=true]:border-destructive"
        />
      </FieldGroup>

      <FieldGroup label="Phone number" error={errors.phone} htmlFor="sk-phone">
        <PhoneChipInput
          id="sk-phone"
          value={phoneDigits}
          onChange={setPhoneDigits}
          disabled={isSubmitting}
          invalid={errors.phone !== undefined || phoneAlreadyRegistered}
          ariaLabel="Phone number"
        />
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
      </FieldGroup>

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
          You&apos;ll receive a 6-digit OTP on this number to verify your shop.
        </p>
      </div>
    </form>
  );
}

function FieldGroup({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className="text-[13px] font-bold text-ink-2">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
