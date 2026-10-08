import { Truck } from 'lucide-react';

/**
 * Static delivery card per buyer-product gap-analysis Q18 STUBBED:
 * "MNP delivery · 1–3 days" placeholder. Real weight-tier resolution
 * is DEFERRED until the weight-gauge subsystem ships.
 */
export function PdpDeliveryCard() {
  return (
    <section className="rounded-md border-[1.5px] border-rule-2 bg-paper-2 p-4">
      <div className="flex items-start gap-3">
        <Truck
          className="mt-0.5 size-5 text-green-700"
          aria-hidden
          strokeWidth={1.75}
        />
        <div className="space-y-1">
          <p className="text-sm font-bold text-ink">MNP delivery</p>
          <p className="text-xs text-ink-3">
            Estimated 1–3 days · Cash on Delivery available
          </p>
        </div>
      </div>
    </section>
  );
}
