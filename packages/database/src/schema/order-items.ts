import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
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

  quantity: integer('quantity').notNull(),

  // Snapshot price at time of purchase (Tiered Price)
  unitPrice: integer('unit_price').notNull(),
  totalPrice: integer('total_price').notNull(), // quantity * unitPrice

  createdAt: timestamp('created_at').notNull().defaultNow(),
});
