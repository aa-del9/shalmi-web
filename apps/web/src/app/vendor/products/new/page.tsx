import { AddProductForm } from '@/modules/vendor/vendor-products/modules/add-product/add-product-form';

export default function VendorNewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-foreground text-2xl font-semibold">
        Add New Product
      </h1>
      <AddProductForm />
    </div>
  );
}
