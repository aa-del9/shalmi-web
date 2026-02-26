'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { ImageUpload } from '@/modules/common/components/image-upload';
import { useBannerDialog } from './use-banner-dialog';
import { BannerDialogProps } from '../../types';

export function BannerDialog({ open, onOpenChange }: BannerDialogProps) {
  const { form, onSubmit, isPending, imageUrl, handleOpenChange } =
    useBannerDialog({
      onOpenChange,
    });
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add banner</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="banner-title">Title</FieldLabel>
              <FieldContent>
                <Input
                  id="banner-title"
                  {...form.register('title')}
                  placeholder="e.g. Summer Sale"
                  disabled={isPending}
                  aria-invalid={Boolean(form.formState.errors.title)}
                />
                <FieldError errors={[form.formState.errors.title]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="banner-targetUrl">
                Target URL (optional)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="banner-targetUrl"
                  {...form.register('targetUrl')}
                  placeholder="e.g. /categories/electronics"
                  disabled={isPending}
                  aria-invalid={Boolean(form.formState.errors.targetUrl)}
                />
                <FieldError errors={[form.formState.errors.targetUrl]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Image</FieldLabel>
              <FieldContent>
                {imageUrl && imageUrl !== '' ? (
                  <div className="space-y-2">
                    <div className="relative inline-block">
                      <Image
                        src={imageUrl}
                        alt="Banner"
                        width={240}
                        height={180}
                        className="aspect-740/320 w-full max-w-[240px] rounded-lg border object-cover md:aspect-1440/270"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute top-1 right-1"
                        onClick={() => form.setValue('imageUrl', '')}
                        disabled={isPending}
                      >
                        Clear
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Or upload a new image below to replace.
                    </p>
                  </div>
                ) : null}
                <ImageUpload
                  multiple={false}
                  uploadUrl="/api/admin/upload/promo-assets"
                  onUploaded={(result) => form.setValue('imageUrl', result.url)}
                  disabled={isPending}
                />
                <FieldError errors={[form.formState.errors.imageUrl]} />
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
                  <Spinner className="mr-2 size-4" />
                  Adding…
                </>
              ) : (
                'Add banner'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
