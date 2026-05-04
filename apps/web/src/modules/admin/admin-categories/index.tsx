'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminBreadcrumb } from '@/modules/admin/admin-layout/admin-breadcrumb';
import { CategoriesPageHeader } from './components/categories-page-header';
import { CategoriesFilters } from './components/categories-filters';
import { CategoriesListCard } from './components/categories-list-card';
import { CategoriesPagination } from './components/categories-pagination';
import { CategoryEditPanel } from './components/category-edit-panel';
import { CategoryEditSheet } from './components/category-edit-sheet';
import {
  useAdminCategoriesQuery,
  type AdminCategoriesSortDir,
  type AdminCategoriesSortKey,
  type AdminCategoriesStatusFilter,
} from './hooks/use-admin-categories-query';

const PAGE_LIMIT = 10;

type SortValue = `${AdminCategoriesSortKey}:${AdminCategoriesSortDir}`;

function isMatchingSortValue(value: string): value is SortValue {
  return /^(name|createdAt|updatedAt):(asc|desc)$/.test(value);
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}

function useIsDesktop(breakpointPx = 768) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const query = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [breakpointPx]);
  return isDesktop;
}

export function AdminCategories() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AdminCategoriesStatusFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [sortValue, setSortValue] = useState<SortValue>('name:asc');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 250);
  const [sortKey, sortDir] = sortValue.split(':') as [
    AdminCategoriesSortKey,
    AdminCategoriesSortDir,
  ];
  const isDesktop = useIsDesktop();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, sortValue]);

  const { data, isLoading, isError, error } = useAdminCategoriesQuery({
    page,
    limit: PAGE_LIMIT,
    q: debouncedSearch.trim(),
    status,
    sort: sortKey,
    dir: sortDir,
  });

  const categories = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;
  const totalCount = meta?.totalCount ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  // Tab counts: keep the active tab's count tied to filtered totals; for
  // the unfiltered "All" we use the same totalCount when status==='all'.
  // Q11/Q16 deferred — these are not deltas, just visible counts.
  const tabTotals = useMemo(
    () => ({
      all: status === 'all' ? totalCount : Math.max(totalCount, 0),
      active:
        status === 'active'
          ? totalCount
          : categories.filter((category) => category.isActive).length,
      inactive:
        status === 'inactive'
          ? totalCount
          : categories.filter((category) => !category.isActive).length,
    }),
    [categories, status, totalCount]
  );

  const errorMessage =
    (error instanceof Error ? error.message : null) ??
    'Failed to load categories.';

  const isPanelOpen = isCreating || selectedId !== null;
  const showMobileSheet = !isDesktop && isPanelOpen;

  const closePanel = () => {
    setSelectedId(null);
    setIsCreating(false);
  };

  const handleSelect = (id: string) => {
    setIsCreating(false);
    setSelectedId(id);
  };

  const handleAdd = () => {
    setSelectedId(null);
    setIsCreating(true);
  };

  return (
    <div className="space-y-5">
      <AdminBreadcrumb trail={['Catalog', 'Categories']} />

      <CategoriesPageHeader onAddClick={handleAdd} />

      <CategoriesFilters
        status={status}
        onStatusChange={setStatus}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        sortValue={sortValue}
        onSortValueChange={(next) => {
          if (isMatchingSortValue(next)) setSortValue(next);
        }}
        totals={tabTotals}
      />

      <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]">
        <div className="space-y-4">
          <CategoriesListCard
            isLoading={isLoading && categories.length === 0}
            hasError={Boolean(isError)}
            errorMessage={errorMessage}
            categories={categories}
            selectedCategoryId={selectedId}
            onSelect={handleSelect}
          />
          {meta ? (
            <CategoriesPagination
              page={page}
              limit={PAGE_LIMIT}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>

        <div className="hidden md:block">
          <CategoryEditPanel
            selectedCategoryId={selectedId}
            isCreating={isCreating}
            onClose={closePanel}
            onCreated={() => {
              setIsCreating(false);
            }}
            showCloseButton={true}
          />
        </div>
      </div>

      <CategoryEditSheet
        open={showMobileSheet}
        isCreating={isCreating}
        selectedCategoryId={selectedId}
        onOpenChange={(next) => {
          if (!next) closePanel();
        }}
        onCreated={() => {
          setIsCreating(false);
        }}
      />
    </div>
  );
}
