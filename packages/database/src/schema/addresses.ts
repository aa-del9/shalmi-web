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
  // `postal_code` + `province` are created by migration 0012 (Batch 5)
  // but the Drizzle field declarations are deferred until the operator
  // applies that migration to dev/staging — otherwise every
  // `select().from(addresses)` 500s with `column does not exist`. The
  // form still accepts the fields via Zod; they're silently dropped
  // until the DB has the columns + the schema fields are reinstated.
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
