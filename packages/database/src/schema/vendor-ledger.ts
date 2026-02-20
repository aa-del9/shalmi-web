import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { vendors } from './vendors';

export const vendorLedger = pgTable('vendor_ledger', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  vendorId: text('vendor_id')
    .notNull()
    .references(() => vendors.id, { onDelete: 'cascade' }),

  // 'credit' (We owe vendor) or 'debit' (Vendor owes us / Payout)
  direction: text('direction').notNull(),

  amount: integer('amount').notNull(),

  type: text('type').notNull(),
  // Types:
  // 'sale_revenue' (Product Cost)
  // 'logistics_reimbursement' (Coolie Fee)
  // 'payout' (Bank Transfer)
  // 'penalty' (If they packed wrong items)

  referenceId: text('reference_id'), // Link to subOrderId or PayoutId
  description: text('description'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
});
