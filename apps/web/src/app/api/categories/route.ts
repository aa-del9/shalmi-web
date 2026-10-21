import { desc, eq } from 'drizzle-orm';
import { db, categories } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';

// TODO(post-v1): align with full Categories rich model — see
// 06-scope-cut.md "Categories rich model" feature.
export async function GET() {
  try {
    const rows = await db
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
      .where(eq(categories.isActive, true))
      .orderBy(desc(categories.createdAt));

    const data = rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      imageUrl: row.imageUrl ?? null,
      iconKey: row.iconKey ?? null,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    return jsonSuccess(data);
  } catch (err) {
    console.error('GET /api/categories error:', err);
    return jsonError('Failed to load categories.', 500);
  }
}
