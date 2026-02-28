import { relations } from 'drizzle-orm';
import { products } from './products';
import { categories } from './categories';
import { productCategories } from './product-categories';
import { productPriceTiers } from './product-price-tiers';

export const categoriesRelations = relations(categories, ({ many }) => ({
  productCategories: many(productCategories, {
    relationName: 'categoryToProductCategories',
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  productCategories: many(productCategories, {
    relationName: 'productToProductCategories',
  }),
  productPriceTiers: many(productPriceTiers, {
    relationName: 'productToProductPriceTiers',
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

export const productPriceTiersRelations = relations(
  productPriceTiers,
  ({ one }) => ({
    product: one(products, {
      fields: [productPriceTiers.productId],
      references: [products.id],
      relationName: 'productToProductPriceTiers',
    }),
  })
);
