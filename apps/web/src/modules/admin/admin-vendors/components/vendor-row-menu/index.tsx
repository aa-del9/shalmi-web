'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Button } from '@repo/ui/components/button';
import {
  EyeIcon,
  MoreVerticalIcon,
  PowerIcon,
  Trash2Icon,
} from 'lucide-react';

type VendorRowMenuProps = {
  isActive: boolean;
  onView: () => void;
  onToggleActive: () => void;
  onRemove: () => void;
};

// Q17 binding: View, Deactivate (or Activate), Remove.
export function VendorRowMenu({
  isActive,
  onView,
  onToggleActive,
  onRemove,
}: VendorRowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="More actions"
          className="size-8"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVerticalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuItem onSelect={onView}>
          <EyeIcon className="size-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onToggleActive}>
          <PowerIcon className="size-4" />
          {isActive ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onRemove}>
          <Trash2Icon className="size-4" /> Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
