'use client';

import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

// Per scope-cut "Admin audit log" — STUBBED with empty-state. Writers
// will be wired in a follow-up audit-feature batch.
export function DashboardAuditLog() {
  return (
    <section
      aria-label="Audit log"
      className="border-rule flex flex-col gap-4 rounded-md border bg-white p-5"
    >
      <header className="flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-ink text-base font-bold">Audit log</h2>
          <p className="text-ink-3 text-xs">Recent admin actions</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={ABSOLUTE_ROUTES.ADMIN_AUDIT_LOG}>View all</Link>
        </Button>
      </header>
      <div className="border-rule bg-paper-2 text-ink-3 rounded-md border p-6 text-center text-xs">
        Recent admin actions will appear here once writers are wired.
      </div>
    </section>
  );
}
