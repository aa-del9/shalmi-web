import type { NextRequest } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import {
  db,
  products,
  productPackTiers,
  orders,
  subOrders,
  orderItems,
  addresses,
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

    const {
      items: cartItems,
      addressId: payloadAddressId,
      shippingAddress: payloadShippingAddress,
      riderNotes: payloadRiderNotes,
    } = parsed.data;

    let shippingName: string;
    let shippingPhone: string;
    let shippingAddress: string;
    let shippingCity: string;
    let orderAddressId: string | null = null;

    if (payloadAddressId) {
      const [addressRow] = await db
        .select()
        .from(addresses)
        .where(eq(addresses.id, payloadAddressId));

      if (!addressRow || addressRow.userId !== userId) {
        return jsonError('Invalid or unauthorized address', 400);
      }
      shippingName = addressRow.recipientName;
      shippingPhone = addressRow.recipientPhone;
      shippingAddress = addressRow.address;
      shippingCity = addressRow.city;
      orderAddressId = payloadAddressId;
    } else if (payloadShippingAddress) {
      shippingName = payloadShippingAddress.name;
      shippingPhone = payloadShippingAddress.phone;
      shippingAddress = payloadShippingAddress.address;
      shippingCity = payloadShippingAddress.city;
    } else {
      return jsonError('Provide addressId or shippingAddress', 400);
    }

    const productIds = cartItems.map((i) => i.productId);

    const dbProducts = await db
      .select({
        id: products.id,
        vendorId: products.vendorId,
        name: products.name,
        packWeightGrams: products.packWeightGrams,
        packSize: products.packSize,
        pricePerUnitCents: products.pricePerUnitCents,
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
          `Insufficient stock for "${product.name}". Available: ${product.stock} packs`,
          400
        );
      }
    }

    const allTiers = await db
      .select({
        productId: productPackTiers.productId,
        packQty: productPackTiers.packQty,
        pricePerPackCents: productPackTiers.pricePerPackCents,
      })
      .from(productPackTiers)
      .where(inArray(productPackTiers.productId, productIds));

    const tierByProductAndQty = new Map<string, number>();
    for (const tier of allTiers) {
      tierByProductAndQty.set(
        `${tier.productId}:${tier.packQty}`,
        tier.pricePerPackCents
      );
    }

    type GroupItem = {
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      packWeightGrams: number;
      packSizeAtPurchase: number;
      pricePerUnitAtPurchase: number | null;
      selectedPackQty: number;
    };

    const vendorGroups = new Map<string, GroupItem[]>();

    for (const item of cartItems) {
      const product = productMap.get(item.productId)!;
      const perPack = tierByProductAndQty.get(
        `${item.productId}:${item.selectedPackQty}`
      );
      if (perPack === undefined || perPack <= 0) {
        return jsonError(
          'Cannot checkout product without a valid pack tier.',
          400
        );
      }
      const unitPrice = perPack;
      const totalPrice = unitPrice * item.quantity;
      const totalWeight =
        product.packWeightGrams * item.selectedPackQty * item.quantity;

      const group = vendorGroups.get(product.vendorId) ?? [];
      group.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        packWeightGrams: totalWeight,
        packSizeAtPurchase: item.selectedPackQty,
        pricePerUnitAtPurchase: product.pricePerUnitCents ?? null,
        selectedPackQty: item.selectedPackQty,
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
          shippingName,
          shippingPhone,
          shippingAddress,
          shippingCity,
          addressId: orderAddressId,
          totalItemsCost,
          totalShippingCost: 0,
          grandTotal: totalItemsCost,
          status: 'processing',
          riderNotes: payloadRiderNotes ?? null,
        })
        .returning({ id: orders.id, displayId: orders.displayId });

      if (!order) throw new Error('Order insert failed');

      for (const [vendorId, groupItems] of vendorGroups.entries()) {
        const itemsTotal = groupItems.reduce((s, i) => s + i.totalPrice, 0);
        const weightGrams = groupItems.reduce(
          (s, i) => s + i.packWeightGrams,
          0
        );

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
            packSizeAtPurchase: gi.packSizeAtPurchase,
            pricePerUnitAtPurchase: gi.pricePerUnitAtPurchase,
          }))
        );
      }

      // Decrement stock (in packs).
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
