/**
 * Zod schemas for product pack tiers (form + create-product API).
 *
 * Pack-based pricing model — replaces the legacy band-tier model. Each
 * tier is a discrete "Buy N packs at Rs. X per pack" row with optional
 * SAVE/BEST badge and an `isDefault` flag (vendor-pinned default
 * selection on PDP).
 */

import { z } from 'zod';

export const PACK_TIER_BADGES = ['save', 'best'] as const;
export type PackTierBadge = (typeof PACK_TIER_BADGES)[number];

const packTierRowSchema = z.object({
  packQty: z.number().int().positive(),
  pricePerPackCents: z.number().int().positive(),
  badge: z.enum(PACK_TIER_BADGES).nullable().optional(),
  isDefault: z.boolean().optional(),
});

export type PackTierRow = z.infer<typeof packTierRowSchema>;

/**
 * Create-product API: at least one tier; pack quantities strictly
 * increasing; per-pack prices strictly decreasing as pack qty increases;
 * exactly one row may have `isDefault: true`.
 */
export const productPackTiersSchema = z
  .array(packTierRowSchema)
  .min(1)
  .superRefine((tiers, ctx) => {
    let defaultCount = 0;
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      if (tier === undefined) continue;
      if (tier.isDefault) defaultCount += 1;

      if (i > 0) {
        const prev = tiers[i - 1];
        if (prev !== undefined) {
          if (tier.packQty <= prev.packQty) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                'Pack quantity must be strictly greater than the previous tier',
              path: [i, 'packQty'],
            });
          }
          if (tier.pricePerPackCents >= prev.pricePerPackCents) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Per-pack price must decrease as pack qty increases',
              path: [i, 'pricePerPackCents'],
            });
          }
        }
      }
    }

    if (defaultCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only one tier can be marked as the default',
        path: [],
      });
    }
  });

export type ProductPackTiersInput = z.infer<typeof productPackTiersSchema>;
