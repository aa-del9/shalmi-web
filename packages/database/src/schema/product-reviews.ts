import { pgTable, text, timestamp, integer, unique } from 'drizzle-orm/pg-core';
import { products } from './products';
import { user } from './auth';

export const productReviews = pgTable(
  'product_reviews',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    retailerId: text('retailer_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [unique('one_review_per_product').on(t.retailerId, t.productId)]
);
