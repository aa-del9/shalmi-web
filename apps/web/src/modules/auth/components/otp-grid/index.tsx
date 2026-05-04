'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { cn } from '@repo/ui/lib/utils';

interface OtpGridProps {
  /** OTP length. Per OQ-O ships 6. */
  length: number;
  value: string;
  onChange: (next: string) => void;
  /** Fires when `value.length === length`. Per Q10(a) — auto-submit. */
  onComplete?: (final: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
}

export interface OtpGridHandle {
  focus: () => void;
  reset: () => void;
}

/**
 * 6-box (per OQ-O) OTP grid molecule. Per buyer-otp gap-analysis:
 * - Q10(a) auto-submit when full.
 * - paste anywhere distributes digits.
 * - backspace on empty steps focus back.
 * - mono digits.
 * - focused box has thicker ink border (achieved via `focus:border-ink`).
 */
export const OtpGrid = forwardRef<OtpGridHandle, OtpGridProps>(function OtpGrid(
  {
    length,
    value,
    onChange,
    onComplete,
    disabled,
    invalid,
    autoFocus = true,
    ariaLabel,
  },
  ref
) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useImperativeHandle(ref, () => ({
    focus: () => inputs.current[0]?.focus(),
    reset: () => {
      onChange('');
      inputs.current[0]?.focus();
    },
  }));

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const setDigits = useCallback(
    (digits: string) => {
      const cleaned = digits.replace(/\D/g, '').slice(0, length);
      onChange(cleaned);
      if (cleaned.length === length) onComplete?.(cleaned);
    },
    [length, onChange, onComplete]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const raw = e.target.value;
    if (raw.length > 1) {
      setDigits(raw);
      const last = Math.min(length - 1, raw.replace(/\D/g, '').length - 1);
      if (last >= 0) inputs.current[last]?.focus();
      return;
    }
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = (value.padEnd(index, ' ').slice(0, index) + digit).trimEnd();
    setDigits(next);
    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) {
    if (e.key === 'Backspace') {
      if (value[index]) {
        const next = value.slice(0, index) + value.slice(index + 1);
        onChange(next);
        return;
      }
      if (index > 0) {
        const next = value.slice(0, index - 1);
        onChange(next);
        inputs.current[index - 1]?.focus();
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputs.current[index + 1]?.focus();
      e.preventDefault();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text');
    if (!pasted) return;
    e.preventDefault();
    setDigits(pasted);
    const filled = Math.min(
      length - 1,
      pasted.replace(/\D/g, '').slice(0, length).length - 1
    );
    if (filled >= 0) inputs.current[filled]?.focus();
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-center justify-between gap-2 sm:gap-3"
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length /* permit paste, normalised in handleChange */}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-14 w-12 rounded-md border-[1.5px] bg-white text-center font-mono text-2xl font-bold text-ink',
            'focus:border-ink focus:outline-none focus:ring-0',
            'transition-colors',
            invalid ? 'border-destructive' : 'border-rule-2',
            disabled && 'cursor-not-allowed opacity-60',
            'sm:h-16 sm:w-14'
          )}
        />
      ))}
    </div>
  );
});
