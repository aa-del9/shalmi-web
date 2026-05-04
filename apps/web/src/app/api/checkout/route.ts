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
import { resolveDeliveryTier } from '@/modules/cart/utils/delivery-tiers';

function generateDisplayId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    // Per OQ-G(b) — `requireSession` is relaxed to "session OR
    // guestSessionId on payload". The guard runs after we parse the
    // payload so we can read `guestSessionId` from the body.
    const session = await getSessionFromRequest(req);
    const sessionUserId = (session?.user as { id?: string } | undefined)?.id ?? null;

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
      saveAddress: payloadSaveAddress,
      guestSessionId: payloadGuestSessionId,
    } = parsed.data;

    // OQ-G refine — at least one of (sessionUserId, guestSessionId) must
    // be present.
    if (!sessionUserId && !payloadGuestSessionId) {
      return jsonError('Authentication required', 401);
    }
    const isGuest = !sessionUserId;

    // Saved-address path is user-only (saved addresses are user-bound).
    if (isGuest && payloadAddressId) {
      return jsonError('Guest checkout cannot use a saved address', 400);
    }
    if (isGuest && payloadSaveAddress) {
      // Guests have no account to save into. Q3(b) — ignore the flag
      // rather than 400; mirrors the UI which hides the toggle.
    }

    let shippingName: string;
    let shippingPhone: string;
    let shippingAddressLine: string;
    let shippingCity: string;
    let shippingPostalCode: string | null = null;
    let shippingProvince: string | null = null;
    let orderAddressId: string | null = null;

    if (payloadAddressId) {
      const [addressRow] = await db
        .select()
        .from(addresses)
        .where(eq(addresses.id, payloadAddressId));

      if (!addressRow || addressRow.userId !== sessionUserId) {
        return jsonError('Invalid or unauthorized address', 400);
      }
      shippingName = addressRow.recipientName;
      shippingPhone = addressRow.recipientPhone;
      shippingAddressLine = addressRow.address;
      shippingCity = addressRow.city;
      shippingPostalCode = addressRow.postalCode ?? null;
      shippingProvince = addressRow.province ?? null;
      orderAddressId = payloadAddressId;
    } else if (payloadShippingAddress) {
      shippingName = payloadShippingAddress.name;
      shippingPhone = payloadShippingAddress.phone;
      shippingAddressLine = payloadShippingAddress.address;
      shippingCity = payloadShippingAddress.city;
      shippingPostalCode = payloadShippingAddress.postalCode ?? null;
      shippingProvince = payloadShippingAddress.province ?? null;
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
    let totalCartWeightGrams = 0;

    for (const groupItems of vendorGroups.values()) {
      for (const gi of groupItems) {
        totalItemsCost += gi.totalPrice;
        totalCartWeightGrams += gi.packWeightGrams;
      }
    }

    const orderDeliveryTier = resolveDeliveryTier(totalCartWeightGrams);
    const totalShippingCost = orderDeliveryTier.feeCents;
    const grandTotal = totalItemsCost + totalShippingCost;

    const result = await db.transaction(async (tx) => {
      // Per buyer-checkout one-time-addr Q11(b) — when toggle is OFF on
      // an authed checkout, save the address inside the same tx and
      // capture the new addressId for the order row.
      let resolvedAddressId = orderAddressId;
      if (
        !isGuest &&
        sessionUserId &&
        payloadSaveAddress &&
        payloadShippingAddress &&
        !payloadAddressId
      ) {
        const [savedAddress] = await tx
          .insert(addresses)
          .values({
            userId: sessionUserId,
            title: 'Saved at checkout',
            recipientName: shippingName,
            recipientPhone: shippingPhone,
            address: shippingAddressLine,
            city: shippingCity,
            postalCode: shippingPostalCode,
            province: shippingProvince,
            isDefault: false,
          })
          .returning({ id: addresses.id });
        if (!savedAddress) throw new Error('Address insert failed');
        resolvedAddressId = savedAddress.id;
      }

      const [order] = await tx
        .insert(orders)
        .values({
          userId: sessionUserId, // null for guests, per OQ-G(b)
          guestSessionId: isGuest ? (payloadGuestSessionId ?? null) : null,
          displayId,
          shippingName,
          shippingPhone,
          shippingAddress: shippingAddressLine,
          shippingCity,
          shippingPostalCode,
          shippingProvince,
          addressId: resolvedAddressId,
          totalItemsCost,
          totalShippingCost,
          grandTotal,
          status: 'processing',
          riderNotes: payloadRiderNotes ?? null,
        })
        .returning({ id: orders.id, displayId: orders.displayId });

      if (!order) throw new Error('Order insert failed');

      const vendorEntries = Array.from(vendorGroups.entries());
      let shippingAllocated = 0;
      for (let i = 0; i < vendorEntries.length; i++) {
        const [vendorId, groupItems] = vendorEntries[i]!;
        const itemsTotal = groupItems.reduce((s, gi) => s + gi.totalPrice, 0);
        const weightGrams = groupItems.reduce(
          (s, gi) => s + gi.packWeightGrams,
          0
        );

        const isLast = i === vendorEntries.length - 1;
        const subShipping = isLast
          ? totalShippingCost - shippingAllocated
          : totalCartWeightGrams > 0
            ? Math.round(
                (weightGrams / totalCartWeightGrams) * totalShippingCost
              )
            : 0;
        shippingAllocated += subShipping;

        const [subOrder] = await tx
          .insert(subOrders)
          .values({
            orderId: order.id,
            vendorId,
            status: 'pending',
            weightGrams,
            codAmount: itemsTotal + subShipping,
            itemsTotal,
            shippingFeeCustomer: subShipping,
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
    console.error('POST /api/checkout error:', err);
    return jsonError('Failed to place order. Please try again.', 500);
  }
}
