import { AdminBreadcrumb } from '@/modules/admin/admin-layout/admin-breadcrumb';

// Q18 binding: mobile "Sales report" CTA routes here. Per scope-cut
// (Vendor sales analytics — STUBBED) the report itself is deferred;
// this is a placeholder shell. TODO(post-v1): wire to real analytics.
export default function VendorSalesReportPage() {
  return (
    <div className="space-y-5">
      <AdminBreadcrumb trail={['Catalog', 'Vendors', 'Sales report']} />
      <div className="border-rule rounded-md border bg-white p-8 text-center">
        <h1 className="text-ink text-2xl font-extrabold">Sales report</h1>
        <p className="text-ink-3 mt-2 text-sm">
          Per-vendor sales analytics will appear here in an upcoming
          milestone.
        </p>
      </div>
    </div>
  );
}
