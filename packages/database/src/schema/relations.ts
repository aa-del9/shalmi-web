import { relations } from 'drizzle-orm';
import { user } from './auth';
import { products } from './products';
import { categories } from './categories';
import { productCategories } from './product-categories';
import { productPackTiers } from './product-pack-tiers';
import { orders } from './orders';
import { subOrders } from './sub-orders';
import { orderItems } from './order-items';
import { productReviews } from './product-reviews';
import { vendors } from './vendors';

export const categoriesRelations = relations(categories, ({ many }) => ({
  productCategories: many(productCategories, {
    relationName: 'categoryToProductCategories',
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [products.vendorId],
    references: [vendors.id],
  }),
  productCategories: many(productCategories, {
    relationName: 'productToProductCategories',
  }),
  productPackTiers: many(productPackTiers, {
    relationName: 'productToProductPackTiers',
  }),
  reviews: many(productReviews, {
    relationName: 'productToReviews',
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

export const productPackTiersRelations = relations(
  productPackTiers,
  ({ one }) => ({
    product: one(products, {
      fields: [productPackTiers.productId],
      references: [products.id],
      relationName: 'productToProductPackTiers',
    }),
  })
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  subOrders: many(subOrders),
}));

export const subOrdersRelations = relations(subOrders, ({ one, many }) => ({
  order: one(orders, {
    fields: [subOrders.orderId],
    references: [orders.id],
  }),
  vendor: one(vendors, {
    fields: [subOrders.vendorId],
    references: [vendors.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  subOrder: one(subOrders, {
    fields: [orderItems.subOrderId],
    references: [subOrders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
    relationName: 'productToReviews',
  }),
  retailer: one(user, {
    fields: [productReviews.retailerId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  orders: many(orders),
  reviews: many(productReviews),
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  products: many(products),
  subOrders: many(subOrders),
}));
