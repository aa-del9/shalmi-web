'use client';

import { Plus } from 'lucide-react';

interface AddressesPageHeaderProps {
  onAddClick: () => void;
}

/**
 * Section heading for the Saved addresses sub-page (gap-analysis Q9 +
 * Q17): sentence-case "Saved addresses" with an outline ink "Add address"
 * button. Lives inside the Settings shell — no page-level title or icon.
 */
export function AddressesPageHeader({ onAddClick }: AddressesPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-sans text-[22px] font-bold tracking-[-0.01em] text-ink">
        Saved addresses
      </h2>
      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-rule-2 bg-white px-3.5 py-2 font-sans text-[13px] font-semibold text-ink transition-colors hover:bg-paper-2"
      >
        <Plus className="size-3.5" aria-hidden />
        Add address
      </button>
    </div>
  );
}
