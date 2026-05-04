'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { Button } from '@repo/ui/components/button';
import { Spinner } from '@repo/ui/components/spinner';
import { Stamp } from '@repo/ui/components/stamp';
import { useAddressesQuery } from '@/modules/user-addresses/hooks/use-addresses-query';
import { AddressDialog } from '@/modules/user-addresses/components/address-dialog';
import type { Address } from '@/modules/user-addresses/types';
import {
  OneTimeDeliveryCard,
  type OneTimeAddressDraft,
  type OneTimeAddressErrors,
} from '@/modules/checkout/components/one-time-delivery-card';

type DeliveryAddressSectionProps = {
  selectedAddressId: string | null;
  onSelectAddress: (id: string | null) => void;
  oneTimeDraft: OneTimeAddressDraft;
  onOneTimeChange: (next: OneTimeAddressDraft) => void;
  oneTimeErrors?: OneTimeAddressErrors;
  saveOff: boolean;
  onToggleSaveOff: (next: boolean) => void;
  /** True when no session — saved-address list, "+ Use new address",
   *  divider, and the "Don't save" toggle are all hidden per
   *  buyer-checkout one-time-addr Q10(a). */
  isGuest: boolean;
};

/**
 * Pencil radio-led saved-address cards + OR divider + one-time delivery
 * card. Per buyer-checkout one-time-addr gap-analysis:
 * - Q9(a) the "+ Use a new address" button is RETAINED (distinct intent
 *   from one-time card: dialog saves permanently).
 * - Q8(a) typing into the one-time card de-selects the saved-address radio
 *   (handled by the parent through `onSelectAddress(null)` on draft change).
 * - Q10(a) for guests, hide saved-addresses + divider + Use-new-addr +
 *   the toggle. The one-time card is the only path.
 */
export function DeliveryAddressSection({
  selectedAddressId,
  onSelectAddress,
  oneTimeDraft,
  onOneTimeChange,
  oneTimeErrors,
  saveOff,
  onToggleSaveOff,
  isGuest,
}: DeliveryAddressSectionProps) {
  const { data: addressesList, isLoading } = useAddressesQuery({
    enabled: !isGuest,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section className="space-y-4">
      <h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-ink">
        <span className="text-ink-3">01</span>{' '}
        <span className="ml-2">DELIVERY ADDRESS</span>
      </h2>

      {/* Guests: skip everything before the one-time card. */}
      {!isGuest ? (
        isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="size-6" />
          </div>
        ) : !addressesList || addressesList.length === 0 ? (
          <div className="rounded-md border border-rule bg-white p-6 text-center">
            <p className="text-sm text-ink-3">No saved addresses yet.</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-1.5 size-4" aria-hidden />
              Use a new address
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {addressesList.map((addr: Address) => {
              const selected = selectedAddressId === addr.id;
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => onSelectAddress(addr.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-md border-[1.5px] bg-white p-4 text-left transition-colors',
                    selected
                      ? 'border-ink'
                      : 'border-rule-2 hover:border-ink-3'
                  )}
                  aria-pressed={selected}
                >
                  <span
                    className={cn(
                      'mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px]',
                      selected ? 'border-ink' : 'border-rule-2'
                    )}
                    aria-hidden
                  >
                    {selected ? (
                      <span className="block size-2 rounded-full bg-ink" />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-ink">
                        {addr.title}
                      </span>
                      {addr.isDefault ? (
                        <Stamp variant="success">DEFAULT</Stamp>
                      ) : null}
                    </div>
                    <p className="font-mono text-xs text-ink-3">
                      {addr.recipientName} · {addr.recipientPhone}
                    </p>
                    <p className="text-sm text-ink-2">
                      {addr.address}, {addr.city}
                    </p>
                  </div>
                </button>
              );
            })}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-1.5 size-4" aria-hidden />
              Use a new address
            </Button>
          </div>
        )
      ) : null}

      {/* OR · ONE-TIME DELIVERY divider — hidden for guests (one-time
          is the only path so the divider would be misleading). */}
      {!isGuest ? (
        <div className="flex items-center gap-3 pt-2">
          <span aria-hidden className="h-px flex-1 bg-rule" />
          <span className="rounded-sm bg-paper-2 px-2 py-1 font-mono text-[11px] font-bold tracking-[0.12em] text-ink-3">
            OR · ONE-TIME DELIVERY
          </span>
          <span aria-hidden className="h-px flex-1 bg-rule" />
        </div>
      ) : null}

      <OneTimeDeliveryCard
        value={oneTimeDraft}
        onChange={(next) => {
          onOneTimeChange(next);
          // Per Q8(a) — typing into the one-time card de-selects the
          // saved-address radio.
          if (selectedAddressId) onSelectAddress(null);
        }}
        errors={oneTimeErrors}
        saveOff={saveOff}
        onToggleSaveOff={onToggleSaveOff}
        isGuest={isGuest}
      />

      <AddressDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
}
