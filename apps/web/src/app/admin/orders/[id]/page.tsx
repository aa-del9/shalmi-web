import { ComingSoonShell } from '@/modules/admin/admin-dashboard/components/coming-soon';

export default function AdminOrderDetailPage() {
  return (
    <ComingSoonShell
      title="Order detail"
      trail={['Operations', 'Orders', 'Detail']}
      description="The admin-side order detail page is coming soon. For now, vendor sub-orders can be reviewed from /vendor/orders."
    />
  );
}
