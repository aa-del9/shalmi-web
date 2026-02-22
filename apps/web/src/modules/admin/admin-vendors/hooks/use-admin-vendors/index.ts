'use client';

import { useState } from 'react';
import { useVendorsQuery } from '../use-vendors-query';

const PAGE_LIMIT = 10;

export function useAdminVendors() {
  const [page, setPage] = useState(1);

  const vendorsQuery = useVendorsQuery({
    page,
    limit: PAGE_LIMIT,
  });

  const { data, isLoading, isError, error } = vendorsQuery;

  const meta = data?.success ? data.meta : undefined;
  const vendors = data?.success ? data.data : [];
  const isSuccess = data?.success === true;
  const serverError = data?.success === false ? data.error : null;

  return {
    page,
    setPage,
    limit: PAGE_LIMIT,
    vendorsQuery,
    vendors,
    meta,
    isLoading,
    isError,
    error: isError ? (error as Error) : null,
    serverError,
    isSuccess,
  };
}
