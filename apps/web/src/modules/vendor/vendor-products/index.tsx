'use client';

import { ProductListPageHeader } from './components/product-list-page-header';
import { ProductTable } from './components/product-table';
import { useVendorProductsQuery } from './hooks/use-vendor-products-query';

export function VendorProducts() {
  const { data: products = [], isLoading, isError, error, isSuccess } = useVendorProductsQuery();

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
      />
    </div>
  );
}
