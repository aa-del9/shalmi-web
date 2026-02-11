import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { vendors } from './vendors';

export const vendorLedger = pgTable('vendor_ledger', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  vendorId: text('vendor_id')
    .notNull()
    .references(() => vendors.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  amountCents: integer('amount_cents').notNull(),
  referenceId: text('reference_id'),
  note: text('note'),
  actedBy: text('acted_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
