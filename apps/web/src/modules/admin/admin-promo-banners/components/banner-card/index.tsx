'use client';

import Image from 'next/image';
import { ImageIcon, MoreVerticalIcon, PencilIcon } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import type { Banner } from '../../types';
import { BannerStatusStamp } from '../banner-status-stamp';

type BannerCardProps = {
  banner: Banner;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

const POSITION_LABEL: Record<Banner['position'], string> = {
  hero: 'Hero',
  promo_top: 'Promo top',
  strip: 'Strip',
  sidebar: 'Sidebar',
};

function formatRange(banner: Banner): string {
  const start = banner.startsAt
    ? new Date(banner.startsAt).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
      })
    : null;
  const end = banner.endsAt
    ? new Date(banner.endsAt).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
      })
    : null;
  if (start && end) return `${start} → ${end}`;
  if (start) return `from ${start}`;
  if (end) return `until ${end}`;
  return 'No schedule';
}

export function BannerCard({ banner, isSelected, onSelect }: BannerCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(banner.id)}
      aria-pressed={isSelected}
      className={cn(
        'border-rule group flex w-full flex-col overflow-hidden rounded-md border bg-white text-left transition-colors',
        'hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
        isSelected ? 'border-ink shadow-sm' : ''
      )}
    >
      <div className="bg-ink relative aspect-[16/7] w-full overflow-hidden">
        {banner.imageUrl ? (
          <Image
            src={banner.imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="text-white/40 flex h-full items-center justify-center">
            <ImageIcon className="size-10" aria-hidden />
          </div>
        )}
        <div className="absolute inset-0 flex flex-col justify-end gap-1 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent p-4">
          {banner.eyebrow ? (
            <p className="text-green-200 font-mono text-[9px] font-semibold tracking-[0.16em] uppercase">
              {banner.eyebrow}
            </p>
          ) : null}
          <p className="text-white text-base font-bold leading-tight">
            {banner.title}
          </p>
        </div>
        <div className="absolute right-3 top-3">
          <BannerStatusStamp state={banner.derivedState} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-ink truncate text-sm font-bold">
              {POSITION_LABEL[banner.position]} ·{' '}
              {banner.internalName ?? banner.title}
            </p>
            <p className="text-ink-3 truncate font-mono text-[11px]">
              {formatRange(banner)}
            </p>
          </div>
          <span
            aria-hidden
            className="text-ink-3 flex shrink-0 items-center gap-1.5"
          >
            <PencilIcon className="size-4" />
            <MoreVerticalIcon className="size-4" />
          </span>
        </div>
      </div>
    </button>
  );
}
