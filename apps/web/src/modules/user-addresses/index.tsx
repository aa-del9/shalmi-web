'use client';

import { useState } from 'react';
import { Spinner } from '@repo/ui/components/spinner';
import { AddressDialog } from './components/address-dialog';
import { AddressesList } from './components/addresses-list';
import { AddressesPageHeader } from './components/addresses-page-header';
import { useAddressesQuery } from './hooks/use-addresses-query';
import type { Address } from './types';

/**
 * Saved Addresses sub-page (Pencil d4ciA card body).
 *
 * Renders inside the Settings shell — no page-level chrome (the shell owns
 * H1 + breadcrumb + sidebar). Per gap-analysis Q24 the loading state is
 * the existing centred Spinner.
 */
export function UserAddresses() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const { data: addressesList, isLoading } = useAddressesQuery();

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <section className="space-y-6 px-4 py-6 lg:px-0 lg:py-0">
      <AddressesPageHeader onAddClick={openCreate} />
      <AddressesList
        addresses={addressesList}
        isLoading={isLoading}
        onAddClick={openCreate}
        onEditAddress={openEdit}
      />
      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editing}
      />
    </section>
  );
}
