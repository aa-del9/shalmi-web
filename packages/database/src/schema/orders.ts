import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { user } from './auth'; // Assuming auth schema exists

export const orders = pgTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  displayId: text('display_id').notNull().unique(), // The user-facing ID (e.g., #ORD-101)
  
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  
  // Aggregates for UI display only (sum of sub-orders)
  totalItemsCost: integer('total_items_cost').notNull(), 
  totalShippingCost: integer('total_shipping_cost').notNull(),
  grandTotal: integer('grand_total').notNull(),
  
  status: text('status').notNull(), // 'processing', 'partially_fulfilled', 'completed'
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});