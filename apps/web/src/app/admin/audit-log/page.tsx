import { ComingSoonShell } from '@/modules/admin/admin-dashboard/components/coming-soon';

export default function AdminAuditLogPage() {
  return (
    <ComingSoonShell
      title="Audit log"
      trail={['Operations', 'Audit log']}
      description="A full audit feed will appear here once write hooks ship across admin mutations."
    />
  );
}
