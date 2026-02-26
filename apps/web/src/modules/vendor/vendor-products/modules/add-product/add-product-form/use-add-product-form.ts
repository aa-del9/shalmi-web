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

export const useAddProductForm = ({ productId }: UseAddProductFormProps) => {
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

  return {
    form,
    isEdit,
    categoriesList,
    product,
    isPending,
    isLoadingProduct,
    onSubmit,
    handleAddTier,
    fields,
    remove,
  };
};
