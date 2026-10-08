import { pgTable, text, timestamp, integer, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { addresses } from './addresses';

export const orders = pgTable('orders', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  displayId: text('display_id').notNull().unique(), // The user-facing ID (e.g., #ORD-101)

  // Per OQ-G(b) (Batch 7) — userId is nullable so guest orders can be
  // placed without a user row. Either userId OR guestSessionId must be
  // set; constraint enforced in /api/checkout, not at the DB layer.
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),

  // Per OQ-G(b) — cart-store guest identifier carried on the checkout
  // payload for orders placed without a session.
  guestSessionId: text('guest_session_id'),

  // Shipping snapshot at order time
  shippingName: text('shipping_name').notNull(),
  shippingPhone: text('shipping_phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  shippingCity: text('shipping_city').notNull(),
  // Per buyer-checkout one-time-addr Q14(a) — additive flat columns
  // matching the existing shippingName/Phone/Address/City pattern. Both
  // nullable; legacy orders predate them.
  shippingPostalCode: text('shipping_postal_code'),
  shippingProvince: text('shipping_province'),
  addressId: uuid('address_id').references(() => addresses.id),

  // Aggregates for UI display only (sum of sub-orders)
  totalItemsCost: integer('total_items_cost').notNull(),
  totalShippingCost: integer('total_shipping_cost').notNull(),
  grandTotal: integer('grand_total').notNull(),

  status: text('status').notNull(), // 'processing', 'partially_fulfilled', 'completed'

  // Optional rider notes captured at checkout (max 500 chars enforced at
  // API; per buyer-checkout gap-analysis Q3).
  riderNotes: text('rider_notes'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
