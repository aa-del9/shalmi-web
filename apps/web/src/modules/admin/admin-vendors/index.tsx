'use client';

import { useState } from 'react';
import { VendorDialog } from './components/vendor-dialog';
import { VendorsPageHeader } from './components/vendors-page-header';
import { VendorsPagination } from './components/vendors-pagination';
import { VendorsTable } from './components/vendors-table';
import { useAdminVendors } from './hooks/use-admin-vendors';

export function AdminVendors() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

  const {
    page,
    setPage,
    vendors,
    meta,
    isLoading,
    isError,
    error,
    serverError,
    isSuccess,
  } = useAdminVendors();

  const hasError = isError || Boolean(serverError);
  const errorMessage =
    serverError ?? error?.message ?? 'Failed to load vendors.';

  return (
    <div className="space-y-6">
      <VendorsPageHeader
        onAddClick={() => {
          setEditingVendorId(null);
          setDialogOpen(true);
        }}
      />
      <VendorsTable
        isLoading={isLoading}
        hasError={hasError}
        errorMessage={errorMessage}
        isSuccess={isSuccess}
        vendors={vendors}
        onEditClick={(id) => {
          setEditingVendorId(id);
          setDialogOpen(true);
        }}
      />
      {isSuccess && (
        <VendorsPagination page={page} setPage={setPage} meta={meta} />
      )}
      <VendorDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingVendorId(null);
        }}
        editingVendorId={editingVendorId}
      />
    </div>
  );
}
