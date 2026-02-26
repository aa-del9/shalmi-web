export type ProductImageItem = {
  url: string;
  blurHash: string | null;
};

export type VendorProductListItem = {
  id: string;
  name: string;
  slug: string;
  weightGrams: number;
  images: ProductImageItem[];
  stock: number;
  createdAt: string;
  categoryIds: string[];
};

export type VendorProductTierItem = {
  id?: string;
  minQty: number;
  maxQty: number | null;
  price: number;
};

export type VendorProductDetail = VendorProductListItem & {
  tiers: VendorProductTierItem[];
  categoryIds: string[];
};
