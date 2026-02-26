'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '../../schemas';
import { useCreateCategoryMutation } from '../../hooks/use-create-category-mutation';
import { useUpdateCategoryMutation } from '../../hooks/use-update-category-mutation';
import { useCategoryQuery } from '../../hooks/use-category-query';
import { ImageUpload } from '@/modules/common/components/image-upload';

const defaultValues: CreateCategoryInput = {
  name: '',
  imageUrl: '',
};

type CategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategoryId: string | null;
};

export function CategoryDialog({
  open,
  onOpenChange,
  editingCategoryId,
}: CategoryDialogProps) {
  const isEdit = Boolean(editingCategoryId);
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation(editingCategoryId ?? '');
  const { data: category, isLoading: isLoadingCategory } = useCategoryQuery(
    open ? editingCategoryId : null
  );

  const form = useForm<CreateCategoryInput | UpdateCategoryInput>({
    resolver: zodResolver(
      isEdit ? updateCategorySchema : createCategorySchema
    ),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (editingCategoryId && category) {
      form.reset({
        name: category.name,
        imageUrl: category.imageUrl ?? '',
      });
    } else if (!editingCategoryId) {
      form.reset(defaultValues);
    }
  }, [open, editingCategoryId, category, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    const name = data.name ?? '';
    const imageUrl =
      data.imageUrl && data.imageUrl !== '' ? data.imageUrl : undefined;
    if (isEdit && editingCategoryId) {
      await updateMutation.mutateAsync({ name, imageUrl });
      toast.success('Category updated successfully.');
    } else {
      await createMutation.mutateAsync({ name, imageUrl });
      toast.success('Category created successfully.');
    }
    form.reset(defaultValues);
    onOpenChange(false);
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isLoading = isEdit && isLoadingCategory;
  const imageUrl = form.watch('imageUrl');

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset(defaultValues);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-8" />
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="category-name">Name</FieldLabel>
                <FieldContent>
                  <Input
                    id="category-name"
                    {...form.register('name')}
                    placeholder="Category name"
                    disabled={isPending}
                    aria-invalid={Boolean(form.formState.errors.name)}
                  />
                  <FieldError errors={[form.formState.errors.name]} />
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
                          alt="Category"
                          width={120}
                          height={120}
                          className="rounded-lg border object-cover"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute right-1 top-1"
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
                    uploadUrl="/api/admin/upload/categories"
                    onUploaded={(result) =>
                      form.setValue('imageUrl', result.url)
                    }
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
                    <Spinner className="size-4" />
                    {isEdit ? 'Saving…' : 'Adding…'}
                  </>
                ) : isEdit ? (
                  'Save'
                ) : (
                  'Add Category'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
