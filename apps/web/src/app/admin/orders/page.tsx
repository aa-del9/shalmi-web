import { ComingSoonShell } from '@/modules/admin/admin-dashboard/components/coming-soon';

export default function AdminOrdersPage() {
  return (
    <ComingSoonShell
      title="Orders"
      trail={['Operations', 'Orders']}
      description="A consolidated cross-vendor order list lands in a follow-up milestone."
    />
  );
}
