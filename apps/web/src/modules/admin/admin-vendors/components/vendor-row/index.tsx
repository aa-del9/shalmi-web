'use client';

import { Checkbox } from '@repo/ui/components/checkbox';
import { Stamp } from '@repo/ui/components/stamp';
import { cn } from '@repo/ui/lib/utils';
import type { VendorListItem } from '@/modules/admin/admin-vendors/types';
import { VendorAvatar } from '../vendor-avatar';
import { VendorRowMenu } from '../vendor-row-menu';

type VendorRowProps = {
  vendor: VendorListItem;
  isSelected: boolean;
  isChecked: boolean;
  onSelect: (id: string) => void;
  onToggleCheck: (id: string) => void;
  onToggleActive: (vendor: VendorListItem) => void;
  onRemove: (vendor: VendorListItem) => void;
};

export function VendorRow({
  vendor,
  isSelected,
  isChecked,
  onSelect,
  onToggleCheck,
  onToggleActive,
  onRemove,
}: VendorRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(vendor.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(vendor.id);
        }
      }}
      className={cn(
        'border-rule grid grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0 md:grid-cols-[auto_auto_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto]',
        'hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
        isSelected ? 'bg-paper-2' : 'bg-white'
      )}
    >
      <span
        onClick={(event) => event.stopPropagation()}
        className="flex items-center"
      >
        <Checkbox
          checked={isChecked}
          onCheckedChange={() => onToggleCheck(vendor.id)}
          aria-label={`Select ${vendor.shopName}`}
        />
      </span>
      <VendorAvatar
        fullName={vendor.fullName}
        shopName={vendor.shopName}
        logoUrl={vendor.logoUrl}
      />
      <div className="min-w-0">
        <p className="text-ink truncate text-sm font-bold">
          {vendor.fullName ?? vendor.shopName}
        </p>
        <p className="text-ink-3 truncate text-xs">
          {vendor.fullName ? vendor.shopName : vendor.displayId}
        </p>
      </div>
      <p className="text-ink-2 hidden truncate font-mono text-xs md:block">
        {vendor.phoneNumber ?? '—'}
      </p>
      <p className="text-ink-2 hidden truncate text-xs font-semibold md:block">
        {vendor.marketHub}
      </p>
      <Stamp variant={vendor.isActive ? 'success' : 'critical'}>
        {vendor.isActive ? 'Active' : 'Inactive'}
      </Stamp>
      <VendorRowMenu
        isActive={vendor.isActive}
        onView={() => onSelect(vendor.id)}
        onToggleActive={() => onToggleActive(vendor)}
        onRemove={() => onRemove(vendor)}
      />
    </div>
  );
}
