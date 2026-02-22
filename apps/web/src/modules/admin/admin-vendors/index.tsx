'use client';

import {
  VendorsPageHeader,
  VendorsTable,
  VendorsPagination,
} from './components';
import { useAdminVendors } from './hooks/use-admin-vendors';

export function AdminVendors() {
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
      <VendorsPageHeader />
      <VendorsTable
        isLoading={isLoading}
        hasError={hasError}
        errorMessage={errorMessage}
        isSuccess={isSuccess}
        vendors={vendors}
      />
      {isSuccess && (
        <VendorsPagination page={page} setPage={setPage} meta={meta} />
      )}
    </div>
  );
}
