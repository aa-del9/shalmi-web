export type VendorSubOrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    name: string;
    imageUrl: string | null;
  };
};

export type VendorSubOrder = {
  id: string;
  orderId: string;
  status: string;
  codAmount: number;
  itemsTotal: number;
  weightGrams: number;
  createdAt: string;
  updatedAt: string;
  orderDisplayId: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  items: VendorSubOrderItem[];
};

export type VendorOrdersMeta = {
  pendingCount: number;
};

export type VendorOrdersResponse = {
  subOrders: VendorSubOrder[];
  meta: VendorOrdersMeta;
};
