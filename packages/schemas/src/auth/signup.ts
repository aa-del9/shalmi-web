/**
 * Buyer signup payloads (Batch 7). Single discriminated union so the
 * post-signup API can `parse` once and TypeScript narrows on the
 * discriminator. Per buyer-signup-shopkeeper Q11(a).
 *
 * Generic variant: name + retailerType only. Shopkeeper variant adds
 * shopName + shopAddress (the columns land alongside the shopkeeper
 * signup screen — until then the shopkeeper variant is schema-defined
 * but not yet served at the route).
 */

import { z } from 'zod';

const baseFields = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be 80 characters or fewer')
    .regex(
      /^[\p{L}\s.'-]+$/u,
      'Name may only contain letters, spaces, apostrophes, hyphens and full stops'
    ),
});

export const signupGenericSchema = baseFields.extend({
  retailerType: z.literal('generic'),
});

export const signupShopkeeperSchema = baseFields.extend({
  retailerType: z.literal('shopkeeper'),
  shopName: z
    .string()
    .min(2, 'Shop name must be at least 2 characters')
    .max(80, 'Shop name must be 80 characters or fewer'),
  shopAddress: z
    .string()
    .min(10, 'Shop address must be at least 10 characters')
    .max(300, 'Shop address must be 300 characters or fewer'),
});

export const signupSchema = z.discriminatedUnion('retailerType', [
  signupGenericSchema,
  signupShopkeeperSchema,
]);

export type SignupGenericPayload = z.infer<typeof signupGenericSchema>;
export type SignupShopkeeperPayload = z.infer<typeof signupShopkeeperSchema>;
export type SignupPayload = z.infer<typeof signupSchema>;
