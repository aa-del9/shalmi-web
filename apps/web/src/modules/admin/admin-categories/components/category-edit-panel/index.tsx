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
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '../../schemas';
import { useCategoryQuery } from '../../hooks/use-category-query';
import { useCreateCategoryMutation } from '../../hooks/use-create-category-mutation';
import { useUpdateCategoryMutation } from '../../hooks/use-update-category-mutation';
import { CategoryIconPicker } from '../category-icon-picker';

type CategoryEditPanelProps = {
  /** null when "Add category" is in flight; string when editing. */
  selectedCategoryId: string | null;
  /** True when the panel is in create mode (Q4: same panel, empty state). */
  isCreating: boolean;
  onClose: () => void;
  onCreated: () => void;
  /** Render the panel header close button. Hidden on mobile (Sheet has its own). */
  showCloseButton?: boolean;
  /** Hide the empty state hero — used by mobile Sheet to keep height predictable. */
  hideEmptyState?: boolean;
};

type FormValues = {
  name: string;
  iconKey: string;
  isActive: boolean;
};

const EMPTY_VALUES: FormValues = {
  name: '',
  iconKey: '',
  isActive: true,
};

export function CategoryEditPanel({
  selectedCategoryId,
  isCreating,
  onClose,
  onCreated,
  showCloseButton = true,
  hideEmptyState = false,
}: CategoryEditPanelProps) {
  const isEditMode = selectedCategoryId !== null;
  const isPanelActive = isCreating || isEditMode;

  const { data: category, isLoading: isLoadingCategory } = useCategoryQuery(
    isEditMode ? selectedCategoryId : null
  );
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation(selectedCategoryId ?? '');

  const form = useForm<FormValues>({
    resolver: zodResolver(
      isEditMode ? updateCategorySchema : createCategorySchema
    ) as never,
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (isCreating) {
      form.reset(EMPTY_VALUES);
      return;
    }
    if (isEditMode && category) {
      form.reset({
        name: category.name,
        iconKey: category.iconKey ?? '',
        isActive: category.isActive,
      });
    }
  }, [isCreating, isEditMode, category, form]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isLoading = isEditMode && isLoadingCategory && !category;

  const onSubmit = form.handleSubmit(async (values) => {
    const trimmedName = values.name.trim();
    if (trimmedName.length === 0) {
      form.setError('name', { message: 'Name is required' });
      return;
    }
    const iconKey = values.iconKey === '' ? undefined : values.iconKey;
    try {
      if (isEditMode && selectedCategoryId) {
        const payload: UpdateCategoryInput = {
          ...(trimmedName !== category?.name ? { name: trimmedName } : {}),
          iconKey: iconKey ?? '',
          isActive: values.isActive,
        };
        await updateMutation.mutateAsync(payload);
        toast.success('Category updated');
      } else {
        const payload: CreateCategoryInput = {
          name: trimmedName,
          iconKey: iconKey ?? '',
          isActive: values.isActive,
        };
        await createMutation.mutateAsync(payload);
        toast.success('Category created');
        onCreated();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to save category'
      );
    }
  });

  if (!isPanelActive) {
    if (hideEmptyState) return null;
    return (
      <aside className="border-rule text-ink-3 hidden h-full flex-col items-center justify-center gap-2 rounded-md border bg-white p-6 text-center text-sm md:flex">
        <p className="text-ink-2 font-semibold">No category selected</p>
        <p>Pick a row to edit, or use Add category to create one.</p>
      </aside>
    );
  }

  const headerTitle = isCreating ? 'New category' : 'Edit category';
  const headerSubtitle =
    !isCreating && category ? category.slug : 'Add a new product group';
  const submitLabel = isCreating ? 'Create category' : 'Save changes';
  const slugPreview =
    !isCreating && category ? category.slug : 'auto-generated from name';
  const watchedIconKey = form.watch('iconKey');
  const watchedIsActive = form.watch('isActive');

  return (
    <aside className="border-rule flex h-full flex-col rounded-md border bg-white">
      <header className="border-rule flex items-start justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-ink text-lg font-extrabold">{headerTitle}</h2>
          <p className="text-ink-3 truncate font-mono text-[11px] tracking-[0.04em]">
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

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5"
        >
          <CategoryIconPicker
            value={watchedIconKey === '' ? null : watchedIconKey}
            onChange={(next) => form.setValue('iconKey', next ?? '')}
            disabled={isSaving}
          />

          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="category-name">Display name</FieldLabel>
              <FieldContent>
                <Input
                  id="category-name"
                  {...form.register('name')}
                  placeholder="e.g. Drinks"
                  disabled={isSaving}
                  aria-invalid={Boolean(form.formState.errors.name)}
                  autoFocus={isCreating}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="category-slug">Slug</FieldLabel>
              <FieldContent>
                <Input
                  id="category-slug"
                  value={slugPreview}
                  readOnly
                  className="bg-paper-2 text-ink-3 font-mono"
                  aria-describedby="category-slug-hint"
                />
                <p
                  id="category-slug-hint"
                  className="text-ink-3 font-mono text-[11px] tracking-[0.04em]"
                >
                  shalmi.pk/c/
                  {!isCreating && category ? category.slug : '<auto>'}
                </p>
              </FieldContent>
            </Field>
          </FieldGroup>

          <section className="bg-paper-2 border-rule-2 rounded-md border p-4">
            <h3 className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
              Status
            </h3>
            <p className="text-ink-2 mt-1 text-sm">
              Visible to buyers in storefront
            </p>
            <div
              role="radiogroup"
              aria-label="Category status"
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

          <footer className="border-rule mt-auto flex items-center justify-end gap-2 border-t pt-4">
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
          </footer>
        </form>
      )}
    </aside>
  );
}
