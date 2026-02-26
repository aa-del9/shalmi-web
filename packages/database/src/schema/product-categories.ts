import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { products } from './products';
import { categories } from './categories';

export const productCategories = pgTable(
  'product_categories',
  {
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.categoryId] }),
  ]
);
