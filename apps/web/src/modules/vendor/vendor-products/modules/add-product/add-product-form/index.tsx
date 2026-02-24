'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  createProductSchema,
  type CreateProductInput,
} from '@repo/schemas/catalog/product';
import { ImageUpload } from '@/modules/common/components/image-upload';
import { ProductImageThumbnail } from '../../../components/product-image-thumbnail';
import { useCreateProductMutation } from '../../../hooks/use-create-product-mutation';
import { useUpdateProductMutation } from '../../../hooks/use-update-product-mutation';
import { useVendorProductQuery } from '../../../hooks/use-vendor-product-query';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import type { VendorProductDetail } from '../../../types';

const defaultValues: CreateProductInput = {
  name: '',
  weightGrams: 500,
  stock: 0,
  images: [],
  tiers: [{ minQty: 1, maxQty: null, price: 0 }],
};

function mapDetailToForm(detail: VendorProductDetail): CreateProductInput {
  return {
    name: detail.name,
    weightGrams: detail.weightGrams,
    stock: detail.stock,
    images: detail.images ?? [],
    tiers: (detail.tiers ?? []).map((t) => ({
      minQty: t.minQty,
      maxQty: t.maxQty,
      price: t.price,
    })),
  };
}

type AddProductFormProps = {
  productId?: string | null;
};

export function AddProductForm({ productId }: AddProductFormProps = {}) {
  const router = useRouter();
  const isEdit = Boolean(productId);
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation(productId ?? '');
  const { data: product, isLoading: isLoadingProduct } = useVendorProductQuery(
    productId ?? null
  );

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isEdit && product) {
      form.reset(mapDetailToForm(product));
    }
  }, [isEdit, product, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tiers',
  });

  const handleAddTier = () => {
    const tiers = form.getValues('tiers');
    const last = tiers[tiers.length - 1];
    const nextMin = last ? (last.maxQty ?? last.minQty) + 1 : 1;
    append({ minQty: nextMin, maxQty: null, price: 0 });
  };

  const onSubmit = form.handleSubmit(async (data) => {
    if (isEdit && productId) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
    router.push(ABSOLUTE_ROUTES.VENDOR_PRODUCTS);
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

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

          <Field>
            <FieldLabel htmlFor="product-weightGrams">
              Weight (grams)
            </FieldLabel>
            <FieldContent>
              <Input
                id="product-weightGrams"
                type="number"
                min={1}
                {...form.register('weightGrams', { valueAsNumber: true })}
                disabled={isPending}
                aria-invalid={Boolean(form.formState.errors.weightGrams)}
              />
              <FieldError errors={[form.formState.errors.weightGrams]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="product-stock">Stock</FieldLabel>
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
            <FieldLabel>Product images</FieldLabel>
            <FieldContent>
              <ImageUpload
                multiple
                onUploaded={(result) => {
                  const current = form.getValues('images') ?? [];
                  form.setValue('images', [...current, result]);
                }}
                disabled={isPending}
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
            <h3 className="text-sm font-medium">Pricing tiers</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTier}
              disabled={isPending}
            >
              Add Pricing Tier
            </Button>
          </div>

          <FieldError errors={[form.formState.errors.tiers]} />

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-wrap items-end gap-2 rounded-md border p-3"
              >
                <Field className="min-w-[80px] flex-1">
                  <FieldLabel className="text-xs">Min qty</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={1}
                      {...form.register(`tiers.${index}.minQty`, {
                        valueAsNumber: true,
                      })}
                      disabled={isPending}
                      aria-invalid={Boolean(
                        form.formState.errors.tiers?.[index]?.minQty
                      )}
                    />
                  </FieldContent>
                </Field>
                <Field className="min-w-[80px] flex-1">
                  <FieldLabel className="text-xs">Max qty</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Leave blank for 'and above'"
                      value={form.watch(`tiers.${index}.maxQty`) ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        form.setValue(
                          `tiers.${index}.maxQty`,
                          v === '' ? null : Number(v),
                          { shouldValidate: true }
                        );
                      }}
                      disabled={isPending}
                      aria-invalid={Boolean(
                        form.formState.errors.tiers?.[index]?.maxQty
                      )}
                    />
                  </FieldContent>
                </Field>
                <Field className="min-w-[80px] flex-1">
                  <FieldLabel className="text-xs">Price (cents)</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={1}
                      {...form.register(`tiers.${index}.price`, {
                        valueAsNumber: true,
                      })}
                      disabled={isPending}
                      aria-invalid={Boolean(
                        form.formState.errors.tiers?.[index]?.price
                      )}
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
