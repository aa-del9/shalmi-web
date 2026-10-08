import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@repo/ui/lib/utils';

/**
 * Pencil §3.2 — status stamp pill.
 *
 * Shared geometry: 1.5px stroke · radius 3 · padding [3px, 8px] ·
 * font-mono 11/700 · letter-spacing 0.08 · rotation -1° (the
 * distinctive "rotated stamp" look of the system).
 *
 * Variant tokens come straight from the Pencil swatches:
 *   success   → DELIVERED  (green-700 / green-bg / green-700)
 *   info      → AT MNP HUB (blue / blue-bg / blue)
 *   neutral   → PACKED     (ink / paper-2 / ink)
 *   warning   → DELAYED    (amber / amber-bg / amber)
 *   critical  → CANCELLED  (red / red-bg / red)
 *
 * Variants are styled by intent, not by literal label, so consumers can
 * map their own DB statuses (e.g. sub_orders.status) onto the right
 * visual via Q9 of 02-design-inventory.
 */
const stampVariants = cva(
  [
    'inline-flex items-center justify-center',
    'rounded-stamp border-[1.5px]',
    'px-2 py-[3px]',
    'font-mono text-[11px] font-bold uppercase',
    'tracking-[0.08em] leading-none whitespace-nowrap',
  ].join(' '),
  {
    variants: {
      variant: {
        success: 'border-green-700 bg-green-bg text-green-700',
        info: 'border-blue bg-blue-bg text-blue',
        neutral: 'border-ink bg-paper-2 text-ink',
        warning: 'border-amber bg-amber-bg text-amber',
        critical: 'border-red bg-red-bg text-red',
        // Per buyer-settings gap-analysis Q10: white-on-ink "DEFAULT" pill
        // for non-status badges (e.g. address default marker). Smallest
        // delta over a new primitive.
        inverse: 'border-ink bg-ink text-white',
      },
      rotated: {
        true: '-rotate-1',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      rotated: true,
    },
  }
);

function Stamp({
  className,
  variant,
  rotated,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof stampVariants>) {
  return (
    <span
      data-slot="stamp"
      className={cn(stampVariants({ variant, rotated }), className)}
      {...props}
    />
  );
}

export { Stamp, stampVariants };
