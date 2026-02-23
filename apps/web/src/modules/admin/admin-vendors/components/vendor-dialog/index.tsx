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
import { updateVendorSchema, type UpdateVendorInput } from '../../schemas';
import { useCreateVendorMutation } from '../../hooks/use-create-vendor-mutation';
import { useUpdateVendorMutation } from '../../hooks/use-update-vendor-mutation';
import { useVendorQuery } from '../../hooks/use-vendor-query';

const defaultValues: UpdateVendorInput = {
  phoneNumber: '',
  shopName: '',
  marketHub: '',
  isActive: true,
  bankDetails: {
    bankName: '',
    accountTitle: '',
    iban: '',
  },
};

type VendorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingVendorId: string | null;
};

export function VendorDialog({
  open,
  onOpenChange,
  editingVendorId,
}: VendorDialogProps) {
  const isEdit = Boolean(editingVendorId);
  const createMutation = useCreateVendorMutation();
  const updateMutation = useUpdateVendorMutation(editingVendorId ?? '');
  const { data: vendor, isLoading: isLoadingVendor } = useVendorQuery(
    open ? editingVendorId : null
  );

  const form = useForm<UpdateVendorInput>({
    resolver: zodResolver(updateVendorSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (editingVendorId && vendor) {
      form.reset({
        phoneNumber: vendor.phoneNumber ?? '',
        shopName: vendor.shopName,
        marketHub: vendor.marketHub,
        isActive: vendor.isActive,
        bankDetails: vendor.bankDetails,
      });
    } else if (!editingVendorId) {
      form.reset(defaultValues);
    }
  }, [open, editingVendorId, vendor, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (isEdit && editingVendorId) {
      await updateMutation.mutateAsync(data);
    } else {
      const { phoneNumber, shopName, marketHub, bankDetails } = data;
      await createMutation.mutateAsync({
        phoneNumber,
        shopName,
        marketHub,
        bankDetails,
      });
    }
    form.reset(defaultValues);
    onOpenChange(false);
  });

  const isPending =
    createMutation.isPending || updateMutation.isPending;
  const isLoading = isEdit && isLoadingVendor;

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset(defaultValues);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-8" />
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="vendor-phone">Phone number</FieldLabel>
                <FieldContent>
                  <Input
                    id="vendor-phone"
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
                <FieldLabel htmlFor="vendor-shopName">Shop name</FieldLabel>
                <FieldContent>
                  <Input
                    id="vendor-shopName"
                    {...form.register('shopName')}
                    placeholder="Shop name"
                    disabled={isPending}
                    aria-invalid={Boolean(form.formState.errors.shopName)}
                  />
                  <FieldError errors={[form.formState.errors.shopName]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="vendor-marketHub">Market hub</FieldLabel>
                <FieldContent>
                  <Input
                    id="vendor-marketHub"
                    {...form.register('marketHub')}
                    placeholder="Market hub"
                    disabled={isPending}
                    aria-invalid={Boolean(form.formState.errors.marketHub)}
                  />
                  <FieldError errors={[form.formState.errors.marketHub]} />
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="vendor-isActive"
                    checked={form.watch('isActive')}
                    onCheckedChange={(checked) =>
                      form.setValue('isActive', checked === true)
                    }
                    disabled={isPending}
                  />
                  <FieldLabel
                    htmlFor="vendor-isActive"
                    className="cursor-pointer font-normal"
                  >
                    Active
                  </FieldLabel>
                </div>
                <FieldContent>
                  <FieldError errors={[form.formState.errors.isActive]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="vendor-bankName">Bank name</FieldLabel>
                <FieldContent>
                  <Input
                    id="vendor-bankName"
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
                <FieldLabel htmlFor="vendor-accountTitle">
                  Account title
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="vendor-accountTitle"
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
                <FieldLabel htmlFor="vendor-iban">IBAN</FieldLabel>
                <FieldContent>
                  <Input
                    id="vendor-iban"
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
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner className="size-4" />
                    {isEdit ? 'Saving…' : 'Adding…'}
                  </>
                ) : isEdit ? (
                  'Save'
                ) : (
                  'Add Vendor'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
