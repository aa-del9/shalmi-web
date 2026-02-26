import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useBannersQuery } from './hooks/use-banners-query';
import { useBulkUpdateBannersMutation } from './hooks/use-bulk-update-banners-mutation';
import type { Banner } from './types';
import { areBannersEqual } from './utils';

export const useAdminPromoBanners = () => {
  const { data, isLoading, isError, error } = useBannersQuery();
  const bulkUpdate = useBulkUpdateBannersMutation();
  const [draftBanners, setDraftBanners] = useState<Banner[]>([]);
  const initialBannersRef = useRef<Banner[]>([]);
  const [selectedActiveId, setSelectedActiveId] = useState<string | null>(null);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);

  const serverBanners = useMemo(() => data?.data ?? [], [data?.data]);

  const activeCarousel = useMemo(
    () =>
      draftBanners
        .filter((b) => b.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [draftBanners]
  );
  const availableGrid = useMemo(
    () =>
      draftBanners
        .filter((b) => !b.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [draftBanners]
  );

  const isDirty = useMemo(
    () => !areBannersEqual(draftBanners, initialBannersRef.current),
    [draftBanners]
  );
  const canSave = useMemo(
    () => isDirty && !bulkUpdate.isPending,
    [isDirty, bulkUpdate.isPending]
  );

  const handleReorder = useCallback((orderedIds: string[]) => {
    setDraftBanners((prev) => {
      const next = prev.map((b) => ({ ...b }));
      orderedIds.forEach((id, index) => {
        const banner = next.find((b) => b.id === id);
        if (banner) banner.displayOrder = index;
      });
      return next;
    });
  }, []);

  const handleAddToCarousel = useCallback((banner: Banner) => {
    setDraftBanners((prev) => {
      const activeCount = prev.filter((b) => b.isActive).length;
      return prev.map((b) =>
        b.id === banner.id
          ? { ...b, isActive: true, displayOrder: activeCount }
          : { ...b }
      );
    });
  }, []);

  const handleReplaceWith = useCallback(
    (availableBanner: Banner) => {
      if (!selectedActiveId) return;
      setDraftBanners((prev) => {
        const active = prev.find((b) => b.id === selectedActiveId);
        if (!active) return prev;
        const swapOrder = active.displayOrder;
        const inactiveCount = prev.filter((b) => !b.isActive).length;
        return prev.map((b) => {
          if (b.id === selectedActiveId) {
            return { ...b, isActive: false, displayOrder: inactiveCount };
          }
          if (b.id === availableBanner.id) {
            return { ...b, isActive: true, displayOrder: swapOrder };
          }
          return { ...b };
        });
      });
      setSelectedActiveId(null);
    },
    [selectedActiveId]
  );

  const handleRemoveFromActive = useCallback((bannerId: string) => {
    setDraftBanners((prev) => {
      const inactiveCount = prev.filter((b) => !b.isActive).length;
      return prev.map((b) =>
        b.id === bannerId
          ? { ...b, isActive: false, displayOrder: inactiveCount }
          : { ...b }
      );
    });
    setSelectedActiveId((id) => (id === bannerId ? null : id));
  }, []);

  const handleSave = useCallback(async () => {
    const payload = draftBanners.map((b) => ({
      id: b.id,
      isActive: b.isActive,
      displayOrder: b.displayOrder,
    }));
    await bulkUpdate.mutateAsync(payload);
    initialBannersRef.current = draftBanners.map((b) => ({ ...b }));
  }, [draftBanners, bulkUpdate]);

  useEffect(() => {
    if (
      serverBanners.length > 0 ||
      (data != null && serverBanners.length === 0)
    ) {
      setDraftBanners(serverBanners.map((b) => ({ ...b })));
      initialBannersRef.current = serverBanners.map((b) => ({ ...b }));
    }
  }, [data, serverBanners]);

  return {
    isLoading,
    isPending: bulkUpdate.isPending,
    isError,
    error,
    activeCarousel,
    availableGrid,
    selectedActiveId,
    bannerDialogOpen,
    canSave,
    setSelectedActiveId,
    handleReorder,
    handleAddToCarousel,
    handleReplaceWith,
    handleRemoveFromActive,
    handleSave,
    setBannerDialogOpen,
  };
};
