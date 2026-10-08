import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { vendors } from './vendors';

export type ProductImageRecord = {
  url: string;
  blurHash: string | null;
};

export type ProductStatus = 'active' | 'draft';

export const products = pgTable('products', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  vendorId: text('vendor_id')
    .notNull()
    .references(() => vendors.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  // Pack-pricing model (Batch 3 schema migration). `pack_weight_grams` is
  // per-pack net weight (used by checkout shipping math). `unit_weight_grams`
  // is per-unit (what one bottle/sachet inside the pack weighs); rendered
  // in the PDP title eyebrow.
  packWeightGrams: integer('pack_weight_grams').notNull(),
  packSize: integer('pack_size').notNull().default(1),
  unitWeightGrams: integer('unit_weight_grams'),
  unitLabel: text('unit_label'),
  packMrpCents: integer('pack_mrp_cents'),
  packWholesalePriceCents: integer('pack_wholesale_price_cents')
    .notNull()
    .default(0),
  pricePerUnitCents: integer('price_per_unit_cents'),
  images: jsonb('images').$type<ProductImageRecord[]>().notNull().default([]),
  stock: integer('stock').notNull().default(0),
  // Vendor product enrichment (Batch 4 schema migration). SKU is unique
  // per vendor (partial unique index — NULL allowed pre-backfill).
  // `lowStockThreshold` is per-product; the dashboard low-stock card
  // currently uses a constant fallback (Batch 4 watchout).
  // `status` is the light-version Active/Draft enum per scope-cut feature
  // "Active vs Draft product status (light version)".
  // TODO(post-v1): expand `status` to include `pending_review` once the
  // approval-workflow scope-cut feature lands.
  sku: text('sku'),
  brand: text('brand'),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
  status: text('status').$type<ProductStatus>().notNull().default('active'),
  version: integer('version').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
