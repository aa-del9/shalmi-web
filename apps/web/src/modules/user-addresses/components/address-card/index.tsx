'use client';

import { Card, CardContent } from '@repo/ui/components/card';
import type { Address } from '../../types';

type AddressCardProps = {
  address: Address;
};

export function AddressCard({ address }: AddressCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{address.title}</span>
              {address.isDefault && (
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Default
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {address.recipientName} · {address.recipientPhone}
            </p>
            <p className="mt-1 text-sm">
              {address.address}, {address.city}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
