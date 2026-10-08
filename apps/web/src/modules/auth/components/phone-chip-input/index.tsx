'use client';

import { forwardRef } from 'react';
import { cn } from '@repo/ui/lib/utils';
import { PHONE_DIAL_PREFIX } from '@/modules/auth/constants';
import { normalizeTenDigitInput } from '@/modules/auth/utils/phone-format';

interface PhoneChipInputProps {
  id?: string;
  value: string; // 10-digit normalised string ("3001234567")
  onChange: (digits: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
  placeholder?: string; // shown inside the digits input
}

/**
 * `+92` chip + 10-digit mobile input. Per buyer-signin gap-analysis §0a
 * "Brand mark cluster" siblings — split control: left chip is decorative
 * (mono "+92"), right input accepts only digits, max 10, leading 0 / 92
 * stripped.
 *
 * Heights match Pencil:
 *   desktop chip 60w x 52h, input 52h
 *   mobile  chip 54w x 48h, input 48h
 *
 * The split is purely visual; submission concatenates `+92` + digits via
 * `assemblePakistanE164` from the consumer.
 */
export const PhoneChipInput = forwardRef<HTMLInputElement, PhoneChipInputProps>(
  function PhoneChipInput(
    {
      id,
      value,
      onChange,
      disabled,
      invalid,
      autoFocus,
      ariaLabel,
      placeholder = '300 1234567',
    },
    ref
  ) {
    return (
      <div
        className={cn(
          'flex h-12 w-full items-stretch overflow-hidden rounded-md border-[1.5px] border-rule-2 bg-white md:h-[52px]',
          invalid && 'border-destructive',
          disabled && 'opacity-60'
        )}
      >
        <div
          aria-hidden
          className="flex w-[54px] items-center justify-center border-r-[1.5px] border-rule-2 bg-paper-2 font-mono text-sm font-bold text-ink md:w-[60px] md:text-[15px]"
        >
          {PHONE_DIAL_PREFIX}
        </div>
        <input
          id={id}
          ref={ref}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          autoFocus={autoFocus}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(normalizeTenDigitInput(e.target.value))}
          maxLength={10}
          placeholder={placeholder}
          className="flex-1 bg-white px-3 font-mono text-[15px] tracking-[0.02em] text-ink placeholder:text-ink-4 focus:outline-none disabled:cursor-not-allowed"
        />
      </div>
    );
  }
);
