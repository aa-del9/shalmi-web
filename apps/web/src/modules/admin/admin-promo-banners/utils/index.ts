import { Banner } from '../types';

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
