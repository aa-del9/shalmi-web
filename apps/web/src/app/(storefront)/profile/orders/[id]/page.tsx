'use client';

import { use } from 'react';
import { RetailerOrderDetail } from '@/modules/retailer/retailer-order-detail';

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <RetailerOrderDetail orderId={id} />;
}
