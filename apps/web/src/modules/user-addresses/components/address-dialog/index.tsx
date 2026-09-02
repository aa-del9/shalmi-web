'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Checkbox } from '@repo/ui/components/checkbox';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@repo/ui/components/field';
import { Spinner } from '@repo/ui/components/spinner';
import { createAddressSchema, type CreateAddressInput } from '../../schemas';
import { useCreateAddressMutation } from '../../hooks/use-create-address-mutation';
import { useUpdateAddressMutation } from '../../hooks/use-update-address-mutation';
import type { Address } from '../../types';

const defaultValues: CreateAddressInput = {
  title: '',
  recipientName: '',
  recipientPhone: '',
  address: '',
  city: '',
  postalCode: undefined,
  province: undefined,
  isDefault: false,
};

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog runs in edit mode (PATCH); otherwise create. */
  address?: Address | null;
}

/**
 * Add / Edit address dialog (gap-analysis Q18 + Q19): re-uses the existing
 * dialog visual; switches between POST (create) and PATCH (edit) based on
 * whether `address` is supplied.
 */
export function AddressDialog({
  open,
  onOpenChange,
  address,
}: AddressDialogProps) {
  const createMutation = useCreateAddressMutation();
  const updateMutation = useUpdateAddressMutation();
  const editing = Boolean(address);
  const pending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<CreateAddressInput>({
    resolver: zodResolver(createAddressSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        address
          ? {
              title: address.title,
              recipientName: address.recipientName,
              recipientPhone: address.recipientPhone,
              address: address.address,
              city: address.city,
              postalCode: address.postalCode ?? undefined,
              province: address.province ?? undefined,
              isDefault: address.isDefault,
            }
          : defaultValues
      );
    }
  }, [open, address, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (address) {
      await updateMutation.mutateAsync({ id: address.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    form.reset(defaultValues);
    onOpenChange(false);
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset(defaultValues);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit address' : 'Add address'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="addr-title">Title</FieldLabel>
              <FieldContent>
                <Input
                  id="addr-title"
                  {...form.register('title')}
                  placeholder="e.g. Main Shop"
                  disabled={pending}
                  aria-invalid={Boolean(form.formState.errors.title)}
                />
                <FieldError errors={[form.formState.errors.title]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="addr-recipientName">
                Recipient name
              </FieldLabel>
              <FieldContent>
                <Input
                  id="addr-recipientName"
                  {...form.register('recipientName')}
                  placeholder="Full name"
                  disabled={pending}
                  aria-invalid={Boolean(
                    form.formState.errors.recipientName
                  )}
                />
                <FieldError
                  errors={[form.formState.errors.recipientName]}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="addr-recipientPhone">
                Recipient phone
              </FieldLabel>
              <FieldContent>
                <Input
                  id="addr-recipientPhone"
                  {...form.register('recipientPhone')}
                  placeholder="03XX-XXXXXXX"
                  autoComplete="tel"
                  disabled={pending}
                  aria-invalid={Boolean(
                    form.formState.errors.recipientPhone
                  )}
                />
                <FieldError
                  errors={[form.formState.errors.recipientPhone]}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="addr-address">Street address</FieldLabel>
              <FieldContent>
                <Input
                  id="addr-address"
                  {...form.register('address')}
                  placeholder="Full address"
                  disabled={pending}
                  aria-invalid={Boolean(form.formState.errors.address)}
                />
                <FieldError errors={[form.formState.errors.address]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="addr-city">City</FieldLabel>
              <FieldContent>
                <Input
                  id="addr-city"
                  {...form.register('city')}
                  placeholder="City"
                  disabled={pending}
                  aria-invalid={Boolean(form.formState.errors.city)}
                />
                <FieldError errors={[form.formState.errors.city]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="addr-postalCode">
                Postal code <span className="text-ink-3">(optional)</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="addr-postalCode"
                  {...form.register('postalCode')}
                  placeholder="52250"
                  autoComplete="postal-code"
                  disabled={pending}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="addr-province">
                Province <span className="text-ink-3">(optional)</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="addr-province"
                  {...form.register('province')}
                  placeholder="Punjab"
                  disabled={pending}
                />
              </FieldContent>
            </Field>
            <Field orientation="horizontal">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="addr-isDefault"
                  checked={form.watch('isDefault')}
                  onCheckedChange={(checked) =>
                    form.setValue('isDefault', checked === true)
                  }
                  disabled={pending}
                />
                <FieldLabel
                  htmlFor="addr-isDefault"
                  className="cursor-pointer font-normal"
                >
                  Set as default address
                </FieldLabel>
              </div>
              <FieldContent>
                <FieldError errors={[form.formState.errors.isDefault]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Spinner className="size-4" />
                  {editing ? 'Saving…' : 'Adding…'}
                </>
              ) : editing ? (
                'Save changes'
              ) : (
                'Add address'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
