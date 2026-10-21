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
  internalName: text('internal_name'),
  eyebrow: text('eyebrow'),
  ctaLabel: text('cta_label'),
  imageUrl: text('image_url').notNull(),
  targetUrl: text('target_url'),
  position: text('position').notNull().default('hero'),
  status: text('status').notNull().default('paused'),
  startsAt: timestamp('starts_at'),
  endsAt: timestamp('ends_at'),
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
