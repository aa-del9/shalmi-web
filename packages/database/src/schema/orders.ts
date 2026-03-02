import { pgTable, text, timestamp, integer, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { addresses } from './addresses';

export const orders = pgTable('orders', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  displayId: text('display_id').notNull().unique(), // The user-facing ID (e.g., #ORD-101)

  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  // Shipping snapshot at order time
  shippingName: text('shipping_name').notNull(),
  shippingPhone: text('shipping_phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  shippingCity: text('shipping_city').notNull(),
  addressId: uuid('address_id').references(() => addresses.id),

  // Aggregates for UI display only (sum of sub-orders)
  totalItemsCost: integer('total_items_cost').notNull(),
  totalShippingCost: integer('total_shipping_cost').notNull(),
  grandTotal: integer('grand_total').notNull(),

  status: text('status').notNull(), // 'processing', 'partially_fulfilled', 'completed'

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
