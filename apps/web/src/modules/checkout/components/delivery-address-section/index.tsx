'use client';

import Link from 'next/link';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Card, CardContent } from '@repo/ui/components/card';
import { MapPin } from 'lucide-react';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { useAddressesQuery } from '@/modules/user-addresses/hooks/use-addresses-query';
import type { Address } from '@/modules/user-addresses/types';
import type { CheckoutShippingFormData } from '../../schemas';

type DeliveryAddressSectionProps = {
  /** When using a saved address */
  selectedAddressId: string | null;
  onSelectAddress: (id: string | null) => void;
  /** When true, show manual form instead of saved addresses */
  useDifferentAddress: boolean;
  onUseDifferentAddress: (value: boolean) => void;
  /** React Hook Form instance for manual shipping (controlled by parent for submit) */
  shippingForm: UseFormReturn<CheckoutShippingFormData>;
};

export function DeliveryAddressSection({
  selectedAddressId,
  onSelectAddress,
  useDifferentAddress,
  onUseDifferentAddress,
  shippingForm,
}: DeliveryAddressSectionProps) {
  const { data: addressesList, isLoading: addressesLoading } =
    useAddressesQuery();
  const hasSavedAddresses = (addressesList?.length ?? 0) > 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-5" />
            <h2 className="text-lg font-semibold">Delivery Address</h2>
          </div>
          <Link
            href={ABSOLUTE_ROUTES.PROFILE_ADDRESSES}
            className="text-muted-foreground hover:text-foreground text-sm underline"
          >
            Manage addresses
          </Link>
        </div>

        {addressesLoading ? (
          <div className="flex items-center justify-center py-6">
            <span className="text-muted-foreground text-sm">
              Loading addresses…
            </span>
          </div>
        ) : hasSavedAddresses && !useDifferentAddress ? (
          <div className="space-y-3">
            {addressesList?.map((addr: Address) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => onSelectAddress(addr.id)}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  selectedAddressId === addr.id
                    ? 'border-primary bg-primary/5 ring-primary ring-1'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{addr.title}</span>
                  {addr.isDefault && (
                    <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-medium">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {addr.recipientName} · {addr.recipientPhone}
                </p>
                <p className="mt-1 text-sm">
                  {addr.address}, {addr.city}
                </p>
              </button>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                onUseDifferentAddress(true);
                onSelectAddress(null);
              }}
            >
              Use a different address
            </Button>
          </div>
        ) : (
          <>
            {hasSavedAddresses && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mb-4"
                onClick={() => {
                  onUseDifferentAddress(false);
                  const defaultAddr =
                    addressesList?.find((a: Address) => a.isDefault) ??
                    addressesList?.[0];
                  if (defaultAddr) onSelectAddress(defaultAddr.id);
                }}
              >
                ← Choose a saved address
              </Button>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="checkout-name">Full Name</Label>
                <Input
                  id="checkout-name"
                  {...shippingForm.register('name')}
                  placeholder="Enter your full name"
                  aria-invalid={Boolean(shippingForm.formState.errors.name)}
                />
                {shippingForm.formState.errors.name && (
                  <p className="text-destructive text-sm">
                    {shippingForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-phone">Phone Number</Label>
                <Input
                  id="checkout-phone"
                  {...shippingForm.register('phone')}
                  placeholder="03XX-XXXXXXX"
                  aria-invalid={Boolean(shippingForm.formState.errors.phone)}
                />
                {shippingForm.formState.errors.phone && (
                  <p className="text-destructive text-sm">
                    {shippingForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="checkout-address">Street Address</Label>
                <Input
                  id="checkout-address"
                  {...shippingForm.register('address')}
                  placeholder="Enter your full address"
                  aria-invalid={Boolean(shippingForm.formState.errors.address)}
                />
                {shippingForm.formState.errors.address && (
                  <p className="text-destructive text-sm">
                    {shippingForm.formState.errors.address.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-city">City</Label>
                <Input
                  id="checkout-city"
                  {...shippingForm.register('city')}
                  placeholder="City"
                  aria-invalid={Boolean(shippingForm.formState.errors.city)}
                />
                {shippingForm.formState.errors.city && (
                  <p className="text-destructive text-sm">
                    {shippingForm.formState.errors.city.message}
                  </p>
                )}
              </div>
            </div>
            {hasSavedAddresses && (
              <p className="text-muted-foreground mt-2 text-sm">
                <Link
                  href={ABSOLUTE_ROUTES.PROFILE_ADDRESSES}
                  className="underline"
                >
                  Save addresses for next time
                </Link>
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
