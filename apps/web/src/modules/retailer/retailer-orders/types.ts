export type RetailerOrderItem = {
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

export type RetailerSubOrder = {
  id: string;
  orderId: string;
  status: string;
  codAmount: number;
  itemsTotal: number;
  shippingFeeCustomer: number;
  weightGrams: number;
  handedAt: string | null;
  createdAt: string;
  items: RetailerOrderItem[];
};

export type RetailerOrder = {
  id: string;
  displayId: string;
  status: string;
  totalItemsCost: number;
  totalShippingCost: number;
  grandTotal: number;
  shippingCity: string;
  createdAt: string;
  subOrders: RetailerSubOrder[];
};

export type RetailerOrdersSummary = {
  count: number;
  lifetimeTotalCents: number;
};

export type RetailerOrdersResponse = {
  orders: RetailerOrder[];
  summary: RetailerOrdersSummary;
};

export type RetailerOrdersSort = 'newest' | 'oldest';
