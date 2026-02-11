import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const orders = pgTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userOrderId: text('user_order_id').notNull().unique(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  totalDeliveryFeeCents: integer('total_delivery_fee_cents').notNull(),
  status: text('status').notNull(),
  needsWalletRefund: boolean('needs_wallet_refund').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
