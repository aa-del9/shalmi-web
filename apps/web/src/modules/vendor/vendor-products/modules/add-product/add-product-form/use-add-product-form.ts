import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProductSchema,
  type CreateProductInput,
} from '@repo/schemas/catalog/product';
import { useCreateProductMutation } from '../../../hooks/use-create-product-mutation';
import { useUpdateProductMutation } from '../../../hooks/use-update-product-mutation';
import { useVendorProductQuery } from '../../../hooks/use-vendor-product-query';
import { useCategoriesQuery } from '@/modules/common/queries/categories';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { mapDetailToForm } from '../utils';
import { createProductDefaultValues } from '../constants';
import { UseAddProductFormProps } from '../types';

type UseAddProductFormOpts = UseAddProductFormProps & {
  /** When true (the new inline mode), submit does NOT navigate — caller
   * controls reset / close via `onSaved`. When false / undefined, submit
   * navigates to the vendor products list (legacy /new + /[id]/edit). */
  inline?: boolean;
  onSaved?: () => void;
};

export const useAddProductForm = ({
  productId,
  inline,
  onSaved,
}: UseAddProductFormOpts) => {
  const router = useRouter();
  const isEdit = Boolean(productId);
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation(productId ?? '');
  const { data: product, isLoading: isLoadingProduct } = useVendorProductQuery(
    productId ?? null
  );
  const { data: categoriesData } = useCategoriesQuery();
  const categoriesList = categoriesData?.data ?? [];

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: createProductDefaultValues,
  });

  useEffect(() => {
    if (!isEdit) return;
    if (product) {
      form.reset(mapDetailToForm(product));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, product?.id, product?.categoryIds, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'packTiers',
  });

  const handleAddTier = () => {
    const tiers = form.getValues('packTiers');
    const last = tiers[tiers.length - 1];
    const nextPackQty = last ? last.packQty + 1 : 1;
    const nextPrice = last ? Math.max(1, last.pricePerPackCents - 1) : 0;
    append({
      packQty: nextPackQty,
      pricePerPackCents: nextPrice,
      badge: null,
      isDefault: false,
    });
  };

  const submitWithStatus = async (
    data: CreateProductInput,
    statusOverride?: 'active' | 'draft'
  ) => {
    const payload =
      statusOverride !== undefined ? { ...data, status: statusOverride } : data;
    if (isEdit && productId) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
    if (inline) {
      onSaved?.();
      return;
    }
    router.push(ABSOLUTE_ROUTES.VENDOR_PRODUCTS);
  };

  const onSubmit = form.handleSubmit((data) => submitWithStatus(data));

  const onSaveDraft = form.handleSubmit((data) =>
    submitWithStatus(data, 'draft')
  );

  const onSaveActive = form.handleSubmit((data) =>
    submitWithStatus(data, 'active')
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return {
    form,
    isEdit,
    categoriesList,
    product,
    isPending,
    isLoadingProduct,
    onSubmit,
    onSaveDraft,
    onSaveActive,
    handleAddTier,
    fields,
    remove,
  };
};
