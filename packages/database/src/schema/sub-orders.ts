import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { vendors } from './vendors';

export const subOrders = pgTable('sub_orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  vendorId: text('vendor_id')
    .notNull()
    .references(() => vendors.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  handedAt: timestamp('handed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
