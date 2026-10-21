'use client';

import { use } from 'react';
import { RetailerReorder } from '@/modules/retailer/retailer-reorder';

export default function ProfileOrderReorderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <RetailerReorder orderId={id} />;
}
