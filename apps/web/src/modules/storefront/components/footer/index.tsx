import Link from 'next/link';

/**
 * Pencil bid1Y/LSS70 (desktop) and X0SzkF/wmenE (mobile) — ink-bg
 * marketing footer.
 *
 * Per buyer-home gap-analysis Q6 (binding): drop social icons; use
 * `ink` background as drawn; bottom row has city list + © string.
 *
 * Per Q15 (binding STUBBED): all footer links are `#` placeholders
 * until the marketing pages ship in a follow-up batch.
 *
 * This footer is rendered by `(storefront)/layout.tsx` so it appears
 * on every storefront page. The buyer-orders screen (already shipped
 * in Batch 1) retroactively gets the new footer — shared chrome
 * change, no behavior delta.
 */

interface FooterColumn {
  eyebrow: string;
  links: { label: string; href: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    eyebrow: 'For buyers',
    links: [
      { label: 'Browse catalog', href: '/' },
      { label: "Today's lowest", href: '/#best-prices' },
      { label: 'My orders', href: '/profile/orders' },
      // TODO(post-v1): wire `/profile/orders/[lastDeliveredId]/reorder` once Batch 5 ships.
      { label: 'Quick reorder', href: '#' },
    ],
  },
  {
    eyebrow: 'Help',
    // TODO(post-v1): wire all four links once footer marketing pages ship.
    links: [
      { label: 'FAQ', href: '#' },
      { label: 'Contact support', href: '#' },
      { label: 'Returns & refunds', href: '#' },
      { label: 'Delivery hubs', href: '#' },
    ],
  },
  {
    eyebrow: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
];

export function StorefrontFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-10 md:px-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-12">
          {/* Column 1 — brand + description (desktop only; mobile collapses
              to the eyebrow columns). */}
          <div className="hidden flex-col gap-4 md:flex">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-paper font-sans text-base font-extrabold text-ink">
                S
              </span>
              <span className="font-sans text-lg font-extrabold tracking-[-0.01em] text-white">
                Shalmi Mart
              </span>
            </div>
            <p className="text-sm leading-[1.6] text-white/70">
              A single-warehouse wholesale platform that consolidates your
              weekly restock into one trusted, tier-priced delivery.
            </p>
          </div>

          {COLUMNS.map((col, idx) => (
            <div
              key={col.eyebrow}
              className={
                // Mobile shows BUYERS + HELP only (per Pencil wmenE/eeoM1).
                // Hide COMPANY on mobile.
                idx === 2 ? 'hidden md:flex md:flex-col md:gap-3' : 'flex flex-col gap-3'
              }
            >
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
                {col.eyebrow}
              </span>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="text-sm text-white/85 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row — desktop: © · TERMS · PRIVACY (left) and city list
            (right). Mobile: centered © string only. */}
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/15 pt-5 md:mt-12 md:flex-row md:items-center md:gap-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/55 md:text-[11px]">
            © {new Date().getFullYear()} Shalmi Mart
            <span className="hidden md:inline">
              <span className="mx-2 text-white/30" aria-hidden>·</span>
              Terms
              <span className="mx-2 text-white/30" aria-hidden>·</span>
              Privacy
            </span>
          </p>
          <p className="hidden font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white/55 md:block">
            Gujranwala · Lahore · Karachi
          </p>
        </div>
      </div>
    </footer>
  );
}
