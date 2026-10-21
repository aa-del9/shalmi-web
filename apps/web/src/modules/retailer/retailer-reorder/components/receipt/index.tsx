'use client';

import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import {
  resolveDeliveryTier,
} from '@/modules/cart/utils/delivery-tiers';

interface ReceiptProps {
  itemCount: number;
  subtotalCents: number;
  weightGrams: number;
  /** Compact mobile variant — drops the "N items" row. */
  compact?: boolean;
}

/**
 * Pencil FDQJ6 (desktop) / XCIbS (mobile) — order summary card.
 *
 * Per gap-analysis Q21–Q26 + Q25 DEFERRED:
 * - Subtotal / Delivery (tier label) / Total. No GST row.
 * - Mobile compact drops the leading "N items" row.
 * - Total label is `Total`, not `COD Amount to Collect`.
 */
export function Receipt({
  itemCount,
  subtotalCents,
  weightGrams,
  compact = false,
}: ReceiptProps) {
  const tier = resolveDeliveryTier(weightGrams);
  const totalCents = subtotalCents + tier.feeCents;

  return (
    <div className="rounded-md border-[1.5px] border-rule-2 bg-paper-2 p-5">
      <h2 className="text-center font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2">
        Order summary
      </h2>
      <div className="mt-3 h-px bg-rule" aria-hidden />
      <div className="mt-3 space-y-2 text-[13px]">
        {compact ? null : (
          <div className="flex justify-between">
            <span className="text-ink-3">{itemCount} items</span>
            <span className="font-mono text-ink">
              {formatRupeesFromCents(subtotalCents)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-ink-3">Subtotal</span>
          <span className="font-mono text-ink">
            {formatRupeesFromCents(subtotalCents)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-3">Delivery ({tier.label})</span>
          <span className="font-mono text-ink">
            {formatRupeesFromCents(tier.feeCents)}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between border-t-[1.5px] border-ink pt-3">
        <span className="font-sans text-[14px] font-bold text-ink">Total</span>
        <span
          className={`font-mono ${
            compact ? 'text-[15px]' : 'text-[16px]'
          } font-extrabold text-ink`}
        >
          {formatRupeesFromCents(totalCents)}
        </span>
      </div>
    </div>
  );
}
