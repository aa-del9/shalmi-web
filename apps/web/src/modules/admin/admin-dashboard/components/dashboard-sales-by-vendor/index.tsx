'use client';

import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

// Per scope-cut "Admin analytics dashboard" — Sales-by-vendor aggregations
// DEFERRED. Render an empty state with a CTA per Q-SBV-2 binding answer.
export function DashboardSalesByVendor() {
  return (
    <section
      aria-label="Sales by vendor"
      className="border-rule flex flex-col gap-4 rounded-md border bg-white p-5"
    >
      <header className="flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-ink text-base font-bold">Sales by vendor</h2>
          <p className="text-ink-3 text-xs">Coming soon</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={ABSOLUTE_ROUTES.ADMIN_VENDORS}>See all vendors</Link>
        </Button>
      </header>
      <div className="border-rule bg-paper-2 text-ink-3 rounded-md border p-6 text-center text-xs">
        Per-vendor sales charts will appear here once analytics ships.
      </div>
    </section>
  );
}
