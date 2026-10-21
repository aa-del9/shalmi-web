import { ComingSoonShell } from '@/modules/admin/admin-dashboard/components/coming-soon';

export default function AdminProductsPage() {
  return (
    <ComingSoonShell
      title="Products"
      trail={['Catalog', 'Products']}
      description="A read-only cross-vendor product catalog lands in a follow-up milestone."
    />
  );
}
