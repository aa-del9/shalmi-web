'use client';

import { Button } from '@repo/ui/components/button';
import { MapPin, Plus } from 'lucide-react';

type AddressesPageHeaderProps = {
  onAddClick: () => void;
};

export function AddressesPageHeader({ onAddClick }: AddressesPageHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MapPin className="size-5" />
        <h1 className="text-2xl font-bold tracking-tight">
          Saved Addresses
        </h1>
      </div>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 size-4" />
        Add address
      </Button>
    </div>
  );
}
