import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, categories } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return jsonError('Category ID is required', 400);
    }

    const [row] = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
        iconKey: categories.iconKey,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
      })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!row) {
      return jsonError('Category not found', 404);
    }

    return jsonSuccess({
      id: row.id,
      name: row.name,
      slug: row.slug,
      imageUrl: row.imageUrl ?? null,
      iconKey: row.iconKey ?? null,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  } catch (err) {
    console.error('GET /api/categories/[id] error:', err);
    return jsonError('Failed to load category.', 500);
  }
}
