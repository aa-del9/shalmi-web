'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { XIcon } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@repo/ui/components/field';
import { Input } from '@repo/ui/components/input';
import { Spinner } from '@repo/ui/components/spinner';
import { cn } from '@repo/ui/lib/utils';
import {
  createVendorSchema,
  isE164,
  normalizePhoneToE164,
  updateVendorSchema,
  type CreateVendorInput,
  type UpdateVendorInput,
} from '../../schemas';
import { useVendorQuery } from '../../hooks/use-vendor-query';
import { useCreateVendorMutation } from '../../hooks/use-create-vendor-mutation';
import { useUpdateVendorMutation } from '../../hooks/use-update-vendor-mutation';
import { VendorAvatar } from '../vendor-avatar';

type VendorEditPanelProps = {
  selectedVendorId: string | null;
  isCreating: boolean;
  /** When true, render a condensed mobile field set (Q2 binding: subset). */
  variant?: 'desktop' | 'mobile';
  /** Hide empty state placeholder (mobile sheet uses a different empty surface). */
  hideEmptyState?: boolean;
  showCloseButton?: boolean;
  onClose: () => void;
  onCreated: (vendorId: string | null) => void;
  onRemove?: () => void;
};

type FormValues = {
  fullName: string;
  shopName: string;
  phoneNumber: string;
  email: string;
  marketHub: string;
  address: string;
  isActive: boolean;
  bankDetails: { bankName: string; accountTitle: string; iban: string };
};

const EMPTY_VALUES: FormValues = {
  fullName: '',
  shopName: '',
  phoneNumber: '',
  email: '',
  marketHub: '',
  address: '',
  isActive: true,
  bankDetails: { bankName: '', accountTitle: '', iban: '' },
};

export function VendorEditPanel({
  selectedVendorId,
  isCreating,
  variant = 'desktop',
  hideEmptyState = false,
  showCloseButton = true,
  onClose,
  onCreated,
  onRemove,
}: VendorEditPanelProps) {
  const isEditMode = selectedVendorId !== null;
  const isPanelActive = isCreating || isEditMode;

  const { data: vendor, isLoading: isLoadingVendor } = useVendorQuery(
    isEditMode ? selectedVendorId : null
  );
  const createMutation = useCreateVendorMutation();
  const updateMutation = useUpdateVendorMutation(selectedVendorId ?? '');

  const form = useForm<FormValues>({
    resolver: zodResolver(
      isEditMode ? updateVendorSchema : createVendorSchema
    ) as never,
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (isCreating) {
      form.reset(EMPTY_VALUES);
      return;
    }
    if (isEditMode && vendor) {
      form.reset({
        fullName: vendor.fullName ?? '',
        shopName: vendor.shopName,
        phoneNumber: vendor.phoneNumber ?? '',
        email: vendor.email ?? '',
        marketHub: vendor.marketHub,
        address: vendor.address ?? '',
        isActive: vendor.isActive,
        bankDetails: vendor.bankDetails,
      });
    }
  }, [isCreating, isEditMode, vendor, form]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isLoading = isEditMode && isLoadingVendor && !vendor;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditMode && selectedVendorId) {
        const payload: UpdateVendorInput = {
          fullName: values.fullName.trim() || undefined,
          shopName: values.shopName.trim() || undefined,
          phoneNumber: values.phoneNumber.trim() || undefined,
          email: values.email.trim() || '',
          marketHub: values.marketHub.trim() || undefined,
          address: values.address,
          isActive: values.isActive,
          bankDetails: values.bankDetails,
        };
        await updateMutation.mutateAsync(payload);
        toast.success('Vendor updated');
      } else {
        const payload: CreateVendorInput = {
          fullName: values.fullName.trim(),
          shopName: values.shopName.trim(),
          phoneNumber: values.phoneNumber.trim(),
          email: values.email.trim() || '',
          marketHub: values.marketHub.trim(),
          address: values.address,
          bankDetails: values.bankDetails,
        };
        const result = (await createMutation.mutateAsync(payload)) as {
          data?: { id?: string | null; displayId?: string | null };
        };
        const newId = result?.data?.id ?? null;
        const newDisplayId = result?.data?.displayId ?? null;
        toast.success(
          `Vendor created${newDisplayId ? ` · #${newDisplayId}` : ''}`
        );
        onCreated(newId);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save vendor');
    }
  });

  if (!isPanelActive) {
    if (hideEmptyState) return null;
    return (
      <aside className="border-rule text-ink-3 hidden h-full flex-col items-center justify-center gap-2 rounded-md border bg-white p-6 text-center text-sm md:flex">
        <p className="text-ink-2 font-semibold">Select a vendor to edit</p>
        <p>Pick a row from the list, or use Add vendor to create one.</p>
      </aside>
    );
  }

  const watchedFullName = form.watch('fullName');
  const watchedShopName = form.watch('shopName');
  const watchedIsActive = form.watch('isActive');
  const watchedPhone = form.watch('phoneNumber');
  const phonePreview = (() => {
    const raw = (watchedPhone ?? '').trim();
    if (!raw) return null;
    const parsed = normalizePhoneToE164(raw);
    if (!parsed) return null;
    if (parsed === raw && isE164(parsed)) return null;
    return parsed;
  })();
  const headerTitle = isCreating
    ? 'New vendor'
    : variant === 'mobile' && watchedFullName
      ? `Edit ${watchedFullName.split(' ')[0]}`
      : 'Edit vendor';
  const headerSubtitle =
    !isCreating && vendor
      ? `${vendor.fullName ?? vendor.shopName} · ${vendor.shopName} · #${vendor.displayId}`
      : 'Add a new vendor to your network';
  const submitLabel = isCreating ? 'Create vendor' : 'Save changes';
  const showFullEditor = variant === 'desktop';

  return (
    <aside className="border-rule flex h-full flex-col rounded-md border bg-white">
      <header className="border-rule bg-paper-2 flex items-start justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-start gap-3 min-w-0">
          <VendorAvatar
            fullName={watchedFullName || null}
            shopName={watchedShopName || 'New vendor'}
            logoUrl={vendor?.logoUrl ?? null}
            size="lg"
          />
          <div className="min-w-0">
            <h2 className="text-ink text-lg font-extrabold">{headerTitle}</h2>
            <p className="text-ink-3 truncate font-mono text-[11px] tracking-[0.04em]">
              {headerSubtitle}
            </p>
          </div>
        </div>
        {showCloseButton ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClose}
            aria-label="Close edit panel"
            className="size-8 shrink-0"
          >
            <XIcon className="size-4" />
          </Button>
        ) : null}
      </header>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5"
        >
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="vendor-fullName">Full name</FieldLabel>
              <FieldContent>
                <Input
                  id="vendor-fullName"
                  {...form.register('fullName')}
                  placeholder="e.g. Saleem Bhai"
                  disabled={isSaving}
                  aria-invalid={Boolean(form.formState.errors.fullName)}
                />
                <FieldError errors={[form.formState.errors.fullName]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="vendor-shopName">Shop name</FieldLabel>
              <FieldContent>
                <Input
                  id="vendor-shopName"
                  {...form.register('shopName')}
                  placeholder="e.g. Saleem Snacks Co."
                  disabled={isSaving}
                  aria-invalid={Boolean(form.formState.errors.shopName)}
                />
                <FieldError errors={[form.formState.errors.shopName]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <Field>
            <FieldLabel htmlFor="vendor-address">Address</FieldLabel>
            <FieldContent>
              <textarea
                id="vendor-address"
                {...form.register('address')}
                placeholder="Stall, market, city"
                disabled={isSaving}
                rows={3}
                className="border-rule-2 placeholder:text-ink-4 text-ink-2 min-h-20 w-full rounded-sm border-[1.5px] bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </FieldContent>
          </Field>

          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="vendor-phone">Phone number</FieldLabel>
              <FieldContent>
                <Input
                  id="vendor-phone"
                  {...form.register('phoneNumber')}
                  placeholder="+923000000000"
                  autoComplete="tel"
                  maxLength={16}
                  disabled={isSaving}
                  aria-invalid={Boolean(form.formState.errors.phoneNumber)}
                />
                {phonePreview && !form.formState.errors.phoneNumber ? (
                  <p
                    className="text-ink-3 mt-1 font-mono text-[11px] tracking-[0.04em]"
                    aria-live="polite"
                  >
                    Will save as{' '}
                    <span className="text-ink-2 font-bold">{phonePreview}</span>
                  </p>
                ) : null}
                <FieldError errors={[form.formState.errors.phoneNumber]} />
              </FieldContent>
            </Field>
            {showFullEditor ? (
              <Field>
                <FieldLabel htmlFor="vendor-email">Email</FieldLabel>
                <FieldContent>
                  <Input
                    id="vendor-email"
                    type="email"
                    {...form.register('email')}
                    placeholder="vendor@example.pk"
                    disabled={isSaving}
                    aria-invalid={Boolean(form.formState.errors.email)}
                  />
                  <FieldError errors={[form.formState.errors.email]} />
                </FieldContent>
              </Field>
            ) : null}
          </FieldGroup>

          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="vendor-marketHub">Bazaar</FieldLabel>
              <FieldContent>
                <Input
                  id="vendor-marketHub"
                  {...form.register('marketHub')}
                  placeholder="e.g. Sheedi Chowk Bazaar"
                  disabled={isSaving}
                  aria-invalid={Boolean(form.formState.errors.marketHub)}
                />
                <FieldError errors={[form.formState.errors.marketHub]} />
              </FieldContent>
            </Field>
            {showFullEditor && !isCreating && vendor ? (
              <Field>
                <FieldLabel htmlFor="vendor-display-id">Vendor ID</FieldLabel>
                <FieldContent>
                  <Input
                    id="vendor-display-id"
                    value={`#${vendor.displayId}`}
                    readOnly
                    className="bg-paper-2 text-ink-3 font-mono"
                  />
                </FieldContent>
              </Field>
            ) : null}
          </FieldGroup>

          <section className="bg-paper-2 border-rule-2 rounded-md border p-4">
            <h3 className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
              Status
            </h3>
            <p className="text-ink-2 mt-1 text-sm">
              Visible to buyers · receives orders
            </p>
            <div
              role="radiogroup"
              aria-label="Vendor status"
              className="border-rule-2 mt-3 inline-flex rounded-sm border bg-white p-1"
            >
              {[true, false].map((flag) => {
                const isSelected = watchedIsActive === flag;
                return (
                  <button
                    key={flag ? 'active' : 'inactive'}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isSaving}
                    onClick={() => form.setValue('isActive', flag)}
                    className={cn(
                      'inline-flex h-7 items-center rounded-[4px] px-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase transition-colors',
                      isSelected
                        ? 'bg-ink text-white'
                        : 'text-ink-3 hover:text-ink'
                    )}
                  >
                    {flag ? 'Active' : 'Inactive'}
                  </button>
                );
              })}
            </div>
          </section>

          {!isCreating && vendor ? (
            <section className="border-rule rounded-md border p-4">
              <h3 className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
                WhatsApp
              </h3>
              <p className="text-ink-2 mt-1 text-sm">
                {vendor.whatsappFirstSeenAt
                  ? `Active — last seen ${formatRelativeTime(
                      vendor.whatsappLastSeenAt ?? vendor.whatsappFirstSeenAt
                    )}`
                  : 'Never used'}
              </p>
            </section>
          ) : null}

          {showFullEditor ? (
            <section className="border-rule rounded-md border p-4">
              <h3 className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
                Bank details
              </h3>
              <p className="text-ink-3 mt-1 text-xs">
                Used for vendor weekly payouts.
              </p>
              <FieldGroup className="mt-3 grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="vendor-bankName">Bank name</FieldLabel>
                  <FieldContent>
                    <Input
                      id="vendor-bankName"
                      {...form.register('bankDetails.bankName')}
                      placeholder="Bank name"
                      disabled={isSaving}
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
                      disabled={isSaving}
                    />
                  </FieldContent>
                </Field>
                <Field className="md:col-span-2">
                  <FieldLabel htmlFor="vendor-iban">IBAN</FieldLabel>
                  <FieldContent>
                    <Input
                      id="vendor-iban"
                      {...form.register('bankDetails.iban')}
                      placeholder="PK00BANK0000000000000000"
                      disabled={isSaving}
                      className="font-mono"
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
            </section>
          ) : null}

          <footer className="border-rule mt-auto flex items-center justify-between gap-2 border-t pt-4">
            {!isCreating && onRemove ? (
              <Button
                type="button"
                variant="destructive"
                onClick={onRemove}
                disabled={isSaving}
              >
                Remove vendor
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-ink text-white hover:bg-ink/90"
              >
                {isSaving ? (
                  <>
                    <Spinner className="size-4" />
                    Saving…
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          </footer>
        </form>
      )}
    </aside>
  );
}

const RELATIVE_TIME_UNITS: ReadonlyArray<{
  unit: Intl.RelativeTimeFormatUnit;
  ms: number;
}> = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
  { unit: 'second', ms: 1000 },
];

function formatRelativeTime(iso: string): string {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return 'recently';
  const diffMs = target - Date.now();
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const { unit, ms } of RELATIVE_TIME_UNITS) {
    if (Math.abs(diffMs) >= ms || unit === 'second') {
      return formatter.format(Math.round(diffMs / ms), unit);
    }
  }
  return 'just now';
}
