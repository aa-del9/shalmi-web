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

type DeliveryAddressSectionProps = {
  selectedAddressId: string | null;
  onSelectAddress: (id: string | null) => void;
};

/**
 * Pencil radio-led saved-address cards.
 * Per buyer-checkout gap-analysis Q8: "+ Use a new address" opens the
 * existing AddressDialog. Per Q9/Q10: no manual form, no "Manage addresses"
 * link — saved addresses only.
 */
export function DeliveryAddressSection({
  selectedAddressId,
  onSelectAddress,
}: DeliveryAddressSectionProps) {
  const { data: addressesList, isLoading } = useAddressesQuery();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section className="space-y-4">
      <h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-ink">
        <span className="text-ink-3">01</span>{' '}
        <span className="ml-2">DELIVERY ADDRESS</span>
      </h2>

      {isLoading ? (
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
      )}

      <AddressDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
}
