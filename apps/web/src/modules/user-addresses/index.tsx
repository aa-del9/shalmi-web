'use client';

import { useState } from 'react';
import { Spinner } from '@repo/ui/components/spinner';
import { AddressDialog } from './components/address-dialog';
import { AddressesList } from './components/addresses-list';
import { AddressesPageHeader } from './components/addresses-page-header';
import { useAddressesQuery } from './hooks/use-addresses-query';

export function UserAddresses() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: addressesList, isLoading } = useAddressesQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <AddressesPageHeader onAddClick={() => setDialogOpen(true)} />
      <AddressesList
        addresses={addressesList}
        isLoading={isLoading}
        onAddClick={() => setDialogOpen(true)}
      />
      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
