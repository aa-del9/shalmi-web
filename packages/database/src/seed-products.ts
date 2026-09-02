import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { eq } from 'drizzle-orm';
import { db } from './client';
import { user } from './schema/auth';
import { vendors } from './schema/vendors';
import { categories } from './schema/categories';
import { products } from './schema/products';
import { productPackTiers } from './schema/product-pack-tiers';
import { productCategories } from './schema/product-categories';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CSV_PATH = resolve(
  __dirname,
  '../../../Shalmi Inventory List - For Dev - Sheet1.csv'
);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const VENDOR_PHONE = '+923121234567';
const DEFAULT_STOCK = 500;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
interface CsvRow {
  name: string;
  weightGrams: number;
  vendorName: string;
  quantity: number;
  itemType: string;
  totalPriceRupees: number;
}

function parseCsv(filePath: string): CsvRow[] {
  const raw = readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n').filter((l) => l.trim());
  // skip header
  return lines.slice(1).map((line) => {
    const cols = line.split(',');
    return {
      name: (cols[0] ?? '').trim(),
      weightGrams: Math.round(parseFloat(cols[1] ?? '') || 0),
      vendorName: (cols[2] ?? '').trim(),
      quantity: parseInt(cols[3] ?? '', 10) || 1,
      itemType: (cols[4] ?? '').trim(),
      totalPriceRupees: parseFloat(cols[5] ?? '') || 0,
    };
  });
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function makeSlug(name: string): string {
  return `${slugify(name)}-${randomUUID().slice(0, 6)}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function seedProducts() {
  const rows = parseCsv(CSV_PATH);
  console.log(`Parsed ${rows.length} rows from CSV\n`);

  // 1. Vendor user -----------------------------------------------------------
  await db
    .insert(user)
    .values({
      id: randomUUID(),
      name: 'AliBaba',
      phoneNumber: VENDOR_PHONE,
      phoneNumberVerified: true,
      role: 'vendor',
      emailVerified: false,
    })
    .onConflictDoNothing({ target: user.phoneNumber });

  const [vendorUser] = await db
    .select()
    .from(user)
    .where(eq(user.phoneNumber, VENDOR_PHONE))
    .limit(1);

  if (!vendorUser) throw new Error('Failed to find/create vendor user');
  console.log(`Vendor user: ${vendorUser.id} (${vendorUser.name})`);

  // 2. Vendor record ---------------------------------------------------------
  const [existingVendor] = await db
    .select()
    .from(vendors)
    .where(eq(vendors.userId, vendorUser.id))
    .limit(1);

  let vendorId: string;

  if (existingVendor) {
    vendorId = existingVendor.id;
  } else {
    const [newVendor] = await db
      .insert(vendors)
      .values({
        userId: vendorUser.id,
        shopName: 'AliBaba',
        city: 'Lahore',
        hub: 'Baara Bazaar',
        bankName: 'HBL',
        accountTitle: 'AliBaba Trading',
        iban: 'PK00HABB0000000000000000',
      })
      .returning({ id: vendors.id });

    if (!newVendor) throw new Error('Failed to create vendor');
    vendorId = newVendor.id;
  }

  console.log(`Vendor: ${vendorId}\n`);

  // 3. Categories ------------------------------------------------------------
  const uniqueTypes = [...new Set(rows.map((r) => r.itemType))];
  const categoryMap = new Map<string, string>();

  for (const typeName of uniqueTypes) {
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, typeName))
      .limit(1);

    if (existing) {
      categoryMap.set(typeName, existing.id);
      console.log(`Category exists: "${typeName}" → ${existing.id}`);
    } else {
      const [cat] = await db
        .insert(categories)
        .values({ name: typeName, slug: makeSlug(typeName) })
        .returning({ id: categories.id });

      if (cat) {
        categoryMap.set(typeName, cat.id);
        console.log(`Category created: "${typeName}" → ${cat.id}`);
      }
    }
  }

  console.log('');

  // 4. Products --------------------------------------------------------------
  let inserted = 0;

  for (const row of rows) {
    const productName =
      row.weightGrams > 0 ? `${row.name} ${row.weightGrams}g` : row.name;

    const unitPriceCents = Math.round(
      (row.totalPriceRupees / row.quantity) * 100
    );
    const wholesalePackPriceCents = Math.round(row.totalPriceRupees * 100);
    const retailPackPriceCents = Math.round(unitPriceCents * 1.15);

    const [product] = await db
      .insert(products)
      .values({
        vendorId,
        name: productName,
        slug: makeSlug(productName),
        packWeightGrams: row.weightGrams,
        packSize: row.quantity > 1 ? row.quantity : 1,
        unitWeightGrams:
          row.quantity > 1 && row.weightGrams > 0
            ? Math.round(row.weightGrams / row.quantity)
            : row.weightGrams,
        unitLabel: row.quantity > 1 ? row.itemType : null,
        packWholesalePriceCents:
          row.quantity > 1 ? wholesalePackPriceCents : unitPriceCents,
        pricePerUnitCents: unitPriceCents,
        stock: DEFAULT_STOCK,
        images: [],
      })
      .returning({ id: products.id });

    if (!product) {
      console.warn(`  SKIP (insert failed): ${productName}`);
      continue;
    }

    // Pack tiers: a single "BUY 1" tier as default. For multi-unit packs the
    // retail single-unit price is also recorded as a per-unit fallback tier.
    if (row.quantity > 1) {
      await db.insert(productPackTiers).values([
        {
          productId: product.id,
          packQty: 1,
          pricePerPackCents: retailPackPriceCents,
          badge: null,
          isDefault: false,
        },
        {
          productId: product.id,
          packQty: row.quantity,
          pricePerPackCents: wholesalePackPriceCents,
          badge: 'best',
          isDefault: true,
        },
      ]);
    } else {
      await db.insert(productPackTiers).values({
        productId: product.id,
        packQty: 1,
        pricePerPackCents: unitPriceCents,
        badge: null,
        isDefault: true,
      });
    }

    // Category link
    const categoryId = categoryMap.get(row.itemType);
    if (categoryId) {
      await db.insert(productCategories).values({
        productId: product.id,
        categoryId,
      });
    }

    inserted++;
    console.log(
      `  ✓ ${productName} — Rs ${(unitPriceCents / 100).toFixed(0)}/unit`
    );
  }

  console.log(`\nDone! Inserted ${inserted}/${rows.length} products.`);
}

seedProducts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
