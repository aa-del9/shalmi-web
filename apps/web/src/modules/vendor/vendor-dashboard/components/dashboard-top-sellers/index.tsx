'use client';

// Top sellers card — STUBBED per scope-cut "Vendor sales analytics".
// Renders an empty-state shell pending a vendor analytics endpoint.
//
// TODO(post-v1): wire to a real `/api/vendor/dashboard/top-sellers`
// endpoint once the analytics subsystem ships.
export function DashboardTopSellers() {
  return (
    <section
      aria-label="Top sellers"
      className="border-rule flex flex-col rounded-md border bg-white"
    >
      <header className="border-rule border-b px-5 py-4 md:px-6 md:py-5">
        <p className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
          Top sellers · 30 days
        </p>
        <h2 className="text-ink mt-1 text-base font-bold">By units sold</h2>
      </header>
      <div className="text-ink-3 px-6 py-8 text-center text-sm">
        Live charts available soon.
      </div>
    </section>
  );
}
