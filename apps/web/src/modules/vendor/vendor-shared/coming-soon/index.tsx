type ComingSoonProps = {
  /** Page title rendered as h1 */
  title: string;
  /** Eyebrow above the title (mono uppercase) */
  eyebrow?: string;
  /** One-line subtitle / description */
  description?: string;
};

// Placeholder shell for vendor surfaces that ship inert pending dedicated
// design work (e.g. Settings — vendor-dashboard gap-analysis Q3, Ledger —
// owned by Batch 6 of 05-batch-plan.md).
export function VendorComingSoonShell({
  title,
  eyebrow,
  description,
}: ComingSoonProps) {
  return (
    <div className="space-y-5">
      <div className="border-rule rounded-md border bg-white p-8 text-center">
        {eyebrow ? (
          <p className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.16em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-ink mt-2 text-2xl font-extrabold">{title}</h1>
        <p className="text-ink-3 mt-2 text-sm">
          {description ??
            'This surface is on the roadmap. Check back after the next milestone.'}
        </p>
      </div>
    </div>
  );
}
