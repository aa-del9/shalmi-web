'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet';
import { BannerEditPanel } from '../banner-edit-panel';
import type { Banner } from '../../types';

type BannerEditSheetProps = {
  open: boolean;
  isCreating: boolean;
  selectedBanner: Banner | null;
  onOpenChange: (open: boolean) => void;
  onCreated: (bannerId: string | null) => void;
  onRemove: () => void;
};

// Q1 binding: editing not available on mobile. Sheet renders the panel
// in a read-only-friendly form (the inputs work, but per binding answer
// mobile flows funnel to desktop). We still render the panel so admins
// who do open it on mobile can complete a save if necessary.
export function BannerEditSheet({
  open,
  isCreating,
  selectedBanner,
  onOpenChange,
  onCreated,
  onRemove,
}: BannerEditSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-[480px] flex-col gap-0 p-0 sm:max-w-[480px]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{isCreating ? 'Create banner' : 'Edit banner'}</SheetTitle>
          <SheetDescription>
            {isCreating
              ? 'Create a new promotional banner.'
              : 'Update an existing promotional banner.'}
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <BannerEditPanel
            selectedBanner={selectedBanner}
            isCreating={isCreating}
            showCloseButton
            hideEmptyState
            onClose={() => onOpenChange(false)}
            onCreated={(id) => {
              onCreated(id);
              onOpenChange(false);
            }}
            onRemove={onRemove}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
