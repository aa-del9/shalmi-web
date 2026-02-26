import { desc } from 'drizzle-orm';
import { db, categories } from '@repo/database';
import { jsonSuccess, jsonError } from '@/modules/core/api';

export async function GET() {
  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
      })
      .from(categories)
      .orderBy(desc(categories.createdAt));

    const data = rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      imageUrl: row.imageUrl ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    return jsonSuccess(data);
  } catch (err) {
    console.error('GET /api/categories error:', err);
    return jsonError('Failed to load categories.', 500);
  }
}
