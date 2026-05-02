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

type BannerRemoveDialogProps = {
  open: boolean;
  bannerLabel: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function BannerRemoveDialog({
  open,
  bannerLabel,
  isPending,
  onOpenChange,
  onConfirm,
}: BannerRemoveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove banner?</DialogTitle>
          <DialogDescription>
            {bannerLabel} will be permanently deleted. This cannot be undone.
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
              'Remove banner'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
