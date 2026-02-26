import { relations } from 'drizzle-orm';
import { products } from './products';
import { categories } from './categories';
import { productCategories } from './product-categories';

export const categoriesRelations = relations(categories, ({ many }) => ({
  productCategories: many(productCategories, {
    relationName: 'categoryToProductCategories',
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  productCategories: many(productCategories, {
    relationName: 'productToProductCategories',
  }),
}));

export const productCategoriesRelations = relations(
  productCategories,
  ({ one }) => ({
    product: one(products, {
      fields: [productCategories.productId],
      references: [products.id],
    }),
    category: one(categories, {
      fields: [productCategories.categoryId],
      references: [categories.id],
    }),
  })
);
