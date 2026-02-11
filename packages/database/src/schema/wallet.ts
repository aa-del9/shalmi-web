import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const wallet = pgTable('wallet', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  balanceCents: integer('balance_cents').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
