'use client';

import { Pencil } from 'lucide-react';
import { Stamp } from '@repo/ui/components/stamp';
import { cn } from '@repo/ui/lib/utils';
import type { Address } from '../../types';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
}

/**
 * Pencil sA1/sA2/sA3 — saved-address card.
 *
 * Per gap-analysis answers:
 * - Q12: composition is `address, city postalCode, province` (recipient
 *   name is removed display-only — Q15).
 * - Q16: phone separated to its own row, mono 12 ink-3.
 * - Q31/Q32: padding 18, title sans 15/700.
 * - Q10/Q11: DEFAULT pill via `Stamp variant="inverse" rotated={false}`.
 * - Default vs non-default surface contrast (paper-2 + 1.5px ink stroke
 *   vs white + 1px rule).
 */
export function AddressCard({ address, onEdit }: AddressCardProps) {
  const composedAddress = [
    address.address,
    [address.city, address.postalCode].filter(Boolean).join(' '),
    address.province,
  ]
    .filter((p): p is string => Boolean(p && p.length > 0))
    .join(', ');

  return (
    <article
      className={cn(
        'flex flex-col rounded-md p-[18px]',
        address.isDefault
          ? 'border-[1.5px] border-ink bg-paper-2'
          : 'border border-rule bg-white'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-sans text-[15px] font-bold text-ink">
            {address.title}
          </h3>
          {address.isDefault ? (
            <Stamp variant="inverse" rotated={false}>
              DEFAULT
            </Stamp>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onEdit(address)}
          aria-label={`Edit ${address.title}`}
          className="-m-1 flex size-8 items-center justify-center rounded-sm text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
        >
          <Pencil className="size-3.5" aria-hidden />
        </button>
      </div>
      <p className="mt-2 font-sans text-[13px] leading-[1.5] text-ink-2">
        {composedAddress}
      </p>
      <p className="mt-2 font-mono text-[12px] text-ink-3">
        {address.recipientPhone}
      </p>
    </article>
  );
}
