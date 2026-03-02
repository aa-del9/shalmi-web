'use client';

import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';
import { Plus } from 'lucide-react';
import { AddressCard } from '../address-card';
import type { Address } from '../../types';

type AddressesListProps = {
  addresses: Address[] | undefined;
  isLoading: boolean;
  onAddClick: () => void;
};

export function AddressesList({
  addresses,
  isLoading,
  onAddClick,
}: AddressesListProps) {
  if (isLoading) {
    return null;
  }

  if (!addresses?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-2">
            You don&apos;t have any saved addresses yet.
          </p>
          <Button onClick={onAddClick} variant="outline">
            <Plus className="mr-2 size-4" />
            Add your first address
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <AddressCard key={addr.id} address={addr} />
      ))}
    </div>
  );
}
