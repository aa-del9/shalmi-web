'use client';

import { Button } from '@repo/ui/components/button';
import { Spinner } from '@repo/ui/components/spinner';
import { BannersCarousel } from './components/banners-carousel';
import { AvailableBannersGrid } from './components/available-banners-grid';
import { BannerDialog } from './components/banner-dialog';
import { useAdminPromoBanners } from './use-admin-promo-banners';

export function AdminPromoBanners() {
  const {
    isLoading,
    isError,
    error,
    activeCarousel,
    availableGrid,
    bannerDialogOpen,
    canSave,
    setSelectedActiveId,
    selectedActiveId,
    handleReorder,
    handleAddToCarousel,
    handleReplaceWith,
    handleRemoveFromActive,
    handleSave,
    setBannerDialogOpen,
    isPending,
  } = useAdminPromoBanners();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-4">
        {error instanceof Error ? error.message : 'Failed to load banners'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-8 sm:items-center">
        <div className="flex w-full flex-row flex-wrap justify-between">
          <h1 className="text-2xl font-semibold">Promo Banners</h1>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setBannerDialogOpen(true)}
              className="w-fit"
            >
              Add banner
            </Button>
            <Button onClick={handleSave} disabled={!canSave} className="w-fit">
              {isPending ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Saving…
                </>
              ) : (
                'Save Layout'
              )}
            </Button>
          </div>
        </div>

        <BannerDialog
          open={bannerDialogOpen}
          onOpenChange={setBannerDialogOpen}
        />

        <section className="flex w-full flex-col">
          <h2 className="mb-4 text-lg font-medium">Active carousel</h2>
          <BannersCarousel
            banners={activeCarousel}
            selectedId={selectedActiveId}
            onSelectBanner={setSelectedActiveId}
            onReorder={handleReorder}
            onRemoveFromActive={handleRemoveFromActive}
          />
        </section>

        <section className="flex w-full flex-col">
          <h2 className="text-lg font-medium">Available banners</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Add to carousel or replace an active banner (select one above
            first).
          </p>
          <AvailableBannersGrid
            banners={availableGrid}
            selectedActiveId={selectedActiveId}
            onAddToCarousel={handleAddToCarousel}
            onReplaceWith={handleReplaceWith}
          />
        </section>
      </div>
    </div>
  );
}
