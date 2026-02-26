'use client';

import { useState } from 'react';
import { CategoryDialog } from './components/create-category-dialog';
import { CategoriesPageHeader } from './components/categories-page-header';
import { CategoriesTable } from './components/categories-table';
import { useCategoriesQuery } from '@/modules/common/queries/categories';

export function AdminCategories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );

  const { data, isLoading, isError, error } = useCategoriesQuery();

  const categories = data?.data ?? [];
  const isSuccess = Boolean(data?.success);
  const hasError = isError;
  const errorMessage =
    (error instanceof Error ? error.message : null) ??
    'Failed to load categories.';

  return (
    <div className="space-y-6">
      <CategoriesPageHeader
        onAddClick={() => {
          setEditingCategoryId(null);
          setDialogOpen(true);
        }}
      />
      <CategoriesTable
        isLoading={isLoading}
        hasError={Boolean(hasError)}
        errorMessage={errorMessage}
        isSuccess={isSuccess}
        categories={categories}
        onEditClick={(id) => {
          setEditingCategoryId(id);
          setDialogOpen(true);
        }}
      />
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingCategoryId(null);
        }}
        editingCategoryId={editingCategoryId}
      />
    </div>
  );
}
