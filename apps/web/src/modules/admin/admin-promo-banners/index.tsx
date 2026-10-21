'use client';

import { useEffect, useMemo, useState } from 'react';
import { parseAsString, useQueryState } from 'nuqs';
import { toast } from 'sonner';
import { AdminBreadcrumb } from '@/modules/admin/admin-layout/admin-breadcrumb';
import { BannersPageHeader } from './components/banners-page-header';
import { BannersFilters, type BannerStatusFilter } from './components/banners-filters';
import { BannersGrid } from './components/banners-grid';
import { BannerEditPanel } from './components/banner-edit-panel';
import { BannerEditSheet } from './components/banner-edit-sheet';
import { BannerRemoveDialog } from './components/banner-remove-dialog';
import { BannerMobileHint } from './components/banner-mobile-hint';
import { useAdminBannersList } from './hooks/use-admin-banners-list';
import { useDeleteBannerMutation } from './hooks/use-delete-banner-mutation';
import type { Banner } from './types';

const CREATE_FLAG = '__new__';

type SortValue = 'createdAt:desc' | 'createdAt:asc' | 'displayOrder:asc';

function sortBanners(banners: ReadonlyArray<Banner>, sort: SortValue): Banner[] {
  const next = [...banners];
  if (sort === 'displayOrder:asc') {
    next.sort((a, b) => a.displayOrder - b.displayOrder);
  } else if (sort === 'createdAt:asc') {
    next.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } else {
    next.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return next;
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

export function AdminPromoBanners() {
  const [bannerIdParam, setBannerIdParam] = useQueryState(
    'bannerId',
    parseAsString.withDefault('')
  );
  const [status, setStatus] = useState<BannerStatusFilter>('all');
  const [positionValue, setPositionValue] = useState('');
  const [sortValue, setSortValue] = useState<SortValue>('createdAt:desc');
  const [removeTarget, setRemoveTarget] = useState<Banner | null>(null);

  const isDesktop = useIsDesktop();
  const { data, isLoading, isError, error } = useAdminBannersList();
  const deleteMutation = useDeleteBannerMutation();

  const banners = useMemo(() => data?.data ?? [], [data?.data]);
  const totals =
    data?.meta.totals ?? { all: 0, live: 0, scheduled: 0, paused: 0, expired: 0 };

  const isCreating = bannerIdParam === CREATE_FLAG;
  const selectedBannerId =
    bannerIdParam && bannerIdParam !== CREATE_FLAG ? bannerIdParam : null;
  const selectedBanner = selectedBannerId
    ? (banners.find((b) => b.id === selectedBannerId) ?? null)
    : null;
  const isPanelOpen = isCreating || selectedBanner !== null;
  const showMobileSheet = !isDesktop && isPanelOpen;

  const filteredBanners = useMemo(() => {
    let next = banners;
    if (status !== 'all') {
      next = next.filter((b) => b.derivedState === status);
    }
    if (positionValue !== '') {
      next = next.filter((b) => b.position === positionValue);
    }
    return sortBanners(next, sortValue);
  }, [banners, status, positionValue, sortValue]);

  const errorMessage =
    (error instanceof Error ? error.message : null) ??
    'Failed to load banners.';

  const closePanel = () => setBannerIdParam(null);
  const handleAdd = () => setBannerIdParam(CREATE_FLAG);
  const handleSelect = (id: string) => setBannerIdParam(id);

  const handleConfirmRemove = async () => {
    if (!removeTarget) return;
    try {
      await deleteMutation.mutateAsync(removeTarget.id);
      toast.success(`${removeTarget.title} removed`);
      if (selectedBannerId === removeTarget.id) closePanel();
      setRemoveTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to remove banner'
      );
    }
  };

  return (
    <div className="space-y-5">
      <AdminBreadcrumb trail={['Catalog', 'Banners']} />

      <BannersPageHeader
        totals={totals}
        isLoading={isLoading && banners.length === 0}
        onAddClick={handleAdd}
      />

      <BannerMobileHint />

      <BannersFilters
        status={status}
        onStatusChange={setStatus}
        positionValue={positionValue}
        onPositionChange={setPositionValue}
        sortValue={sortValue}
        onSortChange={setSortValue}
        totals={totals}
      />

      <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(380px,460px)]">
        <BannersGrid
          isLoading={isLoading && banners.length === 0}
          hasError={Boolean(isError)}
          errorMessage={errorMessage}
          banners={filteredBanners}
          selectedBannerId={selectedBannerId}
          onSelect={handleSelect}
        />

        <div className="hidden md:block">
          <BannerEditPanel
            selectedBanner={selectedBanner}
            isCreating={isCreating}
            onClose={closePanel}
            onCreated={(newId) => {
              if (newId) setBannerIdParam(newId);
            }}
            onRemove={
              selectedBanner ? () => setRemoveTarget(selectedBanner) : undefined
            }
          />
        </div>
      </div>

      <BannerEditSheet
        open={showMobileSheet}
        isCreating={isCreating}
        selectedBanner={selectedBanner}
        onOpenChange={(next) => {
          if (!next) closePanel();
        }}
        onCreated={(newId) => {
          if (newId) setBannerIdParam(newId);
        }}
        onRemove={() => {
          if (selectedBanner) setRemoveTarget(selectedBanner);
        }}
      />

      <BannerRemoveDialog
        open={removeTarget !== null}
        bannerLabel={removeTarget?.title ?? ''}
        isPending={deleteMutation.isPending}
        onOpenChange={(next) => {
          if (!next) setRemoveTarget(null);
        }}
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
}
