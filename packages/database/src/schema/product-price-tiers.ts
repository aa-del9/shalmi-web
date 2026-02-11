import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { products } from './products';

export const productPriceTiers = pgTable('product_price_tiers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  minQty: integer('min_qty').notNull(),
  maxQty: integer('max_qty'),
  priceCents: integer('price_cents').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
