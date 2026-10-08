import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { products } from './products';
import { subOrders } from './sub-orders';

export const orderItems = pgTable('order_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  subOrderId: text('sub_order_id')
    .notNull()
    .references(() => subOrders.id, { onDelete: 'cascade' }),
  productId: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),

  // Quantity here counts PACKS (not individual units inside the pack), per
  // pack-pricing surface-map §7 Q14.
  quantity: integer('quantity').notNull(),

  // Snapshot price-per-pack at time of purchase.
  unitPrice: integer('unit_price').notNull(),
  totalPrice: integer('total_price').notNull(), // quantity * unitPrice

  // Pack-pricing snapshots so receipts/reorder remain stable when the
  // vendor later edits the product (per pack-pricing §7 Q11).
  packSizeAtPurchase: integer('pack_size_at_purchase').notNull().default(1),
  pricePerUnitAtPurchase: integer('price_per_unit_at_purchase'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
});
