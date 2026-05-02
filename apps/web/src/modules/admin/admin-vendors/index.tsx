'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { toast } from 'sonner';
import { AdminBreadcrumb } from '@/modules/admin/admin-layout/admin-breadcrumb';
import { Button } from '@repo/ui/components/button';
import { VendorsPageHeader } from './components/vendors-page-header';
import { VendorsKpiRow } from './components/vendors-kpi-row';
import { VendorsFilters } from './components/vendors-filters';
import { VendorsListCard } from './components/vendors-list-card';
import { VendorsPaginationFooter } from './components/vendors-pagination-footer';
import { VendorEditPanel } from './components/vendor-edit-panel';
import { VendorEditSheet } from './components/vendor-edit-sheet';
import { VendorRemoveDialog } from './components/vendor-remove-dialog';
import {
  useAdminVendorsList,
  type AdminVendorsSortDir,
  type AdminVendorsSortKey,
  type AdminVendorsStatusFilter,
} from './hooks/use-admin-vendors-list';
import { useHubsQuery } from './hooks/use-hubs-query';
import { useDeleteVendorMutation } from './hooks/use-delete-vendor-mutation';
import { useBulkUpdateVendorsMutation } from './hooks/use-bulk-update-vendors-mutation';
import { useUpdateVendorMutation } from './hooks/use-update-vendor-mutation';
import type { VendorListItem } from './types';

const PAGE_LIMIT = 10;
const CREATE_FLAG = '__new__';

type SortValue = `${AdminVendorsSortKey}:${AdminVendorsSortDir}`;

function isSortValue(value: string): value is SortValue {
  return /^(createdAt|shopName):(asc|desc)$/.test(value);
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

export function AdminVendors() {
  const router = useRouter();
  const [vendorIdParam, setVendorIdParam] = useQueryState(
    'vendorId',
    parseAsString.withDefault('')
  );
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AdminVendorsStatusFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [hubValue, setHubValue] = useState('');
  const [sortValue, setSortValue] = useState<SortValue>('createdAt:desc');
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [removeTarget, setRemoveTarget] = useState<VendorListItem | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput, 250);
  const [sortKey, sortDir] = sortValue.split(':') as [
    AdminVendorsSortKey,
    AdminVendorsSortDir,
  ];
  const isDesktop = useIsDesktop();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, hubValue, sortValue]);

  const { data, isLoading, isError, error } = useAdminVendorsList({
    page,
    limit: PAGE_LIMIT,
    q: debouncedSearch.trim(),
    status,
    hub: hubValue,
    sort: sortKey,
    dir: sortDir,
  });
  const { data: hubs } = useHubsQuery();
  const deleteMutation = useDeleteVendorMutation();
  const bulkUpdateMutation = useBulkUpdateVendorsMutation();

  const vendors = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;
  const totals = meta?.totals ?? { all: 0, active: 0, inactive: 0 };
  const totalCount = meta?.totalCount ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  const isCreating = vendorIdParam === CREATE_FLAG;
  const selectedVendorId =
    vendorIdParam && vendorIdParam !== CREATE_FLAG ? vendorIdParam : null;
  const isPanelOpen = isCreating || selectedVendorId !== null;
  const showMobileSheet = !isDesktop && isPanelOpen;

  const errorMessage =
    (error instanceof Error ? error.message : null) ??
    'Failed to load vendors.';

  const closePanel = () => setVendorIdParam(null);
  const handleAdd = () => setVendorIdParam(CREATE_FLAG);
  const handleSelect = (id: string) => setVendorIdParam(id);

  const handleToggleCheck = (id: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAll = (checked: boolean) => {
    if (!checked) {
      setBulkSelected(new Set());
      return;
    }
    setBulkSelected(new Set(vendors.map((v) => v.id)));
  };

  const updateMutation = useUpdateVendorMutation(selectedVendorId ?? '');

  const handleToggleActive = async (vendor: VendorListItem) => {
    try {
      await updateMutation.mutateAsync({ isActive: !vendor.isActive });
      toast.success(
        vendor.isActive
          ? `${vendor.shopName} deactivated`
          : `${vendor.shopName} activated`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update vendor'
      );
    }
  };

  const handleBulkActivate = async (isActive: boolean) => {
    const ids = Array.from(bulkSelected);
    if (ids.length === 0) return;
    try {
      await bulkUpdateMutation.mutateAsync({ vendorIds: ids, isActive });
      toast.success(
        `${ids.length} vendor${ids.length === 1 ? '' : 's'} ${
          isActive ? 'activated' : 'deactivated'
        }`
      );
      setBulkSelected(new Set());
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Bulk update failed'
      );
    }
  };

  const handleConfirmRemove = async () => {
    if (!removeTarget) return;
    try {
      await deleteMutation.mutateAsync(removeTarget.id);
      toast.success(`${removeTarget.shopName} removed`);
      if (selectedVendorId === removeTarget.id) closePanel();
      setRemoveTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove vendor');
    }
  };

  // Per Q18 — desktop card has no Sales-report button; on mobile we route from
  // the kebab "View" item. Provide handler if mobile rows were ever added.
  void router; // reserved for future routing helper

  return (
    <div className="space-y-5">
      <AdminBreadcrumb trail={['Catalog', 'Vendors']} />

      <VendorsPageHeader
        totals={totals}
        isLoading={isLoading && vendors.length === 0}
        onAddClick={handleAdd}
      />

      <VendorsKpiRow totals={totals} isLoading={isLoading && vendors.length === 0} />

      <VendorsFilters
        status={status}
        onStatusChange={setStatus}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        hubValue={hubValue}
        onHubChange={setHubValue}
        hubs={hubs ?? []}
        sortValue={sortValue}
        onSortValueChange={(next) => {
          if (isSortValue(next)) setSortValue(next);
        }}
        totals={totals}
      />

      {bulkSelected.size > 0 ? (
        <div
          role="status"
          className="border-rule bg-paper-2 flex flex-col gap-2 rounded-md border px-4 py-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-ink-2 text-sm">
            <span className="font-bold">{bulkSelected.size}</span> selected
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleBulkActivate(true)}
              disabled={bulkUpdateMutation.isPending}
            >
              Activate
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleBulkActivate(false)}
              disabled={bulkUpdateMutation.isPending}
            >
              Deactivate
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setBulkSelected(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(380px,460px)]">
        <div className="space-y-4">
          <VendorsListCard
            isLoading={isLoading && vendors.length === 0}
            hasError={Boolean(isError)}
            errorMessage={errorMessage}
            vendors={vendors}
            selectedVendorId={selectedVendorId}
            selectedIdsForBulk={bulkSelected}
            onSelectVendor={handleSelect}
            onToggleCheck={handleToggleCheck}
            onToggleAll={handleToggleAll}
            onToggleActive={handleToggleActive}
            onRemove={setRemoveTarget}
          />
          {meta ? (
            <VendorsPaginationFooter
              page={page}
              limit={PAGE_LIMIT}
              totalCount={totalCount}
              totalPages={totalPages}
              entityNoun={{ singular: 'vendor', plural: 'vendors' }}
              onPageChange={setPage}
            />
          ) : null}
        </div>

        <div className="hidden md:block">
          <VendorEditPanel
            selectedVendorId={selectedVendorId}
            isCreating={isCreating}
            variant="desktop"
            onClose={closePanel}
            onCreated={(newId) => {
              if (newId) setVendorIdParam(newId);
            }}
            onRemove={
              selectedVendorId
                ? () => {
                    const v = vendors.find((row) => row.id === selectedVendorId);
                    if (v) setRemoveTarget(v);
                  }
                : undefined
            }
          />
        </div>
      </div>

      <VendorEditSheet
        open={showMobileSheet}
        isCreating={isCreating}
        selectedVendorId={selectedVendorId}
        onOpenChange={(next) => {
          if (!next) closePanel();
        }}
        onCreated={(newId) => {
          if (newId) setVendorIdParam(newId);
        }}
        onRemove={() => {
          if (!selectedVendorId) return;
          const v = vendors.find((row) => row.id === selectedVendorId);
          if (v) setRemoveTarget(v);
        }}
      />

      <VendorRemoveDialog
        open={removeTarget !== null}
        vendorLabel={removeTarget?.shopName ?? ''}
        isPending={deleteMutation.isPending}
        onOpenChange={(next) => {
          if (!next) setRemoveTarget(null);
        }}
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
}
