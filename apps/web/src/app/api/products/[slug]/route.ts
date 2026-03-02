import type { NextRequest } from 'next/server';
import { getProductBySlug } from '@/modules/cart/utils/get-product-by-slug';
import { jsonSuccess, jsonError } from '@/modules/core/api';

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Public storefront API: single product by slug with priceTiers and vendorId
 * for cart/quick-add. Returns same shape as ProductDetail needs.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return jsonError('Slug is required', 400);
    }

    const product = await getProductBySlug(slug);
    if (!product) {
      return jsonError('Product not found', 404);
    }

    return jsonSuccess({
      id: product.id,
      name: product.name,
      slug: product.slug,
      vendorId: product.vendorId,
      images: product.images,
      weightGrams: product.weightGrams,
      stock: product.stock,
      priceTiers: product.priceTiers,
    });
  } catch (err) {
    console.error('GET /api/products/[slug] error:', err);
    return jsonError('Failed to load product.', 500);
  }
}
