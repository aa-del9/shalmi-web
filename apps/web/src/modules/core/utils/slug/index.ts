/**
 * Slug utilities for product and other entities.
 */

import { slugify } from '@repo/utils/string';
import { generateId } from '@repo/utils/id';

const FALLBACK_SLUG = 'product';

/**
 * Generates a unique slug for a product from its name.
 * Uses slugify(name) + short random suffix (from generateId) to satisfy DB unique constraint.
 * Result matches slug format: ^[a-z0-9]+(?:-[a-z0-9]+)*$
 */
export function slugForProduct(name: string): string {
  const base = slugify(name).trim() || FALLBACK_SLUG;
  const suffix = generateId().slice(0, 6);
  return `${base}-${suffix}`;
}
