'use client';

import { Send, Info } from 'lucide-react';
import { PAKISTAN_PROVINCES } from '@repo/constants/geo';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Stamp } from '@repo/ui/components/stamp';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import Link from 'next/link';
import { cn } from '@repo/ui/lib/utils';
import { PhoneChipInput } from '@/modules/auth/components/phone-chip-input';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

export interface OneTimeAddressDraft {
  recipientName: string;
  phoneDigits: string; // 10-digit (without +92)
  street: string;
  city: string;
  postalCode: string;
  province: string;
}

export interface OneTimeAddressErrors {
  recipientName?: string;
  phoneDigits?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  province?: string;
}

interface OneTimeDeliveryCardProps {
  value: OneTimeAddressDraft;
  onChange: (next: OneTimeAddressDraft) => void;
  errors?: OneTimeAddressErrors;
  /** Per Q3(b) — pinned ON for guests; togglable for authed users. */
  saveDisabled?: boolean;
  saveOff: boolean; // toggle is OFF when checked (i.e. SAVE the address)
  onToggleSaveOff: (next: boolean) => void;
  /** True when the user is checking out as a guest. Hides the toggle UI
   *  and swaps the hint card copy per Q7(b). */
  isGuest?: boolean;
}

/**
 * One-time delivery address card per buyer-checkout one-time-addr
 * gap-analysis. Paper-2 dashed card with green send-icon tile, rotated
 * `WON'T BE SAVED` stamp on desktop (subtle inline mono on mobile per
 * Q1(a)), `Don't save` toggle on the right (default ON, per Q3),
 * 3-up postal/province row on desktop, single column on mobile, hint
 * card at the bottom.
 *
 * Landmark intentionally omitted per Q6(d) amendment 2026-05-04.
 */
export function OneTimeDeliveryCard({
  value,
  onChange,
  errors,
  saveDisabled,
  saveOff,
  onToggleSaveOff,
  isGuest,
}: OneTimeDeliveryCardProps) {
  function set<K extends keyof OneTimeAddressDraft>(
    key: K,
    next: OneTimeAddressDraft[K]
  ) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="rounded-xl border-[1.5px] border-dashed border-rule-2 bg-paper-2 p-4 md:p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-green-bg text-green-700"
          >
            <Send className="size-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-ink">One-time delivery</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-2">
              Use this for gift orders or a one-off shop — we won&apos;t add it
              to your saved addresses.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Stamp variant="warning" className="-rotate-2 hidden md:inline-flex">
            WON&apos;T BE SAVED
          </Stamp>
          <span className="font-mono text-[10px] font-semibold text-ink-3 md:hidden">
            won&apos;t be saved
          </span>
          {!isGuest ? (
            <ToggleSwitch
              label="Don't save"
              checked={saveOff}
              onChange={onToggleSaveOff}
              disabled={saveDisabled}
            />
          ) : null}
        </div>
      </div>

      {/* Fields */}
      <div className="mt-5 grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <FieldGroup
            label="Recipient name"
            error={errors?.recipientName}
            htmlFor="ot-name"
          >
            <Input
              id="ot-name"
              autoComplete="name"
              value={value.recipientName}
              onChange={(e) => set('recipientName', e.target.value)}
              aria-invalid={errors?.recipientName ? true : undefined}
              className="h-11 bg-white"
            />
          </FieldGroup>
          <FieldGroup label="Phone number" error={errors?.phoneDigits} htmlFor="ot-phone">
            <PhoneChipInput
              id="ot-phone"
              value={value.phoneDigits}
              onChange={(digits) => set('phoneDigits', digits)}
              invalid={errors?.phoneDigits !== undefined}
              ariaLabel="Recipient phone number"
            />
          </FieldGroup>
        </div>

        <FieldGroup label="Street, house / shop number" error={errors?.street} htmlFor="ot-street">
          <Input
            id="ot-street"
            autoComplete="street-address"
            value={value.street}
            onChange={(e) => set('street', e.target.value)}
            aria-invalid={errors?.street ? true : undefined}
            className="h-11 bg-white"
          />
        </FieldGroup>

        <div className="grid gap-3 md:grid-cols-3">
          <FieldGroup label="City" error={errors?.city} htmlFor="ot-city">
            <Input
              id="ot-city"
              autoComplete="address-level2"
              value={value.city}
              onChange={(e) => set('city', e.target.value)}
              aria-invalid={errors?.city ? true : undefined}
              className="h-11 bg-white"
            />
          </FieldGroup>
          <FieldGroup label="Postal code" error={errors?.postalCode} htmlFor="ot-postal">
            <Input
              id="ot-postal"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              value={value.postalCode}
              onChange={(e) => set('postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
              aria-invalid={errors?.postalCode ? true : undefined}
              className="h-11 bg-white font-mono"
            />
          </FieldGroup>
          <FieldGroup label="Province" error={errors?.province} htmlFor="ot-province">
            <Select value={value.province} onValueChange={(next) => set('province', next)}>
              <SelectTrigger
                id="ot-province"
                className="!h-11 bg-white"
                aria-invalid={errors?.province ? true : undefined}
              >
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {PAKISTAN_PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
        </div>
      </div>

      {/* Hint card */}
      <div className="mt-4 flex items-start gap-2 rounded-md border-[1.5px] border-dashed border-rule-2 bg-paper-2 px-3 py-2.5">
        <Info className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden strokeWidth={1.75} />
        {isGuest ? (
          <p className="text-[12px] leading-relaxed text-ink-2">
            <Link
              href={`${ABSOLUTE_ROUTES.AUTH}?redirect=${encodeURIComponent(ABSOLUTE_ROUTES.CHECKOUT)}`}
              className="font-bold text-ink underline-offset-4 hover:underline"
            >
              Sign in
            </Link>{' '}
            next time to save addresses for one-tap reuse.
          </p>
        ) : (
          <p className="text-[12px] leading-relaxed text-ink-2">
            <span className="font-bold text-ink">Used only for this order.</span>{' '}
            Toggle off the switch above if you&apos;d like us to save this
            address to your account for next time.
          </p>
        )}
      </div>
    </div>
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
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor} className="text-[12px] font-bold text-ink-2">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ToggleSwitch({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex items-center gap-2 text-[12px] font-mono font-semibold text-ink-3',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={cn(
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
          checked ? 'bg-green-2' : 'bg-rule-2'
        )}
      >
        <span
          className={cn(
            'inline-block size-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
          )}
        />
      </span>
    </button>
  );
}
