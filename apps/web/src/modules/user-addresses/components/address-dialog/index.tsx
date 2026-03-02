'use client';

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

const defaultValues: CreateAddressInput = {
  title: '',
  recipientName: '',
  recipientPhone: '',
  address: '',
  city: '',
  isDefault: false,
};

type AddressDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddressDialog({ open, onOpenChange }: AddressDialogProps) {
  const createMutation = useCreateAddressMutation();

  const form = useForm<CreateAddressInput>({
    resolver: zodResolver(createAddressSchema),
    defaultValues,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await createMutation.mutateAsync({
      title: data.title,
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      address: data.address,
      city: data.city,
      isDefault: data.isDefault,
    });
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
          <DialogTitle>Add address</DialogTitle>
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
                  disabled={createMutation.isPending}
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
                  disabled={createMutation.isPending}
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
                  disabled={createMutation.isPending}
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
                  disabled={createMutation.isPending}
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
                  disabled={createMutation.isPending}
                  aria-invalid={Boolean(form.formState.errors.city)}
                />
                <FieldError errors={[form.formState.errors.city]} />
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
                  disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Spinner className="size-4" />
                  Adding…
                </>
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
