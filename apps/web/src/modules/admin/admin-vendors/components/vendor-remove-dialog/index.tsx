'use client';

import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Spinner } from '@repo/ui/components/spinner';

type VendorRemoveDialogProps = {
  open: boolean;
  vendorLabel: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

// Q12: confirmation Dialog before soft delete.
export function VendorRemoveDialog({
  open,
  vendorLabel,
  isPending,
  onOpenChange,
  onConfirm,
}: VendorRemoveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove vendor?</DialogTitle>
          <DialogDescription>
            {vendorLabel} will be hidden from listings and the storefront.
            Existing orders, products, and ledger entries are preserved. This
            can be undone by re-activating the vendor manually.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner className="size-4" /> Removing…
              </>
            ) : (
              'Remove vendor'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
