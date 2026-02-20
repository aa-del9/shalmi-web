import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { vendors } from './vendors';

export const subOrders = pgTable('sub_orders', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Relationships
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  vendorId: text('vendor_id')
    .notNull()
    .references(() => vendors.id, { onDelete: 'cascade' }),

  // LOGISTICS TRACKING
  status: text('status').notNull(), // 'pending', 'packed', 'handed_to_courier', 'delivered', 'cancelled'
  courierTrackingId: text('courier_tracking_id'), // Assigned by Courier API
  weightGrams: integer('weight_grams').notNull(), // Snapshot weight for calc

  // FINANCIALS: WHAT THE CUSTOMER PAYS (COD)
  // This is the amount printed on the sticker.
  // Formula: itemsTotal + shippingFeeCustomer
  codAmount: integer('cod_amount').notNull(),

  // FINANCIALS: COST BREAKDOWN
  itemsTotal: integer('items_total').notNull(),
  shippingFeeCustomer: integer('shipping_fee_customer').notNull(), // Amount charged to customer for shipping

  // FINANCIALS: VENDOR PAYOUT CALCULATION
  // We pay the vendor: (itemsTotal) + (coolieFeeReimbursement)
  coolieFeeReimbursement: integer('coolie_fee_reimbursement').notNull(), // The "Per Kg" amount we pay Vendor

  // FINANCIALS: PLATFORM COSTS (Internal)
  courierCost: integer('courier_cost').notNull(), // What we pay the Courier Service
  platformCommission: integer('platform_commission').notNull(), // Our markup

  handedAt: timestamp('handed_at'), // When vendor marked "Handed to Courier"
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
