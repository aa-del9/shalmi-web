'use client';

import { Trash2Icon } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Spinner } from '@repo/ui/components/spinner';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@repo/ui/components/field';
import { Checkbox } from '@repo/ui/components/checkbox';
import { cn } from '@repo/ui/lib/utils';
import { ImageUpload } from '@/modules/common/components/image-upload';
import { ProductImageThumbnail } from '../../../components/product-image-thumbnail';
import { useAddProductForm } from './use-add-product-form';
import { AddProductFormProps } from '../types';

/**
 * Vendor add/edit product form — pack-pricing edition.
 *
 * Inline mode (used by the vendor-products screen): mounts inside the
 * single page; submits without navigating; renders Cancel + Save as
 * draft + Save product footer.
 *
 * Legacy mode (existing /vendor/products/new and /vendor/products/[id]/edit
 * routes): submits and navigates back to the products list. Q24 binding
 * answer is DEFERRED — these routes stay alive in this batch.
 */
export function AddProductForm({
  productId,
  inline,
  onCancel,
  onSaved,
}: AddProductFormProps = {}) {
  const {
    form,
    isEdit,
    isLoadingProduct,
    categoriesList,
    isPending,
    onSubmit,
    onSaveDraft,
    onSaveActive,
    handleAddTier,
    fields,
    product,
    remove,
  } = useAddProductForm({ productId, inline, onSaved });

  if (isEdit && isLoadingProduct) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (isEdit && productId && !product) {
    return (
      <p className="text-muted-foreground py-8 text-center">
        Product not found.
      </p>
    );
  }

  const status = form.watch('status') ?? 'active';

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <FieldGroup className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        <div className="space-y-6">
          <Field>
            <FieldLabel htmlFor="product-name">
              Product name{' '}
              <span className="text-red ml-1 font-mono text-[10px]">
                Required
              </span>
            </FieldLabel>
            <FieldContent>
              <Input
                id="product-name"
                {...form.register('name')}
                placeholder="e.g. Lays Family Pack · Carton of 30"
                disabled={isPending}
                aria-invalid={Boolean(form.formState.errors.name)}
              />
              <FieldError errors={[form.formState.errors.name]} />
              <p className="text-ink-3 mt-1 text-xs">
                Use the brand + variant + pack size. Buyers search this exact
                text.
              </p>
            </FieldContent>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="product-sku">SKU</FieldLabel>
              <FieldContent>
                <Input
                  id="product-sku"
                  placeholder="e.g. LFP-30"
                  value={form.watch('sku') ?? ''}
                  onChange={(e) =>
                    form.setValue(
                      'sku',
                      e.target.value === '' ? null : e.target.value,
                      { shouldValidate: true }
                    )
                  }
                  disabled={isPending}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="product-brand">Brand</FieldLabel>
              <FieldContent>
                <Input
                  id="product-brand"
                  placeholder="e.g. Lays"
                  value={form.watch('brand') ?? ''}
                  onChange={(e) =>
                    form.setValue(
                      'brand',
                      e.target.value === '' ? null : e.target.value,
                      { shouldValidate: true }
                    )
                  }
                  disabled={isPending}
                />
              </FieldContent>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="product-packSize">Pack size (units)</FieldLabel>
              <FieldContent>
                <Input
                  id="product-packSize"
                  type="number"
                  min={1}
                  {...form.register('packSize', { valueAsNumber: true })}
                  disabled={isPending}
                  aria-invalid={Boolean(form.formState.errors.packSize)}
                />
                <FieldError errors={[form.formState.errors.packSize]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="product-unitLabel">Pack noun</FieldLabel>
              <FieldContent>
                <Input
                  id="product-unitLabel"
                  placeholder="e.g. carton, pack, bag"
                  value={form.watch('unitLabel') ?? ''}
                  onChange={(e) =>
                    form.setValue(
                      'unitLabel',
                      e.target.value === '' ? null : e.target.value,
                      { shouldValidate: true }
                    )
                  }
                  disabled={isPending}
                />
              </FieldContent>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="product-packWeightGrams">
                Pack net weight (grams)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="product-packWeightGrams"
                  type="number"
                  min={1}
                  {...form.register('packWeightGrams', { valueAsNumber: true })}
                  disabled={isPending}
                  aria-invalid={Boolean(form.formState.errors.packWeightGrams)}
                />
                <FieldError errors={[form.formState.errors.packWeightGrams]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="product-unitWeightGrams">
                Per-unit weight (grams)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="product-unitWeightGrams"
                  type="number"
                  min={1}
                  value={form.watch('unitWeightGrams') ?? ''}
                  onChange={(e) =>
                    form.setValue(
                      'unitWeightGrams',
                      e.target.value === '' ? null : Number(e.target.value),
                      { shouldValidate: true }
                    )
                  }
                  disabled={isPending}
                />
              </FieldContent>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="product-mrp">MRP (cents)</FieldLabel>
              <FieldContent>
                <Input
                  id="product-mrp"
                  type="number"
                  min={1}
                  placeholder="Optional"
                  value={form.watch('packMrpCents') ?? ''}
                  onChange={(e) =>
                    form.setValue(
                      'packMrpCents',
                      e.target.value === '' ? null : Number(e.target.value),
                      { shouldValidate: true }
                    )
                  }
                  disabled={isPending}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="product-wholesale">
                Wholesale per pack (cents)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="product-wholesale"
                  type="number"
                  min={1}
                  {...form.register('packWholesalePriceCents', {
                    valueAsNumber: true,
                  })}
                  disabled={isPending}
                  aria-invalid={Boolean(
                    form.formState.errors.packWholesalePriceCents
                  )}
                />
                <FieldError
                  errors={[form.formState.errors.packWholesalePriceCents]}
                />
              </FieldContent>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="product-pricePerUnit">
              Price per unit (cents)
            </FieldLabel>
            <FieldContent>
              <Input
                id="product-pricePerUnit"
                type="number"
                min={1}
                placeholder="Optional caption value"
                value={form.watch('pricePerUnitCents') ?? ''}
                onChange={(e) =>
                  form.setValue(
                    'pricePerUnitCents',
                    e.target.value === '' ? null : Number(e.target.value),
                    { shouldValidate: true }
                  )
                }
                disabled={isPending}
              />
            </FieldContent>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="product-stock">Stock count</FieldLabel>
              <FieldContent>
                <Input
                  id="product-stock"
                  type="number"
                  min={0}
                  {...form.register('stock', { valueAsNumber: true })}
                  disabled={isPending}
                  aria-invalid={Boolean(form.formState.errors.stock)}
                />
                <FieldError errors={[form.formState.errors.stock]} />
                <p className="text-ink-3 mt-1 text-xs">cartons</p>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="product-lowStockThreshold">
                Low-stock alert
              </FieldLabel>
              <FieldContent>
                <Input
                  id="product-lowStockThreshold"
                  type="number"
                  min={0}
                  {...form.register('lowStockThreshold', {
                    valueAsNumber: true,
                  })}
                  disabled={isPending}
                />
                <p className="text-ink-3 mt-1 text-xs">alert at</p>
              </FieldContent>
            </Field>
          </div>

          {/* Visibility toggle (Q9 binding — light version, no
              pending_review). */}
          <Field>
            <FieldLabel>Visibility</FieldLabel>
            <FieldContent>
              <div className="border-rule inline-flex rounded-sm border bg-white p-1">
                <button
                  type="button"
                  onClick={() =>
                    form.setValue('status', 'active', { shouldValidate: true })
                  }
                  className={cn(
                    'rounded-sm px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.08em] uppercase transition-colors',
                    status === 'active'
                      ? 'bg-ink text-white'
                      : 'text-ink-2 hover:bg-paper-2'
                  )}
                  disabled={isPending}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() =>
                    form.setValue('status', 'draft', { shouldValidate: true })
                  }
                  className={cn(
                    'rounded-sm px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.08em] uppercase transition-colors',
                    status === 'draft'
                      ? 'bg-ink text-white'
                      : 'text-ink-2 hover:bg-paper-2'
                  )}
                  disabled={isPending}
                >
                  Draft
                </button>
              </div>
              <p className="text-ink-3 mt-1 text-xs">
                Drafts stay hidden until you mark them active.
              </p>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Categories</FieldLabel>
            <FieldContent>
              {categoriesList.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No categories available. Ask an admin to create categories.
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {categoriesList.map((cat) => {
                    const selectedIds = form.watch('categoryIds') ?? [];
                    const checked = selectedIds.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) => {
                            const current =
                              form.getValues('categoryIds') ?? [];
                            if (c === true) {
                              form.setValue(
                                'categoryIds',
                                [...current, cat.id],
                                {
                                  shouldValidate: true,
                                }
                              );
                            } else {
                              form.setValue(
                                'categoryIds',
                                current.filter((id) => id !== cat.id),
                                { shouldValidate: true }
                              );
                            }
                          }}
                          disabled={isPending}
                          aria-label={`Select ${cat.name}`}
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <FieldError errors={[form.formState.errors.categoryIds]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Product images</FieldLabel>
            <FieldContent>
              <ImageUpload
                multiple
                onUploaded={(result) => {
                  const current = form.getValues('images') ?? [];
                  form.setValue('images', [...current, result]);
                }}
                disabled={isPending}
                uploadUrl="/api/vendor/upload"
              />
              <FieldError errors={[form.formState.errors.images]} />
              {Array.isArray(form.watch('images')) &&
                form.watch('images').length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {form.watch('images').map((image, index) => (
                      <ProductImageThumbnail
                        key={`${image.url}-${index}`}
                        url={image.url}
                        blurHash={image.blurHash}
                        onRemove={() => {
                          const current = form.getValues('images') ?? [];
                          form.setValue(
                            'images',
                            current.filter((_, i) => i !== index)
                          );
                        }}
                        disabled={isPending}
                        alt={`Product image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
            </FieldContent>
          </Field>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Bundle pricing</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTier}
              disabled={isPending}
            >
              Add tier
            </Button>
          </div>

          <FieldError errors={[form.formState.errors.packTiers]} />

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-2 rounded-md border p-3"
              >
                <div className="flex flex-wrap items-end gap-2">
                  <Field className="min-w-[80px] flex-1">
                    <FieldLabel className="text-xs">Pack qty</FieldLabel>
                    <FieldContent>
                      <Input
                        type="number"
                        min={1}
                        {...form.register(`packTiers.${index}.packQty`, {
                          valueAsNumber: true,
                        })}
                        disabled={isPending}
                      />
                    </FieldContent>
                  </Field>
                  <Field className="min-w-[120px] flex-1">
                    <FieldLabel className="text-xs">
                      Per-pack price (cents)
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        type="number"
                        min={1}
                        {...form.register(
                          `packTiers.${index}.pricePerPackCents`,
                          {
                            valueAsNumber: true,
                          }
                        )}
                        disabled={isPending}
                      />
                    </FieldContent>
                  </Field>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={isPending}
                      aria-label="Remove tier"
                    >
                      <Trash2Icon className="size-4" aria-hidden />
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={
                        form.watch(`packTiers.${index}.badge`) === 'save'
                      }
                      onCheckedChange={(c) =>
                        form.setValue(
                          `packTiers.${index}.badge`,
                          c === true ? 'save' : null,
                          { shouldValidate: true }
                        )
                      }
                      disabled={isPending}
                    />
                    Show &ldquo;SAVE&rdquo; badge
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={
                        form.watch(`packTiers.${index}.badge`) === 'best'
                      }
                      onCheckedChange={(c) =>
                        form.setValue(
                          `packTiers.${index}.badge`,
                          c === true ? 'best' : null,
                          { shouldValidate: true }
                        )
                      }
                      disabled={isPending}
                    />
                    Show &ldquo;BEST&rdquo; badge
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={form.watch(`packTiers.${index}.isDefault`) === true}
                      onCheckedChange={(c) => {
                        const tiers = form.getValues('packTiers');
                        const updated = tiers.map((t, i) => ({
                          ...t,
                          isDefault: i === index ? c === true : false,
                        }));
                        form.setValue('packTiers', updated, {
                          shouldValidate: true,
                        });
                      }}
                      disabled={isPending}
                    />
                    Default tier on PDP
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FieldGroup>

      {inline ? (
        <div className="border-rule flex flex-col gap-3 rounded-md border bg-white p-4 md:flex-row md:items-center md:justify-end md:p-5">
          {/* Q23 binding: Cancel discards in-memory changes (explicit-save
              model — Q10 is DEFERRED so autosave is not wired). */}
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="md:order-1"
            >
              Cancel
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isPending}
            className="md:order-2"
          >
            Save as draft
          </Button>
          <Button
            type="button"
            onClick={onSaveActive}
            disabled={isPending}
            className="md:order-3"
          >
            {isPending ? (
              <>
                <Spinner className="size-4" />
                Saving…
              </>
            ) : (
              'Save product'
            )}
          </Button>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner className="size-4" />
                Saving…
              </>
            ) : isEdit ? (
              'Update product'
            ) : (
              'Create product'
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
