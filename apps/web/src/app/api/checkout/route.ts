import type { NextRequest } from 'next/server';
import { eq, inArray, asc } from 'drizzle-orm';
import {
  db,
  products,
  productPriceTiers,
  orders,
  subOrders,
  orderItems,
} from '@repo/database';
import { checkoutCartPayloadSchema } from '@repo/schemas/orders/checkout';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireSession } from '@/modules/auth/server/guards/require-session';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';

function generateDisplayId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

function resolveTierPrice(
  tiers: { minQty: number; maxQty: number | null; priceCents: number }[],
  quantity: number
): number {
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const tier = sorted[i]!;
    if (quantity >= tier.minQty) {
      if (tier.maxQty === null || quantity <= tier.maxQty) {
        return tier.priceCents;
      }
    }
  }
  return sorted[0]?.priceCents ?? 0;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    requireSession(session);

    const userId = (session.user as { id: string }).id;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError('Invalid JSON body', 400);
    }

    const parsed = checkoutCartPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Invalid cart payload', 400);
    }

    const { items: cartItems } = parsed.data;
    const productIds = cartItems.map((i) => i.productId);

    const dbProducts = await db
      .select({
        id: products.id,
        vendorId: products.vendorId,
        name: products.name,
        weightGrams: products.weightGrams,
        stock: products.stock,
        version: products.version,
      })
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        return jsonError(`Product not found: ${item.productId}`, 400);
      }
      if (product.stock < item.quantity) {
        return jsonError(
          `Insufficient stock for "${product.name}". Available: ${product.stock}`,
          400
        );
      }
    }

    const allTiers = await db
      .select({
        productId: productPriceTiers.productId,
        minQty: productPriceTiers.minQty,
        maxQty: productPriceTiers.maxQty,
        priceCents: productPriceTiers.priceCents,
      })
      .from(productPriceTiers)
      .where(inArray(productPriceTiers.productId, productIds))
      .orderBy(asc(productPriceTiers.minQty));

    const tiersByProduct = new Map<
      string,
      { minQty: number; maxQty: number | null; priceCents: number }[]
    >();
    for (const tier of allTiers) {
      const list = tiersByProduct.get(tier.productId) ?? [];
      list.push(tier);
      tiersByProduct.set(tier.productId, list);
    }

    // Group items by vendor
    const vendorGroups = new Map<
      string,
      {
        productId: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        weightGrams: number;
      }[]
    >();

    for (const item of cartItems) {
      const product = productMap.get(item.productId)!;
      const tiers = tiersByProduct.get(item.productId) ?? [];
      const unitPrice = resolveTierPrice(tiers, item.quantity);
      const totalPrice = unitPrice * item.quantity;

      const group = vendorGroups.get(product.vendorId) ?? [];
      group.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        weightGrams: product.weightGrams * item.quantity,
      });
      vendorGroups.set(product.vendorId, group);
    }

    const displayId = generateDisplayId();
    let totalItemsCost = 0;

    for (const groupItems of vendorGroups.values()) {
      for (const gi of groupItems) {
        totalItemsCost += gi.totalPrice;
      }
    }

    const result = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          userId,
          displayId,
          totalItemsCost,
          totalShippingCost: 0,
          grandTotal: totalItemsCost,
          status: 'processing',
        })
        .returning({ id: orders.id, displayId: orders.displayId });

      if (!order) throw new Error('Order insert failed');

      for (const [vendorId, groupItems] of vendorGroups.entries()) {
        const itemsTotal = groupItems.reduce((s, i) => s + i.totalPrice, 0);
        const weightGrams = groupItems.reduce((s, i) => s + i.weightGrams, 0);

        const [subOrder] = await tx
          .insert(subOrders)
          .values({
            orderId: order.id,
            vendorId,
            status: 'pending',
            weightGrams,
            codAmount: itemsTotal,
            itemsTotal,
            shippingFeeCustomer: 0,
            coolieFeeReimbursement: 0,
            courierCost: 0,
            platformCommission: 0,
          })
          .returning({ id: subOrders.id });

        if (!subOrder) throw new Error('Sub-order insert failed');

        await tx.insert(orderItems).values(
          groupItems.map((gi) => ({
            subOrderId: subOrder.id,
            productId: gi.productId,
            quantity: gi.quantity,
            unitPrice: gi.unitPrice,
            totalPrice: gi.totalPrice,
          }))
        );
      }

      // Decrement stock for each product
      for (const item of cartItems) {
        const product = productMap.get(item.productId)!;
        await tx
          .update(products)
          .set({ stock: product.stock - item.quantity })
          .where(eq(products.id, item.productId));
      }

      return order;
    });

    return jsonSuccess(
      { orderId: result.id, displayId: result.displayId },
      undefined,
      201
    );
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === AUTH_GUARD_ERRORS.SESSION_REQUIRED) {
        return jsonError(err.message, 401);
      }
    }
    console.error('POST /api/checkout error:', err);
    return jsonError('Failed to place order. Please try again.', 500);
  }
}
