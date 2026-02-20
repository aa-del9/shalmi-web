/**
 * Zod schemas for product price tiers (form and validation).
 * Validates: no gaps in quantity ranges, prices strictly decreasing as quantity increases.
 */

import { z } from 'zod';

const tierRowSchema = z.object({
  minQty: z.number().int().positive(),
  maxQty: z.number().int().positive().nullable(),
  priceCents: z.number().int().positive(),
});

export type TierRow = z.infer<typeof tierRowSchema>;

const tierRowsArraySchema = z.array(tierRowSchema).min(1);

/**
 * Form/API schema for tier rows: no gaps between ranges, prices strictly decreasing.
 */
export const productPriceTiersFormSchema = tierRowsArraySchema.superRefine(
  (tiers, ctx) => {
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      if (tier === undefined) continue;

      if (i === 0) {
        if (tier.minQty !== 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'First tier must start at minQty 1',
            path: [i, 'minQty'],
          });
        }
      } else {
        const prev = tiers[i - 1];
        if (prev === undefined) continue;
        const expectedMin = (prev.maxQty ?? prev.minQty) + 1;
        if (tier.minQty !== expectedMin) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Tiers must have no gaps: expected minQty ${expectedMin} (previous maxQty + 1)`,
            path: [i, 'minQty'],
          });
        }
      }

      if (i > 0) {
        const current = tiers[i];
        const previous = tiers[i - 1];
        if (
          current !== undefined &&
          previous !== undefined &&
          current.priceCents >= previous.priceCents
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Prices must decrease as quantity increases',
            path: [i, 'priceCents'],
          });
        }
      }
    }
  }
);

export type ProductPriceTiersForm = z.infer<typeof productPriceTiersFormSchema>;
