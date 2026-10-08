import {
  Cookie,
  Coffee,
  ChefHat,
  GlassWater,
  Sparkles,
  Droplet,
  Lightbulb,
  ShoppingBasket,
} from 'lucide-react';

const TILES = [
  { icon: Cookie, label: 'Snacks' },
  { icon: Coffee, label: 'Tea' },
  { icon: ChefHat, label: 'Cooking' },
  { icon: GlassWater, label: 'Dairy' },
  { icon: Sparkles, label: 'Ghee' },
  { icon: Droplet, label: 'Detergent' },
  { icon: Lightbulb, label: 'Electrical' },
  { icon: ShoppingBasket, label: 'Daily' },
] as const;

/**
 * Mobile-only stylized mart-shelf strip per OQ-A — generic illustrations
 * (no brand-IP). 8 tiles in a 4×2 grid on an ink background, each cell
 * showing a lucide silhouette and a category caption. Per buyer-signup-
 * shopkeeper Q9(a) / Q10(a).
 */
export function MartShelfStrip() {
  return (
    <div className="-mx-4 mb-4 bg-ink px-4 py-5 md:hidden">
      <p className="text-center font-sans text-[15px] font-extrabold leading-tight text-paper">
        Set up your shop
      </p>
      <div
        aria-hidden
        className="mx-auto mt-4 grid max-w-[360px] grid-cols-4 gap-2"
      >
        {TILES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-sm border border-paper/15 bg-paper/5 text-paper"
          >
            <Icon className="size-5" strokeWidth={1.25} />
            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-paper/70">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
