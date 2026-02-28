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
import { productPriceTiers } from './schema/product-price-tiers';
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

    const unitPriceRupees = row.totalPriceRupees / row.quantity;
    const unitPriceCents = Math.round(unitPriceRupees * 100);

    const [product] = await db
      .insert(products)
      .values({
        vendorId,
        name: productName,
        slug: makeSlug(productName),
        weightGrams: row.weightGrams,
        stock: DEFAULT_STOCK,
        images: [],
      })
      .returning({ id: products.id });

    if (!product) {
      console.warn(`  SKIP (insert failed): ${productName}`);
      continue;
    }

    // Price tiers: single-unit retail price + bulk wholesale price
    if (row.quantity > 1) {
      const retailCents = Math.round(unitPriceCents * 1.15); // 15% retail markup
      await db.insert(productPriceTiers).values([
        {
          productId: product.id,
          minQty: 1,
          maxQty: row.quantity - 1,
          priceCents: retailCents,
        },
        {
          productId: product.id,
          minQty: row.quantity,
          maxQty: null,
          priceCents: unitPriceCents,
        },
      ]);
    } else {
      await db.insert(productPriceTiers).values({
        productId: product.id,
        minQty: 1,
        maxQty: null,
        priceCents: unitPriceCents,
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
    const tierInfo =
      row.quantity > 1
        ? `retail Rs ${((unitPriceCents * 1.15) / 100).toFixed(0)} | bulk(${row.quantity}+) Rs ${(unitPriceCents / 100).toFixed(0)}`
        : `Rs ${(unitPriceCents / 100).toFixed(0)}`;

    console.log(`  ✓ ${productName} — ${tierInfo}`);
  }

  console.log(`\nDone! Inserted ${inserted}/${rows.length} products.`);
}

seedProducts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
