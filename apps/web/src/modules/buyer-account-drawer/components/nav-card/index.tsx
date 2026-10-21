import type { ReactNode } from 'react';

interface NavCardProps {
  children: ReactNode;
}

/**
 * Pencil `f8Z4Lu` / `m3NC` — white card with 1px rule, radius 8.
 * Children are `<NavRow>`s; the parent draws the outer border, rows
 * draw their own internal hairlines.
 */
export function NavCard({ children }: NavCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-rule bg-white">
      {children}
    </div>
  );
}

interface NavSectionLabelProps {
  children: ReactNode;
}

export function NavSectionLabel({ children }: NavSectionLabelProps) {
  return (
    <p className="px-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3">
      {children}
    </p>
  );
}
