import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { products } from './products';

/**
 * Pack-based pricing tiers. Replaces the legacy `product_price_tiers`
 * (band model) per `02-design-inventory.md` §7 Q12. One row per discrete
 * "Buy N packs at Rs. X per pack" tier.
 */
export const productPackTiers = pgTable('product_pack_tiers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  packQty: integer('pack_qty').notNull(),
  pricePerPackCents: integer('price_per_pack_cents').notNull(),
  // 'save' | 'best' | null. Vendor-pinned per gap-analysis Q10/Q17.
  badge: text('badge'),
  // Default-selected tier on PDP first paint (per gap-analysis Q12).
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
