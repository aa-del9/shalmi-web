'use client';

import { Trash2Icon } from 'lucide-react';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@repo/ui/components/field';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Spinner } from '@repo/ui/components/spinner';
import { ImageUpload } from '@/modules/common/components/image-upload';
import { ProductImageThumbnail } from '../../../components/product-image-thumbnail';
import { Checkbox } from '@repo/ui/components/checkbox';
import { useAddProductForm } from './use-add-product-form';
import { AddProductFormProps } from '../types';

/**
 * Vendor add-product form — pack-pricing edition.
 *
 * Note: this is a minimum-compatibility update for Batch 3 (which lands
 * the pack-pricing schema). The visual revamp of this form to match the
 * Pencil "PRICING / Bundle pricing" inline-form per `vendor-products`
 * gap-analysis is owned by Batch 4.
 */
export function AddProductForm({ productId }: AddProductFormProps = {}) {
  const {
    form,
    isEdit,
    isLoadingProduct,
    categoriesList,
    isPending,
    onSubmit,
    handleAddTier,
    fields,
    product,
    remove,
  } = useAddProductForm({ productId });

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

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <FieldGroup className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        <div className="space-y-6">
          <Field>
            <FieldLabel htmlFor="product-name">Product name</FieldLabel>
            <FieldContent>
              <Input
                id="product-name"
                {...form.register('name')}
                placeholder="e.g. Organic Honey 500g"
                disabled={isPending}
                aria-invalid={Boolean(form.formState.errors.name)}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </FieldContent>
          </Field>

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

          <Field>
            <FieldLabel htmlFor="product-stock">Stock (in packs)</FieldLabel>
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
                      <Trash2Icon className="size-4" />
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
    </form>
  );
}
