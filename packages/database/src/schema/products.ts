import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { vendors } from './vendors';

export type ProductImageRecord = {
  url: string;
  blurHash: string | null;
};

export const products = pgTable('products', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  vendorId: text('vendor_id')
    .notNull()
    .references(() => vendors.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  weightGrams: integer('weight_grams').notNull(),
  images: jsonb('images')
    .$type<ProductImageRecord[]>()
    .notNull()
    .default([]),
  stock: integer('stock').notNull().default(0),
  version: integer('version').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
