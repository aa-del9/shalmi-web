import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const vendors = pgTable('vendors', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  shopName: text('shop_name').notNull(),
  city: text('city').notNull().default(''),
  hub: text('hub').notNull(),
  bankName: text('bank_name').notNull(),
  accountTitle: text('account_title').notNull(),
  iban: text('iban').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
