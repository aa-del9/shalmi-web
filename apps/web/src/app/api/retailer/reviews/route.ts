import type { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import {
  db,
  orders,
  subOrders,
  orderItems,
  productReviews,
} from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';
import { AUTH_GUARD_ERRORS } from '@/modules/auth/server/guards/errors';
import { getSessionFromRequest } from '@/modules/auth/server/session-from-request';
import { requireSession } from '@/modules/auth/server/guards/require-session';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    requireSession(session);

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { productId, rating, comment } = body as {
      productId?: string;
      rating?: number;
      comment?: string;
    };

    if (!productId || typeof productId !== 'string') {
      return jsonError('productId is required', 400);
    }

    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return jsonError('rating must be an integer between 1 and 5', 400);
    }

    // Verify the retailer actually has a delivered order containing this product
    const [deliveredItem] = await db
      .select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(subOrders, eq(orderItems.subOrderId, subOrders.id))
      .innerJoin(orders, eq(subOrders.orderId, orders.id))
      .where(
        and(
          eq(orders.userId, userId),
          eq(subOrders.status, 'delivered'),
          eq(orderItems.productId, productId)
        )
      )
      .limit(1);

    if (!deliveredItem) {
      return jsonError(
        'You can only review products from delivered orders',
        403
      );
    }

    // Check for existing review (one review per retailer per product)
    const [existing] = await db
      .select({ id: productReviews.id })
      .from(productReviews)
      .where(
        and(
          eq(productReviews.retailerId, userId),
          eq(productReviews.productId, productId)
        )
      )
      .limit(1);

    if (existing) {
      return jsonError('You have already reviewed this product', 409);
    }

    const [review] = await db
      .insert(productReviews)
      .values({
        productId,
        retailerId: userId,
        rating,
        comment: comment?.trim() || null,
      })
      .returning({ id: productReviews.id });

    return jsonSuccess(review, undefined, 201);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === AUTH_GUARD_ERRORS.SESSION_REQUIRED) {
        return jsonError(err.message, 401);
      }
    }
    console.error('POST /api/retailer/reviews error:', err);
    return jsonError('Failed to submit review', 500);
  }
}
