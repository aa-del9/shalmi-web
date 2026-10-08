import type { NextRequest } from 'next/server';
import { and, asc, eq, inArray } from 'drizzle-orm';
import {
  db,
  orders,
  subOrders,
  orderItems,
  products,
  productPackTiers,
  productReviews,
  vendors,
} from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireSession } from '@/modules/auth/server/guards/require-session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    requireSession(session);

    const userId = (session.user as { id: string }).id;
    const { id: orderId } = await params;

    const [order] = await db
      .select({
        id: orders.id,
        displayId: orders.displayId,
        status: orders.status,
        totalItemsCost: orders.totalItemsCost,
        totalShippingCost: orders.totalShippingCost,
        grandTotal: orders.grandTotal,
        shippingName: orders.shippingName,
        shippingPhone: orders.shippingPhone,
        shippingAddress: orders.shippingAddress,
        shippingCity: orders.shippingCity,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);

    if (!order) {
      return jsonError('Order not found', 404);
    }

    const subOrderRows = await db
      .select({
        id: subOrders.id,
        orderId: subOrders.orderId,
        status: subOrders.status,
        codAmount: subOrders.codAmount,
        itemsTotal: subOrders.itemsTotal,
        shippingFeeCustomer: subOrders.shippingFeeCustomer,
        createdAt: subOrders.createdAt,
      })
      .from(subOrders)
      .where(eq(subOrders.orderId, orderId));

    const subOrderIds = subOrderRows.map((s) => s.id);

    let itemRows: {
      id: string;
      subOrderId: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      productName: string;
      productSlug: string;
      productImages: unknown;
      productVendorId: string;
      productPackSize: number;
      productPackWeightGrams: number;
      productUnitLabel: string | null;
      productPricePerUnitCents: number | null;
      productPackMrpCents: number | null;
      productStock: number;
      productLowStockThreshold: number;
    }[] = [];

    if (subOrderIds.length > 0) {
      itemRows = await db
        .select({
          id: orderItems.id,
          subOrderId: orderItems.subOrderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          productName: products.name,
          productSlug: products.slug,
          productImages: products.images,
          productVendorId: products.vendorId,
          productPackSize: products.packSize,
          productPackWeightGrams: products.packWeightGrams,
          productUnitLabel: products.unitLabel,
          productPricePerUnitCents: products.pricePerUnitCents,
          productPackMrpCents: products.packMrpCents,
          productStock: products.stock,
          productLowStockThreshold: products.lowStockThreshold,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(inArray(orderItems.subOrderId, subOrderIds));
    }

    // Fetch user's existing reviews for all products in this order
    const productIds = [...new Set(itemRows.map((i) => i.productId))];
    let reviewedProductIds: Set<string> = new Set();

    if (productIds.length > 0) {
      const reviews = await db
        .select({ productId: productReviews.productId })
        .from(productReviews)
        .where(
          and(
            eq(productReviews.retailerId, userId),
            inArray(productReviews.productId, productIds)
          )
        );
      reviewedProductIds = new Set(reviews.map((r) => r.productId));
    }

    // Fetch active pack tiers per product (for cart-store hydration on
    // the Reorder screen). Empty array when a product has no tiers.
    const packTierRows =
      productIds.length > 0
        ? await db
            .select({
              id: productPackTiers.id,
              productId: productPackTiers.productId,
              packQty: productPackTiers.packQty,
              pricePerPackCents: productPackTiers.pricePerPackCents,
              badge: productPackTiers.badge,
              isDefault: productPackTiers.isDefault,
            })
            .from(productPackTiers)
            .where(inArray(productPackTiers.productId, productIds))
            .orderBy(asc(productPackTiers.packQty))
        : [];

    const tiersByProduct = new Map<string, typeof packTierRows>();
    for (const tier of packTierRows) {
      const list = tiersByProduct.get(tier.productId) ?? [];
      list.push(tier);
      tiersByProduct.set(tier.productId, list);
    }

    // Vendor names (used by cart-store push payload).
    const vendorIds = [...new Set(itemRows.map((i) => i.productVendorId))];
    let vendorById: Map<string, string> = new Map();
    if (vendorIds.length > 0) {
      const vendorRows = await db
        .select({ id: vendors.id, shopName: vendors.shopName })
        .from(vendors)
        .where(inArray(vendors.id, vendorIds));
      vendorById = new Map(vendorRows.map((v) => [v.id, v.shopName]));
    }

    const itemsBySubOrder = new Map<string, typeof itemRows>();
    for (const item of itemRows) {
      const list = itemsBySubOrder.get(item.subOrderId) ?? [];
      list.push(item);
      itemsBySubOrder.set(item.subOrderId, list);
    }

    const data = {
      ...order,
      subOrders: subOrderRows.map((sub) => ({
        ...sub,
        items: (itemsBySubOrder.get(sub.id) ?? []).map((item) => {
          const tiers = tiersByProduct.get(item.productId) ?? [];
          return {
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            isReviewed: reviewedProductIds.has(item.productId),
            product: {
              name: item.productName,
              slug: item.productSlug,
              imageUrl:
                (item.productImages as { url: string }[])?.[0]?.url ?? null,
              imageRecord:
                ((item.productImages as { url: string; blurHash: string | null }[])?.[0]) ??
                null,
              vendorId: item.productVendorId,
              vendorName: vendorById.get(item.productVendorId) ?? null,
              packSize: item.productPackSize,
              packWeightGrams: item.productPackWeightGrams,
              unitLabel: item.productUnitLabel,
              pricePerUnitCents: item.productPricePerUnitCents,
              packMrpCents: item.productPackMrpCents,
              stock: item.productStock,
              lowStockThreshold: item.productLowStockThreshold,
              packTiers: tiers.map((t) => ({
                id: t.id,
                packQty: t.packQty,
                pricePerPackCents: t.pricePerPackCents,
                badge: t.badge,
                isDefault: t.isDefault,
              })),
            },
          };
        }),
      })),
    };

    return jsonSuccess(data);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === AUTH_GUARD_ERRORS.SESSION_REQUIRED) {
        return jsonError(err.message, 401);
      }
    }
    console.error('GET /api/retailer/orders/[id] error:', err);
    return jsonError('Failed to load order details', 500);
  }
}
