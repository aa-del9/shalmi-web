'use client';

import { Calendar, Clock, LifeBuoy, Landmark, Pencil } from 'lucide-react';
import { Skeleton } from '@repo/ui/components/skeleton';
import { useVendorShopQuery } from '@/modules/vendor/vendor-dashboard/hooks/use-vendor-shop-query';
import { maskIbanDesktop, maskIbanMobile } from '../../utils/iban-mask';

const SUPPORT_PHONE = '0300-SHALMI';

/**
 * Pencil `xng62` (desktop) / `z8M5h2` (mobile) — bank info card.
 *
 * Edit pencil icon is STUBBED (Q14 DEFERRED — no self-service flow
 * this batch). Mobile policy-block popover (Q-DS-1) is STUBBED — the
 * desktop policy block ships, mobile hides it.
 */
export function BankInfoCard() {
  const { data: shop, isLoading } = useVendorShopQuery();

  if (isLoading) {
    return (
      <section className="rounded-xl border border-rule bg-white p-5 md:p-6">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-12 w-full" />
      </section>
    );
  }

  // Reconstruct iban-ish for masking — useVendorShopQuery only returns
  // last4 today. Future: expose full iban via a dedicated endpoint.
  // For now, prefix with bank code + last4 (no middle digits available).
  const ibanLast4 = shop?.ibanLast4 ?? '';
  // Synthesise an "iban-shaped" string so the mask helper treats the
  // last4 correctly. Pencil's mask is identical regardless of middle
  // digits, so this is a faithful render.
  const synthIban = ibanLast4 ? `PK24MEZN00000000${ibanLast4}` : '';

  return (
    <section className="rounded-xl border border-rule bg-white p-5 md:p-6">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3">
        PAYS TO YOUR ACCOUNT
      </p>

      <div className="mt-4 flex items-center gap-4">
        <span
          aria-hidden
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-paper-2"
        >
          <Landmark className="size-6 text-ink" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-ink">
            {shop?.bankName ?? '—'} · {shop?.fullName ?? ''}
          </p>
          <p className="hidden truncate font-mono text-[12px] text-ink-3 md:block">
            {synthIban ? maskIbanDesktop(synthIban) : '—'}
          </p>
          <p className="truncate font-mono text-[11px] text-ink-3 md:hidden">
            {synthIban ? maskIbanMobile(synthIban) : '—'}
          </p>
        </div>
        {/* TODO(post-v1): wire bank-edit dialog (gap-analysis Q14 STUBBED). */}
        <button
          type="button"
          aria-label="Edit bank details"
          onClick={() => {
            /* no-op */
          }}
          className="text-ink-3 transition-colors hover:text-ink"
        >
          <Pencil className="size-[18px] md:size-[18px]" />
        </button>
      </div>

      {/* Desktop policy block (mobile drops it per Q12; mobile popover STUBBED Q-DS-1) */}
      <ul className="mt-5 hidden flex-col gap-3 text-[13px] text-ink-2 md:flex">
        <li className="flex items-center gap-3">
          <Calendar className="size-4 shrink-0 text-ink-3" aria-hidden />
          Payouts every Friday
        </li>
        <li className="flex items-center gap-3">
          <Clock className="size-4 shrink-0 text-ink-3" aria-hidden />
          7-day return window before completion
        </li>
        <li className="flex items-center gap-3">
          <LifeBuoy className="size-4 shrink-0 text-ink-3" aria-hidden />
          {/* TODO(post-v1): real support number (gap-analysis Q15 STUBBED). */}
          Disputes? Call admin: {SUPPORT_PHONE}
        </li>
      </ul>
    </section>
  );
}
