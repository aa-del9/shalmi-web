import Link from 'next/link';

/**
 * Pencil bid1Y/FJuWj — full-bleed ink util strip above the storefront
 * header.
 *
 * Desktop only. On mobile the gap-analysis frames replace the entire
 * chrome with a purpose-built app bar (per buyer-home Q14, deferred to
 * Batch 6). Hide on mobile to avoid stacking under the existing
 * `StorefrontHeader`.
 *
 * Lang mini text per buyer-home gap-analysis Q1: STUBBED — visible-
 * but-inert. EN highlighted, اردو dim. No interactive control.
 */
export function UtilStrip() {
  return (
    <div className="hidden bg-ink text-white md:block">
      <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between px-10 text-[12px]">
        <nav className="flex items-center gap-5" aria-label="Utility">
          {/* TODO(post-v1): wire `/help` route once footer marketing pages ship. */}
          <Link href="#" className="text-white/85 transition-colors hover:text-white">
            Help
          </Link>
          {/* TODO(post-v1): wire to /profile/orders track-order surface (scope-cut Order tracking). */}
          <Link
            href="/profile/orders"
            prefetch={false}
            className="text-white/85 transition-colors hover:text-white"
          >
            Track order
          </Link>
          {/* TODO(post-v1): wire `/delivery-hubs` route once footer marketing pages ship. */}
          <Link href="#" className="text-white/85 transition-colors hover:text-white">
            MNP delivery hubs
          </Link>
        </nav>

        {/* TODO(post-v1): wire to LanguageToggle global state (Q1 STUBBED). */}
        <span
          className="font-mono text-[11px] font-bold tracking-[0.04em]"
          aria-hidden
        >
          <span className="text-white">EN</span>
          <span className="px-2 text-white/50">·</span>
          <span className="text-white/50" style={{ fontFamily: 'var(--font-ar)' }}>
            اردو
          </span>
        </span>
      </div>
    </div>
  );
}
