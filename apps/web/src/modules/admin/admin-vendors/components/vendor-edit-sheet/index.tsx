'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet';
import { VendorEditPanel } from '../vendor-edit-panel';

type VendorEditSheetProps = {
  open: boolean;
  isCreating: boolean;
  selectedVendorId: string | null;
  onOpenChange: (open: boolean) => void;
  onCreated: (vendorId: string | null) => void;
  onRemove: () => void;
};

// Q14b/Q2: mobile uses a Sheet that hosts a condensed panel body.
export function VendorEditSheet({
  open,
  isCreating,
  selectedVendorId,
  onOpenChange,
  onCreated,
  onRemove,
}: VendorEditSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-[480px] flex-col gap-0 p-0 sm:max-w-[480px]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{isCreating ? 'Create vendor' : 'Edit vendor'}</SheetTitle>
          <SheetDescription>
            {isCreating
              ? 'Create a new vendor.'
              : 'Update vendor profile fields.'}
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <VendorEditPanel
            selectedVendorId={selectedVendorId}
            isCreating={isCreating}
            variant="mobile"
            hideEmptyState
            showCloseButton
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
