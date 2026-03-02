export type OrderDetailItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isReviewed: boolean;
  product: {
    name: string;
    imageUrl: string | null;
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
