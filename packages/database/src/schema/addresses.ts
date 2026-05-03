import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  recipientName: text('recipient_name').notNull(),
  recipientPhone: text('recipient_phone').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  // Batch 5 (buyer-settings) — STUBBED postal_code + province per
  // gap-analysis Q13/Q14: free-text, optional, no regex.
  // TODO(post-v1): tighten validation per scope-cut Postal-code feature.
  postalCode: text('postal_code'),
  province: text('province'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
