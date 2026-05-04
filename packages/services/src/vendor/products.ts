import {
  eq,
  desc,
  asc,
  inArray,
  and,
  count,
  ilike,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { z } from 'zod';
import {
  db,
  products,
  productPackTiers,
  productCategories,
} from '@repo/database';
import {
  createProductSchema,
  updateProductSchema,
} from '@repo/schemas/catalog/product';
import { POSTGRES_UNIQUE_VIOLATION } from '@repo/constants/postgres';
import { slugify } from '@repo/utils/string';
import { generateId } from '@repo/utils/id';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../errors';

const PAGE_SIZE_DEFAULT = 8;
const PAGE_SIZE_MAX = 30;
const FALLBACK_SLUG = 'product';

function slugForProduct(name: string): string {
  const base = slugify(name).trim() || FALLBACK_SLUG;
  const suffix = generateId().slice(0, 6);
  return `${base}-${suffix}`;
}

// ----------------------------------------------------------------------------
// listVendorProducts
// ----------------------------------------------------------------------------

export const VENDOR_PRODUCT_STATUS_FILTERS = [
  'all',
  'active',
  'low-stock',
  'drafts',
] as const;
export type VendorProductStatusFilter =
  (typeof VENDOR_PRODUCT_STATUS_FILTERS)[number];

export const VENDOR_PRODUCT_SORTS = [
  'newest',
  'oldest',
  'stock-asc',
  'stock-desc',
] as const;
export type VendorProductSort = (typeof VENDOR_PRODUCT_SORTS)[number];

const listVendorProductsInputSchema = z.object({
  vendorId: z.string().min(1),
  filter: z
    .object({
      page: z.number().int().min(1).optional(),
      pageSize: z.number().int().min(1).max(PAGE_SIZE_MAX).optional(),
      q: z.string().optional(),
      status: z.enum(VENDOR_PRODUCT_STATUS_FILTERS).optional(),
      categoryId: z.string().optional(),
      sort: z.enum(VENDOR_PRODUCT_SORTS).optional(),
    })
    .optional(),
});

export type ListVendorProductsInput = z.input<
  typeof listVendorProductsInputSchema
>;

export interface VendorProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  brand: string | null;
  packWeightGrams: number;
  packSize: number;
  unitLabel: string | null;
  packWholesalePriceCents: number;
  images: unknown;
  stock: number;
  lowStockThreshold: number;
  status: 'active' | 'draft';
  createdAt: string;
  categoryIds: string[];
}

export interface VendorProductStats {
  all: number;
  active: number;
  lowStock: number;
  drafts: number;
}

export interface ListVendorProductsResult {
  rows: VendorProductRow[];
  total: number;
  page: number;
  pageSize: number;
  stats: VendorProductStats;
}

export async function listVendorProducts(
  input: ListVendorProductsInput
): Promise<ListVendorProductsResult> {
  const parsed = listVendorProductsInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.flatten().formErrors[0] ?? 'Invalid input'
    );
  }
  const { vendorId, filter } = parsed.data;

  const page = Math.max(1, filter?.page ?? 1);
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(1, filter?.pageSize ?? PAGE_SIZE_DEFAULT)
  );
  const q = (filter?.q ?? '').trim();
  const statusFilter: VendorProductStatusFilter = filter?.status ?? 'all';
  const categoryId = filter?.categoryId ?? '';
  const sort: VendorProductSort = filter?.sort ?? 'newest';

  const baseWhere: SQL[] = [eq(products.vendorId, vendorId)];

  if (q) {
    const like = `%${q}%`;
    const searchClause = or(
      ilike(products.name, like),
      ilike(products.sku, like),
      ilike(products.brand, like)
    );
    if (searchClause) baseWhere.push(searchClause);
  }

  if (statusFilter === 'active') {
    baseWhere.push(eq(products.status, 'active'));
    baseWhere.push(sql`${products.stock} > ${products.lowStockThreshold}`);
  } else if (statusFilter === 'drafts') {
    baseWhere.push(eq(products.status, 'draft'));
  } else if (statusFilter === 'low-stock') {
    baseWhere.push(eq(products.status, 'active'));
    baseWhere.push(sql`${products.stock} > 0`);
    baseWhere.push(sql`${products.stock} <= ${products.lowStockThreshold}`);
  }

  if (categoryId) {
    const ids = await db
      .select({ productId: productCategories.productId })
      .from(productCategories)
      .where(eq(productCategories.categoryId, categoryId));
    const productIds = ids.map((r) => r.productId);
    if (productIds.length === 0) {
      return {
        rows: [],
        total: 0,
        page,
        pageSize,
        stats: await readVendorProductStats(vendorId),
      };
    }
    baseWhere.push(inArray(products.id, productIds));
  }

  const orderClause =
    sort === 'oldest'
      ? asc(products.createdAt)
      : sort === 'stock-asc'
        ? asc(products.stock)
        : sort === 'stock-desc'
          ? desc(products.stock)
          : desc(products.createdAt);

  const whereExpr = baseWhere.length === 1 ? baseWhere[0] : and(...baseWhere);

  const [totalRow] = await db
    .select({ totalCount: count() })
    .from(products)
    .where(whereExpr);
  const total = Number(totalRow?.totalCount ?? 0);

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      brand: products.brand,
      packWeightGrams: products.packWeightGrams,
      packSize: products.packSize,
      unitLabel: products.unitLabel,
      packWholesalePriceCents: products.packWholesalePriceCents,
      images: products.images,
      stock: products.stock,
      lowStockThreshold: products.lowStockThreshold,
      status: products.status,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(whereExpr)
    .orderBy(orderClause)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const productIds = rows.map((r) => r.id);
  const categoryLinks =
    productIds.length > 0
      ? await db
          .select({
            productId: productCategories.productId,
            categoryId: productCategories.categoryId,
          })
          .from(productCategories)
          .where(inArray(productCategories.productId, productIds))
      : [];

  const categoryIdsByProductId = categoryLinks.reduce(
    (acc, { productId, categoryId: linkCategoryId }) => {
      if (!acc[productId]) acc[productId] = [];
      acc[productId].push(linkCategoryId);
      return acc;
    },
    {} as Record<string, string[]>
  );

  const data: VendorProductRow[] = rows.map((row) => ({
    ...row,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : (row.createdAt as unknown as string),
    categoryIds: categoryIdsByProductId[row.id] ?? [],
  }));

  return {
    rows: data,
    total,
    page,
    pageSize,
    stats: await readVendorProductStats(vendorId),
  };
}

async function readVendorProductStats(
  vendorId: string
): Promise<VendorProductStats> {
  const [allRow] = await db
    .select({ rowCount: count() })
    .from(products)
    .where(eq(products.vendorId, vendorId));
  const [activeRow] = await db
    .select({ rowCount: count() })
    .from(products)
    .where(
      and(
        eq(products.vendorId, vendorId),
        eq(products.status, 'active'),
        sql`${products.stock} > ${products.lowStockThreshold}`
      )
    );
  const [lowRow] = await db
    .select({ rowCount: count() })
    .from(products)
    .where(
      and(
        eq(products.vendorId, vendorId),
        eq(products.status, 'active'),
        sql`${products.stock} > 0`,
        sql`${products.stock} <= ${products.lowStockThreshold}`
      )
    );
  const [draftRow] = await db
    .select({ rowCount: count() })
    .from(products)
    .where(and(eq(products.vendorId, vendorId), eq(products.status, 'draft')));
  return {
    all: Number(allRow?.rowCount ?? 0),
    active: Number(activeRow?.rowCount ?? 0),
    lowStock: Number(lowRow?.rowCount ?? 0),
    drafts: Number(draftRow?.rowCount ?? 0),
  };
}

// ----------------------------------------------------------------------------
// getVendorProduct (single product detail)
// ----------------------------------------------------------------------------

const getVendorProductInputSchema = z.object({
  vendorId: z.string().min(1),
  productId: z.string().min(1),
});

export type GetVendorProductInput = z.input<
  typeof getVendorProductInputSchema
>;

export interface VendorProductDetail {
  id: string;
  name: string;
  slug: string;
  packWeightGrams: number;
  packSize: number;
  unitWeightGrams: number | null;
  unitLabel: string | null;
  packMrpCents: number | null;
  packWholesalePriceCents: number;
  pricePerUnitCents: number | null;
  images: unknown;
  stock: number;
  sku: string | null;
  brand: string | null;
  lowStockThreshold: number;
  status: 'active' | 'draft';
  createdAt: Date | string;
  categoryIds: string[];
  packTiers: {
    id: string;
    packQty: number;
    pricePerPackCents: number;
    badge: string | null;
    isDefault: boolean;
  }[];
}

export async function getVendorProduct(
  input: GetVendorProductInput
): Promise<VendorProductDetail> {
  const parsed = getVendorProductInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.flatten().formErrors[0] ?? 'Invalid input'
    );
  }
  const { vendorId, productId } = parsed.data;

  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      packWeightGrams: products.packWeightGrams,
      packSize: products.packSize,
      unitWeightGrams: products.unitWeightGrams,
      unitLabel: products.unitLabel,
      packMrpCents: products.packMrpCents,
      packWholesalePriceCents: products.packWholesalePriceCents,
      pricePerUnitCents: products.pricePerUnitCents,
      images: products.images,
      stock: products.stock,
      sku: products.sku,
      brand: products.brand,
      lowStockThreshold: products.lowStockThreshold,
      status: products.status,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.vendorId, vendorId)))
    .limit(1);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  const tiers = await db
    .select({
      id: productPackTiers.id,
      packQty: productPackTiers.packQty,
      pricePerPackCents: productPackTiers.pricePerPackCents,
      badge: productPackTiers.badge,
      isDefault: productPackTiers.isDefault,
    })
    .from(productPackTiers)
    .where(eq(productPackTiers.productId, productId))
    .orderBy(asc(productPackTiers.packQty));

  const categoryRows = await db
    .select({ categoryId: productCategories.categoryId })
    .from(productCategories)
    .where(eq(productCategories.productId, productId));
  const categoryIds = categoryRows.map((r) => r.categoryId);

  return {
    ...product,
    categoryIds,
    packTiers: tiers,
  };
}

// ----------------------------------------------------------------------------
// createProduct
// ----------------------------------------------------------------------------

const createProductInputSchema = z.intersection(
  z.object({ vendorId: z.string().min(1) }),
  createProductSchema
);

export type CreateProductInput = z.input<typeof createProductInputSchema>;

export interface CreateProductResult {
  productId: string;
}

export async function createProduct(
  input: CreateProductInput
): Promise<CreateProductResult> {
  const parsed = createProductInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.flatten().formErrors[0] ?? 'Invalid input'
    );
  }

  const {
    vendorId,
    name,
    packWeightGrams,
    packSize,
    unitWeightGrams,
    unitLabel,
    packMrpCents,
    packWholesalePriceCents,
    pricePerUnitCents,
    images,
    stock,
    packTiers,
    categoryIds,
    sku,
    brand,
    lowStockThreshold,
    status,
  } = parsed.data;
  const slug = slugForProduct(name);

  try {
    const [inserted] = await db.transaction(async (tx) => {
      const [product] = await tx
        .insert(products)
        .values({
          vendorId,
          name,
          slug,
          packWeightGrams,
          packSize,
          unitWeightGrams: unitWeightGrams ?? null,
          unitLabel: unitLabel ?? null,
          packMrpCents: packMrpCents ?? null,
          packWholesalePriceCents,
          pricePerUnitCents: pricePerUnitCents ?? null,
          images: images as { url: string; blurHash: string | null }[],
          stock: stock ?? 0,
          sku: sku ?? null,
          brand: brand ?? null,
          lowStockThreshold: lowStockThreshold ?? 10,
          status: status ?? 'active',
        })
        .returning({ id: products.id });

      if (!product) {
        throw new Error('Product insert did not return id');
      }

      await tx.insert(productPackTiers).values(
        packTiers.map((tier) => ({
          productId: product.id,
          packQty: tier.packQty,
          pricePerPackCents: tier.pricePerPackCents,
          badge: tier.badge ?? null,
          isDefault: tier.isDefault ?? false,
        }))
      );

      if (categoryIds && categoryIds.length > 0) {
        await tx.insert(productCategories).values(
          categoryIds.map((categoryId) => ({
            productId: product.id,
            categoryId,
          }))
        );
      }

      return [product];
    });

    if (!inserted) {
      throw new Error('Product insert did not return id');
    }

    return { productId: inserted.id };
  } catch (err) {
    const pgErr = err as { code?: string };
    if (pgErr?.code === POSTGRES_UNIQUE_VIOLATION) {
      throw new ConflictError(
        'A product with this slug or SKU already exists.'
      );
    }
    throw err;
  }
}

// ----------------------------------------------------------------------------
// updateProduct
// ----------------------------------------------------------------------------

const updateProductInputSchema = z.intersection(
  z.object({
    vendorId: z.string().min(1),
    productId: z.string().min(1),
  }),
  updateProductSchema
);

export type UpdateProductInput = z.input<typeof updateProductInputSchema>;

export interface UpdateProductResult {
  productId: string;
}

export async function updateProduct(
  input: UpdateProductInput
): Promise<UpdateProductResult> {
  const parsed = updateProductInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.flatten().formErrors[0] ?? 'Invalid input'
    );
  }

  const { vendorId, productId, ...data } = parsed.data;

  const updatePayload: {
    name?: string;
    packWeightGrams?: number;
    packSize?: number;
    unitWeightGrams?: number | null;
    unitLabel?: string | null;
    packMrpCents?: number | null;
    packWholesalePriceCents?: number;
    pricePerUnitCents?: number | null;
    images?: { url: string; blurHash: string | null }[];
    stock?: number;
    sku?: string | null;
    brand?: string | null;
    lowStockThreshold?: number;
    status?: 'active' | 'draft';
  } = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.packWeightGrams !== undefined)
    updatePayload.packWeightGrams = data.packWeightGrams;
  if (data.packSize !== undefined) updatePayload.packSize = data.packSize;
  if (data.unitWeightGrams !== undefined)
    updatePayload.unitWeightGrams = data.unitWeightGrams ?? null;
  if (data.unitLabel !== undefined)
    updatePayload.unitLabel = data.unitLabel ?? null;
  if (data.packMrpCents !== undefined)
    updatePayload.packMrpCents = data.packMrpCents ?? null;
  if (data.packWholesalePriceCents !== undefined)
    updatePayload.packWholesalePriceCents = data.packWholesalePriceCents;
  if (data.pricePerUnitCents !== undefined)
    updatePayload.pricePerUnitCents = data.pricePerUnitCents ?? null;
  if (data.images !== undefined)
    updatePayload.images = data.images as {
      url: string;
      blurHash: string | null;
    }[];
  if (data.stock !== undefined) updatePayload.stock = data.stock;
  if (data.sku !== undefined) updatePayload.sku = data.sku ?? null;
  if (data.brand !== undefined) updatePayload.brand = data.brand ?? null;
  if (data.lowStockThreshold !== undefined)
    updatePayload.lowStockThreshold = data.lowStockThreshold;
  if (data.status !== undefined) updatePayload.status = data.status;

  try {
    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: products.id })
        .from(products)
        .where(
          and(eq(products.id, productId), eq(products.vendorId, vendorId))
        )
        .limit(1);

      if (!existing) {
        throw new NotFoundError('Product not found');
      }

      if (Object.keys(updatePayload).length > 0) {
        await tx
          .update(products)
          .set({
            ...updatePayload,
            updatedAt: new Date(),
          })
          .where(eq(products.id, productId));
      }

      if (data.packTiers !== undefined && data.packTiers.length > 0) {
        await tx
          .delete(productPackTiers)
          .where(eq(productPackTiers.productId, productId));
        await tx.insert(productPackTiers).values(
          data.packTiers.map((tier) => ({
            productId,
            packQty: tier.packQty,
            pricePerPackCents: tier.pricePerPackCents,
            badge: tier.badge ?? null,
            isDefault: tier.isDefault ?? false,
          }))
        );
      }

      if (data.categoryIds !== undefined) {
        await tx
          .delete(productCategories)
          .where(eq(productCategories.productId, productId));
        if (data.categoryIds.length > 0) {
          await tx.insert(productCategories).values(
            data.categoryIds.map((categoryId) => ({
              productId,
              categoryId,
            }))
          );
        }
      }
    });
  } catch (err) {
    if (err instanceof NotFoundError) throw err;
    const pgErr = err as { code?: string };
    if (pgErr?.code === POSTGRES_UNIQUE_VIOLATION) {
      throw new ConflictError('A product with this slug already exists.');
    }
    throw err;
  }

  return { productId };
}

// ----------------------------------------------------------------------------
// updateProductPrice / updateProductStock — convenience wrappers around
// `updateProduct` for the WhatsApp tool surface. The PATCH route does not
// call these; they exist purely so callers can mutate a single field
// without constructing the full update payload. SKU lookup falls back to
// the vendor's own catalog when the input is not a known product id.
// ----------------------------------------------------------------------------

const updateProductPriceInputSchema = z.object({
  vendorId: z.string().min(1),
  productIdOrSku: z.string().min(1),
  newPrice: z.number().int().positive(),
});

export type UpdateProductPriceInput = z.input<
  typeof updateProductPriceInputSchema
>;

export async function updateProductPrice(
  input: UpdateProductPriceInput
): Promise<UpdateProductResult> {
  const parsed = updateProductPriceInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.flatten().formErrors[0] ?? 'Invalid input'
    );
  }
  const { vendorId, productIdOrSku, newPrice } = parsed.data;
  const productId = await resolveProductId(vendorId, productIdOrSku);
  return updateProduct({
    vendorId,
    productId,
    packWholesalePriceCents: newPrice,
  });
}

const updateProductStockInputSchema = z.object({
  vendorId: z.string().min(1),
  productIdOrSku: z.string().min(1),
  newCount: z.number().int().min(0),
});

export type UpdateProductStockInput = z.input<
  typeof updateProductStockInputSchema
>;

export async function updateProductStock(
  input: UpdateProductStockInput
): Promise<UpdateProductResult> {
  const parsed = updateProductStockInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.flatten().formErrors[0] ?? 'Invalid input'
    );
  }
  const { vendorId, productIdOrSku, newCount } = parsed.data;
  const productId = await resolveProductId(vendorId, productIdOrSku);
  return updateProduct({
    vendorId,
    productId,
    stock: newCount,
  });
}

async function resolveProductId(
  vendorId: string,
  productIdOrSku: string
): Promise<string> {
  const [byId] = await db
    .select({ id: products.id })
    .from(products)
    .where(
      and(eq(products.id, productIdOrSku), eq(products.vendorId, vendorId))
    )
    .limit(1);
  if (byId) return byId.id;

  const [bySku] = await db
    .select({ id: products.id })
    .from(products)
    .where(
      and(eq(products.sku, productIdOrSku), eq(products.vendorId, vendorId))
    )
    .limit(1);
  if (bySku) return bySku.id;

  // Fallback: substring-match the product name within this vendor's
  // catalog. Pull at most 2 to differentiate "exactly one" from
  // "multiple". Multi-match throws a ValidationError so the caller
  // (LLM) can ask the vendor to disambiguate by SKU.
  const byName = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .where(
      and(
        ilike(products.name, `%${productIdOrSku}%`),
        eq(products.vendorId, vendorId)
      )
    )
    .limit(2);
  if (byName.length === 1 && byName[0]) return byName[0].id;
  if (byName.length > 1) {
    throw new ValidationError(
      `Multiple products match "${productIdOrSku}". Please use the SKU to be specific.`
    );
  }

  throw new NotFoundError('Product not found');
}

// ----------------------------------------------------------------------------
// getVendorProductByIdOrSku — small read used by the WhatsApp write-tool
// preview functions. Returns the fields needed to compose a confirmation
// prompt + the resolved canonical product id.
// ----------------------------------------------------------------------------

const getVendorProductByIdOrSkuInputSchema = z.object({
  vendorId: z.string().min(1),
  productIdOrSku: z.string().min(1),
});

export type GetVendorProductByIdOrSkuInput = z.input<
  typeof getVendorProductByIdOrSkuInputSchema
>;

export interface VendorProductSummary {
  id: string;
  name: string;
  sku: string | null;
  packWholesalePriceCents: number;
  stock: number;
}

export async function getVendorProductByIdOrSku(
  input: GetVendorProductByIdOrSkuInput
): Promise<VendorProductSummary> {
  const parsed = getVendorProductByIdOrSkuInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.flatten().formErrors[0] ?? 'Invalid input'
    );
  }
  const { vendorId, productIdOrSku } = parsed.data;
  const productId = await resolveProductId(vendorId, productIdOrSku);

  const [row] = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      packWholesalePriceCents: products.packWholesalePriceCents,
      stock: products.stock,
    })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.vendorId, vendorId)))
    .limit(1);

  if (!row) {
    throw new NotFoundError('Product not found');
  }
  return row;
}
