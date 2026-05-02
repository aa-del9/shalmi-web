'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import type { BannerListMeta } from '../../types';

type BannersPageHeaderProps = {
  totals: BannerListMeta['totals'];
  isLoading: boolean;
  onAddClick: () => void;
};

// Q17 binding: subtitle drops impressions; format "{N} live · {M} scheduled".
// Q16/Q19/Q4: Performance report DEFERRED (hidden); title is "Banners".
export function BannersPageHeader({
  totals,
  isLoading,
  onAddClick,
}: BannersPageHeaderProps) {
  const subtitle = isLoading
    ? 'Loading banner totals…'
    : `${totals.live} live · ${totals.scheduled} scheduled · ${totals.all} total`;
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-ink text-3xl font-extrabold tracking-tight md:text-[32px]">
          Banners
        </h1>
        <p className="text-ink-3 text-sm">{subtitle}</p>
      </div>
      <Button type="button" onClick={onAddClick}>
        <PlusIcon className="size-4" aria-hidden /> New banner
      </Button>
    </div>
  );
}
