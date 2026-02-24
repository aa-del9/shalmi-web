'use client';

import { useParams } from 'next/navigation';
import { AddProductForm } from '@/modules/vendor/vendor-products/modules/add-product/add-product-form';

export default function VendorEditProductPage() {
  const params = useParams();
  const productId = typeof params.id === 'string' ? params.id : null;

  return (
    <div className="space-y-6">
      <h1 className="text-foreground text-2xl font-semibold">Edit Product</h1>
      <AddProductForm productId={productId} />
    </div>
  );
}
