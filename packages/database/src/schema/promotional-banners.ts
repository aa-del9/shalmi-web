import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { generateId } from '@repo/utils/id';

export const promotionalBanners = pgTable('promotional_banners', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId()),
  title: text('title').notNull(),
  imageUrl: text('image_url').notNull(),
  targetUrl: text('target_url'),
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
