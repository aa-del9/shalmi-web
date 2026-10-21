'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ProductsPageHeader } from './components/products-page-header';
import { ProductsStatsSegments } from './components/products-stats-segments';
import { ProductsFilterBar } from './components/products-filter-bar';
import { ProductsTable } from './components/products-table';
import { ProductsMobileList } from './components/products-mobile-list';
import { ProductsPaginator } from './components/products-paginator';
import { AddProductForm } from './modules/add-product/add-product-form';
import { useVendorProductsQuery } from './hooks/use-vendor-products-query';
import { useVendorProductQuery } from './hooks/use-vendor-product-query';
import { useCategoriesQuery } from '@/modules/common/queries/categories';
import type {
  VendorProductsFilters,
  VendorProductsSort,
  VendorProductsStatusFilter,
} from './types';

const PAGE_SIZE = 8;

type FormMode = { kind: 'closed' } | { kind: 'add' } | { kind: 'edit'; id: string };

export function VendorProducts() {
  const [filters, setFilters] = useState<VendorProductsFilters>({
    page: 1,
    q: '',
    status: 'all',
    categoryId: null,
    sort: 'newest',
  });
  // Q1 binding: stats segments are real filters; the filter bar dropdown
  // and the segment row stay in sync via shared `filters.status`.
  const [searchInput, setSearchInput] = useState('');
  // Debounce search-as-you-type so the API isn't hammered.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setFilters((prev) =>
        prev.q === searchInput ? prev : { ...prev, q: searchInput, page: 1 }
      );
    }, 250);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const [formMode, setFormMode] = useState<FormMode>({ kind: 'closed' });
  const formAnchorRef = useRef<HTMLDivElement | null>(null);

  const productsQuery = useVendorProductsQuery(filters);
  const { data: categoriesData } = useCategoriesQuery();
  const categories = useMemo(
    () => categoriesData?.data ?? [],
    [categoriesData]
  );

  const editingProduct = useVendorProductQuery(
    formMode.kind === 'edit' ? formMode.id : null
  );

  const stats = productsQuery.data?.stats;

  const onAddProduct = () => {
    setFormMode({ kind: 'add' });
    requestAnimationFrame(() => {
      formAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };
  const onEdit = (id: string) => {
    setFormMode({ kind: 'edit', id });
    requestAnimationFrame(() => {
      formAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };
  const onCloseForm = () => setFormMode({ kind: 'closed' });
  const onSaved = () => {
    setFormMode({ kind: 'closed' });
    productsQuery.refetch();
  };

  const handleStatusChange = (next: VendorProductsStatusFilter) => {
    setFilters((prev) => ({ ...prev, status: next, page: 1 }));
  };
  const handleCategoryChange = (next: string | null) => {
    setFilters((prev) => ({ ...prev, categoryId: next, page: 1 }));
  };
  const handleSortChange = (next: VendorProductsSort) => {
    setFilters((prev) => ({ ...prev, sort: next, page: 1 }));
  };
  const handlePageChange = (next: number) => {
    setFilters((prev) => ({ ...prev, page: next }));
  };

  const showForm = formMode.kind !== 'closed';
  // Q24 binding: Eyebrow is dynamic — `NEW PRODUCT · DRAFT` for fresh,
  // `EDIT PRODUCT · {STATUS}` once editing.
  const eyebrow = useMemo(() => {
    if (formMode.kind === 'add') return 'NEW PRODUCT · DRAFT';
    if (formMode.kind === 'edit') {
      const statusLabel = (editingProduct.data?.status ?? 'active').toUpperCase();
      return `EDIT PRODUCT · ${statusLabel}`;
    }
    return '';
  }, [formMode, editingProduct.data?.status]);
  // Q13 binding: Title swaps to `Edit · {product name}` in edit mode.
  const formTitle = useMemo(() => {
    if (formMode.kind === 'add') return 'Add a new product';
    if (formMode.kind === 'edit') {
      const name = editingProduct.data?.name ?? 'product';
      return `Edit · ${name}`;
    }
    return '';
  }, [formMode, editingProduct.data?.name]);

  return (
    <div className="space-y-6 md:space-y-7">
      <ProductsPageHeader
        activeCount={stats?.active ?? null}
        onAddProduct={onAddProduct}
      />

      <ProductsStatsSegments
        stats={stats}
        isLoading={productsQuery.isLoading}
        active={filters.status}
        onChange={handleStatusChange}
      />

      <section className="border-rule overflow-hidden rounded-md border bg-white">
        <ProductsFilterBar
          q={searchInput}
          onQueryChange={setSearchInput}
          status={filters.status}
          onStatusChange={handleStatusChange}
          categoryId={filters.categoryId}
          onCategoryChange={handleCategoryChange}
          sort={filters.sort}
          onSortChange={handleSortChange}
          categories={categories}
        />
        <ProductsTable
          rows={productsQuery.data?.rows}
          isLoading={productsQuery.isLoading}
          hasError={productsQuery.isError}
          errorMessage={
            productsQuery.error instanceof Error
              ? productsQuery.error.message
              : 'Failed to load products.'
          }
          categories={categories}
          onEdit={onEdit}
        />
        {productsQuery.data && productsQuery.data.total > PAGE_SIZE ? (
          <ProductsPaginator
            page={filters.page}
            pageSize={productsQuery.data.pageSize}
            total={productsQuery.data.total}
            onPageChange={handlePageChange}
          />
        ) : null}
        <ProductsMobileList
          rows={productsQuery.data?.rows}
          isLoading={productsQuery.isLoading}
          hasError={productsQuery.isError}
          errorMessage={
            productsQuery.error instanceof Error
              ? productsQuery.error.message
              : 'Failed to load products.'
          }
          stats={stats}
          status={filters.status}
          onStatusChange={handleStatusChange}
          q={searchInput}
          onQueryChange={setSearchInput}
          onEdit={onEdit}
        />
      </section>

      <div ref={formAnchorRef} aria-hidden className="scroll-mt-6" />
      {showForm ? (
        <section className="border-rule rounded-md border bg-white p-5 md:p-7">
          <header className="mb-5 flex flex-col gap-1.5">
            {eyebrow ? (
              <p className="text-green-700 font-mono text-[11px] font-bold tracking-[0.16em] uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-ink text-2xl font-extrabold tracking-[-0.01em]">
              {formTitle}
            </h2>
            {formMode.kind === 'add' ? (
              <p className="text-ink-2 text-sm">
                Fill these details, then save. The product appears in your
                catalog after admin approval.
              </p>
            ) : null}
          </header>
          <AddProductForm
            inline
            productId={formMode.kind === 'edit' ? formMode.id : null}
            onCancel={onCloseForm}
            onSaved={onSaved}
          />
        </section>
      ) : null}
    </div>
  );
}
