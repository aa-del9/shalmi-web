'use client';

import { ProductListPageHeader } from './components/product-list-page-header';
import { ProductTable } from './components/product-table';
import { useVendorProductsQuery } from './hooks/use-vendor-products-query';
import { useCategoriesQuery } from '@/modules/common/queries/categories';

export function VendorProducts() {
  const {
    data: products = [],
    isLoading,
    isError,
    error,
    isSuccess,
  } = useVendorProductsQuery();
  const { data } = useCategoriesQuery();
  const categories = data?.data ?? [];

  const hasError = isError;
  const errorMessage = error?.message ?? 'Failed to load products.';

  return (
    <div className="space-y-6">
      <ProductListPageHeader />
      <ProductTable
        isLoading={isLoading}
        hasError={hasError}
        errorMessage={errorMessage}
        isSuccess={isSuccess}
        products={products}
        categories={categories}
      />
    </div>
  );
}
