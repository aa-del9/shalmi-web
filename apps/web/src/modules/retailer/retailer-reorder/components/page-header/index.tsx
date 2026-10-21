interface PageHeaderProps {
  displayId: string;
  createdAtIso: string;
  /** Mobile drops the order id segment per gap-analysis Q5. */
  mobile?: boolean;
}

import { formatEyebrowDate } from '../../utils/format';

/**
 * Pencil Xpmij (desktop) / f0MtP (mobile) — eyebrow + title + body copy.
 *
 * Per gap-analysis Q2 / Q3: literal copy adopted verbatim. Q4: uppercase
 * month date format.
 */
export function PageHeader({
  displayId,
  createdAtIso,
  mobile = false,
}: PageHeaderProps) {
  const eyebrow = mobile
    ? `REORDER · ${formatEyebrowDate(createdAtIso)}`
    : `REORDER · ORDER ${displayId} · ${formatEyebrowDate(createdAtIso)}`;
  return (
    <header>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-green-700 md:text-[11px]">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-sans text-[24px] font-extrabold tracking-[-0.02em] text-ink md:text-[36px]">
        Replenish last week&apos;s cart
      </h1>
      <p className="mt-2 max-w-[720px] font-sans text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
        Edit quantities or remove items, then add the whole list to your cart.
        Your weight gauge updates as you go.
      </p>
    </header>
  );
}
