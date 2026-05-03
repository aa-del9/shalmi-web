import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const vendors = pgTable('vendors', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  displayId: text('display_id').notNull().unique(),
  fullName: text('full_name'),
  shopName: text('shop_name').notNull(),
  city: text('city').notNull().default(''),
  address: text('address'),
  hub: text('hub').notNull(),
  logoUrl: text('logo_url'),
  bankName: text('bank_name').notNull(),
  accountTitle: text('account_title').notNull(),
  iban: text('iban').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  // Distinct from `deletedAt` (hard delete): `deactivatedAt` is set when
  // an admin flips `isActive=false`, used by admin-dashboard KPI 4
  // (Active Vendors trend). Per Batch 4 plan + admin-dashboard Q-AUD-1.
  deactivatedAt: timestamp('deactivated_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
