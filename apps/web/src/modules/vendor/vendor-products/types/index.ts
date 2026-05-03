import type { PackTierBadge } from '@repo/schemas/catalog/product';

export type ProductImageItem = {
  url: string;
  blurHash: string | null;
};

export type ProductRowStatus = 'active' | 'draft';

/** Display status pill — derived from row status + stock + threshold. */
export type ProductDisplayStatus = 'ACTIVE' | 'LOW_STOCK' | 'DRAFT' | 'OUT_OF_STOCK';

export type VendorProductListItem = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  brand: string | null;
  packWeightGrams: number;
  packSize: number;
  unitLabel: string | null;
  packWholesalePriceCents: number;
  images: ProductImageItem[];
  stock: number;
  lowStockThreshold: number;
  status: ProductRowStatus;
  createdAt: string;
  categoryIds: string[];
};

export type VendorProductPackTierItem = {
  id?: string;
  packQty: number;
  pricePerPackCents: number;
  badge: PackTierBadge | null;
  isDefault: boolean;
};

export type VendorProductDetail = VendorProductListItem & {
  unitWeightGrams: number | null;
  packMrpCents: number | null;
  pricePerUnitCents: number | null;
  packTiers: VendorProductPackTierItem[];
};

export type VendorProductsStats = {
  all: number;
  active: number;
  lowStock: number;
  drafts: number;
};

export type VendorProductsResponse = {
  rows: VendorProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  stats: VendorProductsStats;
};

export type VendorProductsStatusFilter = 'all' | 'active' | 'low-stock' | 'drafts';

export type VendorProductsSort = 'newest' | 'oldest' | 'stock-asc' | 'stock-desc';

export type VendorProductsFilters = {
  page: number;
  q: string;
  status: VendorProductsStatusFilter;
  categoryId: string | null;
  sort: VendorProductsSort;
};

/** Display-status helper used by both the table cell + the mobile card. */
export function deriveDisplayStatus(
  row: Pick<VendorProductListItem, 'status' | 'stock' | 'lowStockThreshold'>
): ProductDisplayStatus {
  if (row.status === 'draft') return 'DRAFT';
  if (row.stock <= 0) return 'OUT_OF_STOCK';
  if (row.stock <= row.lowStockThreshold) return 'LOW_STOCK';
  return 'ACTIVE';
}
