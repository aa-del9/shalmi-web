'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet';
import { CategoryEditPanel } from '../category-edit-panel';

type CategoryEditSheetProps = {
  open: boolean;
  isCreating: boolean;
  selectedCategoryId: string | null;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

// Q14b: mobile uses the same panel body inside a Sheet (per user
// resolution mirroring the buyer-account-drawer mobile pattern).
export function CategoryEditSheet({
  open,
  isCreating,
  selectedCategoryId,
  onOpenChange,
  onCreated,
}: CategoryEditSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-[480px] flex-col gap-0 p-0 sm:max-w-[480px]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>
            {isCreating ? 'Create category' : 'Edit category'}
          </SheetTitle>
          <SheetDescription>
            {isCreating
              ? 'Create a new product category.'
              : 'Update an existing category.'}
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <CategoryEditPanel
            selectedCategoryId={selectedCategoryId}
            isCreating={isCreating}
            onClose={() => onOpenChange(false)}
            onCreated={() => {
              onCreated();
              onOpenChange(false);
            }}
            showCloseButton={true}
            hideEmptyState={true}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
