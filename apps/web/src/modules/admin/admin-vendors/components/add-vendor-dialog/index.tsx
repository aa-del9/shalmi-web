'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@repo/ui/components/field';
import { Spinner } from '@repo/ui/components/spinner';
import { createVendorSchema, type CreateVendorInput } from '../../schemas';
import { useCreateVendorMutation } from '../../hooks/use-create-vendor-mutation';

const defaultValues: CreateVendorInput = {
  phoneNumber: '',
  shopName: '',
  marketHub: '',
  bankDetails: {
    bankName: '',
    accountTitle: '',
    iban: '',
  },
};

export function AddVendorDialog() {
  const [open, setOpen] = useState(false);
  const mutation = useCreateVendorMutation();

  const form = useForm<CreateVendorInput>({
    resolver: zodResolver(createVendorSchema),
    defaultValues,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await mutation.mutateAsync(data);
    form.reset(defaultValues);
    setOpen(false);
  });

  const isPending = mutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          form.reset(defaultValues);
        }
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button">Add Vendor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vendor</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="add-vendor-phone">Phone number</FieldLabel>
              <FieldContent>
                <Input
                  id="add-vendor-phone"
                  {...form.register('phoneNumber')}
                  placeholder="+923000000000"
                  autoComplete="tel"
                  maxLength={13}
                  disabled={isPending}
                  aria-invalid={Boolean(form.formState.errors.phoneNumber)}
                />
                <FieldError errors={[form.formState.errors.phoneNumber]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="add-vendor-shopName">Shop name</FieldLabel>
              <FieldContent>
                <Input
                  id="add-vendor-shopName"
                  {...form.register('shopName')}
                  placeholder="Shop name"
                  disabled={isPending}
                  aria-invalid={Boolean(form.formState.errors.shopName)}
                />
                <FieldError errors={[form.formState.errors.shopName]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="add-vendor-marketHub">Market hub</FieldLabel>
              <FieldContent>
                <Input
                  id="add-vendor-marketHub"
                  {...form.register('marketHub')}
                  placeholder="Market hub"
                  disabled={isPending}
                  aria-invalid={Boolean(form.formState.errors.marketHub)}
                />
                <FieldError errors={[form.formState.errors.marketHub]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="add-vendor-bankName">Bank name</FieldLabel>
              <FieldContent>
                <Input
                  id="add-vendor-bankName"
                  {...form.register('bankDetails.bankName')}
                  placeholder="Bank name"
                  disabled={isPending}
                  aria-invalid={Boolean(
                    form.formState.errors.bankDetails?.bankName
                  )}
                />
                <FieldError
                  errors={[form.formState.errors.bankDetails?.bankName]}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="add-vendor-accountTitle">
                Account title
              </FieldLabel>
              <FieldContent>
                <Input
                  id="add-vendor-accountTitle"
                  {...form.register('bankDetails.accountTitle')}
                  placeholder="Account title"
                  disabled={isPending}
                  aria-invalid={Boolean(
                    form.formState.errors.bankDetails?.accountTitle
                  )}
                />
                <FieldError
                  errors={[form.formState.errors.bankDetails?.accountTitle]}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="add-vendor-iban">IBAN</FieldLabel>
              <FieldContent>
                <Input
                  id="add-vendor-iban"
                  {...form.register('bankDetails.iban')}
                  placeholder="IBAN"
                  disabled={isPending}
                  aria-invalid={Boolean(
                    form.formState.errors.bankDetails?.iban
                  )}
                />
                <FieldError
                  errors={[form.formState.errors.bankDetails?.iban]}
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  Adding…
                </>
              ) : (
                'Add Vendor'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
