import type { promotionalBanners } from '@repo/database';
import { deriveBannerState, type Banner } from '../types';

type Row = typeof promotionalBanners.$inferSelect;

export function rowToBanner(row: Row): Banner {
  const startsAt =
    row.startsAt instanceof Date
      ? row.startsAt.toISOString()
      : row.startsAt
        ? new Date(row.startsAt).toISOString()
        : null;
  const endsAt =
    row.endsAt instanceof Date
      ? row.endsAt.toISOString()
      : row.endsAt
        ? new Date(row.endsAt).toISOString()
        : null;
  const status = (row.status ?? 'paused') as Banner['status'];
  return {
    id: row.id,
    title: row.title,
    internalName: row.internalName ?? null,
    eyebrow: row.eyebrow ?? null,
    ctaLabel: row.ctaLabel ?? null,
    imageUrl: row.imageUrl,
    targetUrl: row.targetUrl ?? null,
    position: (row.position ?? 'hero') as Banner['position'],
    status,
    startsAt,
    endsAt,
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    derivedState: deriveBannerState({ status, startsAt, endsAt }),
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt as unknown as string),
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : (row.updatedAt as unknown as string),
  };
}

// Legacy bulk-PUT comparator. Kept for the unchanged
// `/api/admin/banners/bulk` endpoint; not used by the revamped UI.
export function normalizeForCompare(banners: Banner[]) {
  return banners
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((b) => ({
      id: b.id,
      isActive: b.isActive,
      displayOrder: b.displayOrder,
    }));
}

export function areBannersEqual(a: Banner[], b: Banner[]) {
  if (a.length !== b.length) return false;
  const na = normalizeForCompare(a);
  const nb = normalizeForCompare(b);
  return na.every((x, i) => {
    const y = nb[i];
    return (
      y &&
      x.id === y.id &&
      x.isActive === y.isActive &&
      x.displayOrder === y.displayOrder
    );
  });
}
