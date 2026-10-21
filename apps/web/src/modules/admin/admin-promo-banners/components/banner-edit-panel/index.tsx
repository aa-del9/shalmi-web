'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  CopyIcon,
  EyeIcon,
  ImageUpIcon,
  XIcon,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@repo/ui/components/button';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@repo/ui/components/field';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Spinner } from '@repo/ui/components/spinner';
import { cn } from '@repo/ui/lib/utils';
import { ImageUpload } from '@/modules/common/components/image-upload';
import {
  createBannerSchema,
  updateBannerSchema,
  type CreateBannerInput,
  type UpdateBannerInput,
} from '../../schemas';
import { useCreateBannerMutation } from '../../hooks/use-create-banner-mutation';
import { useUpdateBannerMutation } from '../../hooks/use-update-banner-mutation';
import { useDuplicateBannerMutation } from '../../hooks/use-duplicate-banner-mutation';
import type { Banner } from '../../types';

type BannerEditPanelProps = {
  selectedBanner: Banner | null;
  isCreating: boolean;
  showCloseButton?: boolean;
  hideEmptyState?: boolean;
  onClose: () => void;
  onCreated: (bannerId: string | null) => void;
  onRemove?: () => void;
};

type FormValues = {
  title: string;
  internalName: string;
  eyebrow: string;
  ctaLabel: string;
  imageUrl: string;
  targetUrl: string;
  position: 'hero' | 'promo_top' | 'strip' | 'sidebar';
  status: 'live' | 'paused';
  startsAt: string;
  endsAt: string;
  displayOrder: number;
};

const EMPTY_VALUES: FormValues = {
  title: '',
  internalName: '',
  eyebrow: '',
  ctaLabel: '',
  imageUrl: '',
  targetUrl: '',
  position: 'hero',
  status: 'paused',
  startsAt: '',
  endsAt: '',
  displayOrder: 0,
};

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function fromDateInput(value: string): string {
  if (!value) return '';
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
}

function filenameFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.split('/').filter(Boolean);
    return path[path.length - 1] ?? null;
  } catch {
    return url.split('/').pop() ?? null;
  }
}

export function BannerEditPanel({
  selectedBanner,
  isCreating,
  showCloseButton = true,
  hideEmptyState = false,
  onClose,
  onCreated,
  onRemove,
}: BannerEditPanelProps) {
  const isEditMode = selectedBanner !== null;
  const isPanelActive = isCreating || isEditMode;
  const createMutation = useCreateBannerMutation();
  const updateMutation = useUpdateBannerMutation(selectedBanner?.id ?? '');
  const duplicateMutation = useDuplicateBannerMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(
      isEditMode ? updateBannerSchema : createBannerSchema
    ) as never,
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (isCreating) {
      form.reset(EMPTY_VALUES);
      return;
    }
    if (isEditMode && selectedBanner) {
      form.reset({
        title: selectedBanner.title,
        internalName: selectedBanner.internalName ?? '',
        eyebrow: selectedBanner.eyebrow ?? '',
        ctaLabel: selectedBanner.ctaLabel ?? '',
        imageUrl: selectedBanner.imageUrl,
        targetUrl: selectedBanner.targetUrl ?? '',
        position: selectedBanner.position,
        status: selectedBanner.status,
        startsAt: toDateInput(selectedBanner.startsAt),
        endsAt: toDateInput(selectedBanner.endsAt),
        displayOrder: selectedBanner.displayOrder,
      });
    }
  }, [isCreating, isEditMode, selectedBanner, form]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const watchedImageUrl = form.watch('imageUrl');
  const watchedStatus = form.watch('status');
  const watchedTitle = form.watch('title');

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (isEditMode && selectedBanner) {
        const payload: UpdateBannerInput = {
          title: values.title,
          internalName: values.internalName,
          eyebrow: values.eyebrow,
          ctaLabel: values.ctaLabel,
          imageUrl: values.imageUrl,
          targetUrl: values.targetUrl,
          position: values.position,
          status: values.status,
          startsAt: fromDateInput(values.startsAt),
          endsAt: fromDateInput(values.endsAt),
          displayOrder: values.displayOrder,
        };
        await updateMutation.mutateAsync(payload);
        toast.success('Banner updated');
      } else {
        const payload: CreateBannerInput = {
          title: values.title,
          internalName: values.internalName,
          eyebrow: values.eyebrow,
          ctaLabel: values.ctaLabel,
          imageUrl: values.imageUrl,
          targetUrl: values.targetUrl,
          position: values.position,
          status: values.status,
          startsAt: fromDateInput(values.startsAt),
          endsAt: fromDateInput(values.endsAt),
          displayOrder: values.displayOrder,
        };
        const result = await createMutation.mutateAsync(payload);
        toast.success('Banner created');
        const newId = (result as Banner | undefined)?.id ?? null;
        onCreated(newId);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to save banner'
      );
    }
  });

  const handlePreview = () => {
    if (!selectedBanner) return;
    const url = `/?previewBannerId=${encodeURIComponent(selectedBanner.id)}`;
    window.open(url, '_blank');
  };

  const handleDuplicate = async () => {
    if (!selectedBanner) return;
    try {
      const next = await duplicateMutation.mutateAsync(selectedBanner.id);
      toast.success('Banner duplicated');
      onCreated(next.id);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to duplicate banner'
      );
    }
  };

  if (!isPanelActive) {
    if (hideEmptyState) return null;
    return (
      <aside className="border-rule text-ink-3 hidden h-full flex-col items-center justify-center gap-2 rounded-md border bg-white p-6 text-center text-sm md:flex">
        <p className="text-ink-2 font-semibold">Select a banner to edit</p>
        <p>Pick a card from the grid, or use New banner to create one.</p>
      </aside>
    );
  }

  const headerTitle = isCreating ? 'New banner' : 'Edit banner';
  const headerSubtitle = !isCreating && selectedBanner
    ? `${selectedBanner.position.replace('_', ' ')} · ${selectedBanner.internalName ?? selectedBanner.title}`
    : 'Add a new banner';
  const submitLabel = isCreating ? 'Create banner' : 'Save changes';
  const filename = filenameFromUrl(watchedImageUrl);

  return (
    <aside className="border-rule flex h-full flex-col rounded-md border bg-white">
      <header className="border-rule bg-paper-2 flex items-start justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-ink text-lg font-extrabold">{headerTitle}</h2>
          <p className="text-ink-3 truncate font-mono text-[11px] uppercase tracking-[0.04em]">
            {headerSubtitle}
          </p>
        </div>
        {showCloseButton ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClose}
            aria-label="Close edit panel"
            className="size-8"
          >
            <XIcon className="size-4" />
          </Button>
        ) : null}
      </header>

      <form
        onSubmit={onSubmit}
        className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5"
      >
        <section className="bg-paper-2 border-rule-2 rounded-md border p-4">
          <div className="flex items-center gap-3">
            <ImageUpIcon className="text-ink-3 size-7" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
                Banner image
              </p>
              <p className="text-ink-2 text-sm font-semibold">
                {filename ?? 'Upload banner image'}
              </p>
              <p className="text-ink-3 text-xs">
                PNG, JPG, WebP · 1920×720 recommended
              </p>
            </div>
          </div>
          {watchedImageUrl ? (
            <div className="mt-3 overflow-hidden rounded-md border-rule border">
              <Image
                src={watchedImageUrl}
                alt=""
                width={640}
                height={280}
                className="h-32 w-full object-cover"
              />
            </div>
          ) : null}
          <div className="mt-3">
            <ImageUpload
              multiple={false}
              uploadUrl="/api/admin/upload/promo-assets"
              onUploaded={(result) => form.setValue('imageUrl', result.url)}
              disabled={isSaving}
            />
          </div>
          <FieldError errors={[form.formState.errors.imageUrl]} />
        </section>

        <FieldGroup className="grid gap-4">
          <Field>
            <FieldLabel htmlFor="banner-title">Title</FieldLabel>
            <FieldContent>
              <Input
                id="banner-title"
                {...form.register('title')}
                placeholder="Restock smarter, save more"
                disabled={isSaving}
                aria-invalid={Boolean(form.formState.errors.title)}
              />
              <FieldError errors={[form.formState.errors.title]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="banner-eyebrow">Eyebrow / kicker</FieldLabel>
            <FieldContent>
              <Input
                id="banner-eyebrow"
                {...form.register('eyebrow')}
                placeholder="Bulk wholesale · 25 bazaars"
                disabled={isSaving}
              />
            </FieldContent>
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="banner-position">Position</FieldLabel>
              <FieldContent>
                <Select
                  value={form.watch('position')}
                  onValueChange={(next) =>
                    form.setValue('position', next as FormValues['position'])
                  }
                >
                  <SelectTrigger id="banner-position" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero (1920×720)</SelectItem>
                    <SelectItem value="promo_top">Promo top (1920×400)</SelectItem>
                    <SelectItem value="strip">Strip (1920×56)</SelectItem>
                    <SelectItem value="sidebar">Sidebar (480×600)</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="banner-cta">CTA label</FieldLabel>
              <FieldContent>
                <Input
                  id="banner-cta"
                  {...form.register('ctaLabel')}
                  placeholder="Shop now"
                  disabled={isSaving}
                />
              </FieldContent>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="banner-target">Link URL</FieldLabel>
            <FieldContent>
              <Input
                id="banner-target"
                {...form.register('targetUrl')}
                placeholder="/c/today-lowest"
                disabled={isSaving}
                className="font-mono"
              />
              <FieldError errors={[form.formState.errors.targetUrl]} />
            </FieldContent>
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="banner-startsAt">Start date</FieldLabel>
              <FieldContent>
                <Input
                  id="banner-startsAt"
                  type="date"
                  {...form.register('startsAt')}
                  disabled={isSaving}
                  className="font-mono"
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="banner-endsAt">End date</FieldLabel>
              <FieldContent>
                <Input
                  id="banner-endsAt"
                  type="date"
                  {...form.register('endsAt')}
                  disabled={isSaving}
                  className="font-mono"
                />
              </FieldContent>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="banner-display-order">Sort order</FieldLabel>
            <FieldContent>
              <Input
                id="banner-display-order"
                type="number"
                min={0}
                {...form.register('displayOrder', { valueAsNumber: true })}
                disabled={isSaving}
                className="font-mono"
              />
            </FieldContent>
          </Field>
        </FieldGroup>

        <section className="bg-paper-2 border-rule-2 rounded-md border p-4">
          <h3 className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
            Status
          </h3>
          <p className="text-ink-3 mt-1 text-xs">
            Live banners auto-pause when the end date passes.
          </p>
          <div
            role="radiogroup"
            aria-label="Banner status"
            className="border-rule-2 mt-3 inline-flex rounded-sm border bg-white p-1"
          >
            {(['live', 'paused'] as const).map((flag) => {
              const isSelected = watchedStatus === flag;
              return (
                <button
                  key={flag}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isSaving}
                  onClick={() => form.setValue('status', flag)}
                  className={cn(
                    'inline-flex h-7 items-center rounded-[4px] px-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase transition-colors',
                    isSelected ? 'bg-ink text-white' : 'text-ink-3 hover:text-ink'
                  )}
                >
                  {flag}
                </button>
              );
            })}
          </div>
        </section>

        <footer className="border-rule mt-auto flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          {!isCreating && onRemove ? (
            <Button
              type="button"
              variant="destructive"
              onClick={onRemove}
              disabled={isSaving}
            >
              Remove banner
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!isCreating && selectedBanner ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDuplicate}
                  disabled={isSaving || duplicateMutation.isPending}
                >
                  <CopyIcon className="size-4" /> Duplicate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  disabled={isSaving}
                >
                  <EyeIcon className="size-4" /> Preview
                </Button>
              </>
            ) : null}
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
                  <Spinner className="size-4" /> Saving…
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </footer>
        {watchedTitle ? null : null}
      </form>
    </aside>
  );
}
