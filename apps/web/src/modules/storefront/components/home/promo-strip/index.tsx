import { Truck } from 'lucide-react';

/**
 * Pencil bid1Y/mt4pg (desktop) and X0SzkF/tGknt (mobile) — full-bleed
 * green-2 marketing band.
 *
 * Per gap-analysis Q5 (binding STUBBED): static marketing copy. Cart
 * delivery line continues to use weight tiers regardless of the
 * advertised free-delivery threshold.
 *
 * TODO(post-v1): if the threshold becomes enforced business logic,
 * promote it to a `business-rules` constants module and check it in
 * cart-summary.
 */
export function HomePromoStrip() {
  return (
    <section className="bg-green-2 text-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-2.5 px-4 py-3.5 text-center md:px-10">
        <Truck className="size-4 shrink-0 md:size-[18px]" aria-hidden />
        <p className="text-[12px] leading-tight font-bold md:text-sm">
          Free delivery on orders over Rs. 5,000
          <span className="hidden md:inline">
            <span className="mx-2 text-white/70" aria-hidden>
              ·
            </span>
            <span className="font-normal text-white/85">
              Same-day cutoff 4 PM
            </span>
          </span>
        </p>
      </div>
    </section>
  );
}
