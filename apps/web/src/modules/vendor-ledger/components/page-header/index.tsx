/**
 * Pencil `ldHd` / `c3aeuZ` — page header.
 *
 * Eyebrow ("FRIDAY PAYOUTS · WEEKLY") sits above a sans-36/800 title
 * and a 600w descriptor about cycle policy.
 */
export function PageHeader() {
  return (
    <header className="flex flex-col gap-3">
      <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-green-700">
        FRIDAY PAYOUTS · WEEKLY
      </p>
      <h1 className="text-[28px] font-extrabold leading-[1.1] text-ink md:text-[36px]">
        Ledger
      </h1>
      <p className="max-w-[600px] text-[15px] text-ink-2">
        Your earnings, paid every Friday for orders the buyer kept
        (returns and MNP fees deducted).
      </p>
    </header>
  );
}
