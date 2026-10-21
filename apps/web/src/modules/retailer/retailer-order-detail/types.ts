import type { ProductImageRecord } from '@repo/database';
import type { PackTier } from '@/modules/cart/types';

export type OrderDetailItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isReviewed: boolean;
  product: {
    name: string;
    slug: string;
    imageUrl: string | null;
    imageRecord: ProductImageRecord | null;
    vendorId: string;
    vendorName: string | null;
    packSize: number;
    packWeightGrams: number;
    unitLabel: string | null;
    pricePerUnitCents: number | null;
    packMrpCents: number | null;
    stock: number;
    lowStockThreshold: number;
    packTiers: PackTier[];
  };
};

export type OrderDetailSubOrder = {
  id: string;
  orderId: string;
  status: string;
  codAmount: number;
  itemsTotal: number;
  shippingFeeCustomer: number;
  createdAt: string;
  items: OrderDetailItem[];
};

export type OrderDetail = {
  id: string;
  displayId: string;
  status: string;
  totalItemsCost: number;
  totalShippingCost: number;
  grandTotal: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  createdAt: string;
  subOrders: OrderDetailSubOrder[];
};
