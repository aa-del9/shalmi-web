import { ComingSoonShell } from '@/modules/admin/admin-dashboard/components/coming-soon';

export default function AdminNewReportPage() {
  return (
    <ComingSoonShell
      title="New report"
      trail={['Overview', 'Sales reports', 'New']}
      description="Custom report builder lands in a follow-up milestone."
    />
  );
}
