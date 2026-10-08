import type { NextRequest } from 'next/server';
import { getProductBySlug } from '@/modules/cart/utils/get-product-by-slug';
import { jsonSuccess, jsonError } from '@/modules/core/api';

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Public storefront API: single product by slug, with pack-pricing tiers
 * + primary category (for breadcrumb) + vendor name (for cart-line eyebrow).
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
      vendorName: product.vendorName,
      images: product.images,
      packWeightGrams: product.packWeightGrams,
      packSize: product.packSize,
      unitWeightGrams: product.unitWeightGrams,
      unitLabel: product.unitLabel,
      packMrpCents: product.packMrpCents,
      packWholesalePriceCents: product.packWholesalePriceCents,
      pricePerUnitCents: product.pricePerUnitCents,
      stock: product.stock,
      packTiers: product.packTiers,
      primaryCategory: product.primaryCategory,
    });
  } catch (err) {
    console.error('GET /api/products/[slug] error:', err);
    return jsonError('Failed to load product.', 500);
  }
}
