'use client';

import { Button } from '@repo/ui/components/button';
import { Plus } from 'lucide-react';
import { AddressCard } from '../address-card';
import type { Address } from '../../types';

interface AddressesListProps {
  addresses: Address[] | undefined;
  isLoading: boolean;
  onAddClick: () => void;
  onEditAddress: (address: Address) => void;
}

/**
 * Saved-addresses grid (Pencil klP6v).
 *
 * Per gap-analysis Q33: 1 / 2 / 3 columns at sm / md / lg. Per Q23 the
 * empty state is the existing copy retoken'd.
 */
export function AddressesList({
  addresses,
  isLoading,
  onAddClick,
  onEditAddress,
}: AddressesListProps) {
  if (isLoading) return null;

  if (!addresses?.length) {
    return (
      <div className="rounded-md border border-rule bg-white p-10 text-center">
        <p className="mb-4 font-sans text-sm text-ink-3">
          You don&apos;t have any saved addresses yet.
        </p>
        <Button onClick={onAddClick} variant="outline">
          <Plus className="mr-2 size-4" aria-hidden />
          Add your first address
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {addresses.map((addr) => (
        <AddressCard
          key={addr.id}
          address={addr}
          onEdit={onEditAddress}
        />
      ))}
    </div>
  );
}
