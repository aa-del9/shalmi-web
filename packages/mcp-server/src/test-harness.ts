/**
 * MCP read-only tool harness.
 *
 * Usage:
 *   pnpm --filter @repo/mcp-server test-harness <vendor-id|email|phone>
 *
 * Looks up the vendor row, builds a `ToolContext` matching what the
 * worker will produce at runtime, then calls each registered vendor
 * read tool with sample inputs and prints results to stdout.
 *
 * This is a verification script, not a test suite. It exists so we
 * can confirm the registry, schema validation, and service-layer
 * wiring are correct without running the worker end-to-end.
 */

import { eq } from 'drizzle-orm';
import { db, vendors, user } from '@repo/database';
import {
  callTool,
  getRegisteredToolNames,
  getGeminiToolDeclarations,
  ToolDispatchError,
  type ToolContext,
} from './index';

interface VendorLookup {
  vendorId: string;
  userId: string;
  phone: string;
  shopName: string;
}

async function resolveVendor(query: string): Promise<VendorLookup | null> {
  // Try vendor.id first.
  const [byVendorId] = await db
    .select({
      vendorId: vendors.id,
      userId: vendors.userId,
      shopName: vendors.shopName,
      phone: user.phoneNumber,
    })
    .from(vendors)
    .innerJoin(user, eq(user.id, vendors.userId))
    .where(eq(vendors.id, query))
    .limit(1);
  if (byVendorId) {
    return {
      vendorId: byVendorId.vendorId,
      userId: byVendorId.userId,
      phone: byVendorId.phone ?? '',
      shopName: byVendorId.shopName,
    };
  }

  // Then user lookup (email → phone → user.id) joined to vendors.
  const [byUser] = await db
    .select({
      vendorId: vendors.id,
      userId: vendors.userId,
      shopName: vendors.shopName,
      phone: user.phoneNumber,
      email: user.email,
      uid: user.id,
    })
    .from(user)
    .innerJoin(vendors, eq(vendors.userId, user.id))
    .where(eq(user.email, query))
    .limit(1);
  if (byUser) {
    return {
      vendorId: byUser.vendorId,
      userId: byUser.userId,
      phone: byUser.phone ?? '',
      shopName: byUser.shopName,
    };
  }

  const [byPhone] = await db
    .select({
      vendorId: vendors.id,
      userId: vendors.userId,
      shopName: vendors.shopName,
      phone: user.phoneNumber,
    })
    .from(user)
    .innerJoin(vendors, eq(vendors.userId, user.id))
    .where(eq(user.phoneNumber, query))
    .limit(1);
  if (byPhone) {
    return {
      vendorId: byPhone.vendorId,
      userId: byPhone.userId,
      phone: byPhone.phone ?? '',
      shopName: byPhone.shopName,
    };
  }

  const [byUserId] = await db
    .select({
      vendorId: vendors.id,
      userId: vendors.userId,
      shopName: vendors.shopName,
      phone: user.phoneNumber,
    })
    .from(user)
    .innerJoin(vendors, eq(vendors.userId, user.id))
    .where(eq(user.id, query))
    .limit(1);
  if (byUserId) {
    return {
      vendorId: byUserId.vendorId,
      userId: byUserId.userId,
      phone: byUserId.phone ?? '',
      shopName: byUserId.shopName,
    };
  }

  return null;
}

async function pickAnyVendor(): Promise<VendorLookup | null> {
  const [row] = await db
    .select({
      vendorId: vendors.id,
      userId: vendors.userId,
      shopName: vendors.shopName,
      phone: user.phoneNumber,
    })
    .from(vendors)
    .innerJoin(user, eq(user.id, vendors.userId))
    .limit(1);
  if (!row) return null;
  return {
    vendorId: row.vendorId,
    userId: row.userId,
    phone: row.phone ?? '',
    shopName: row.shopName,
  };
}

function divider(label: string): void {
  process.stdout.write(`\n── ${label} ${'─'.repeat(Math.max(0, 60 - label.length))}\n`);
}

async function runOne(
  toolName: string,
  input: unknown,
  ctx: ToolContext
): Promise<void> {
  divider(`call_tool ${toolName}`);
  process.stdout.write(`input: ${JSON.stringify(input)}\n`);
  try {
    const result = await callTool(toolName, input, ctx);
    process.stdout.write(`result:\n${JSON.stringify(result, null, 2)}\n`);
  } catch (err) {
    if (err instanceof ToolDispatchError) {
      process.stdout.write(`dispatch error [${err.code}]: ${err.message}\n`);
    } else if (err instanceof Error) {
      process.stdout.write(`error: ${err.name}: ${err.message}\n`);
    } else {
      process.stdout.write(`error: ${String(err)}\n`);
    }
  }
}

async function main(): Promise<void> {
  const arg = process.argv[2]?.trim();

  let vendor: VendorLookup | null = null;
  if (arg) {
    vendor = await resolveVendor(arg);
    if (!vendor) {
      process.stdout.write(
        `No vendor matched "${arg}" (tried vendor.id, user.email, user.phone_number, user.id).\n`
      );
      process.exit(1);
    }
  } else {
    vendor = await pickAnyVendor();
    if (!vendor) {
      process.stdout.write('No vendor rows in the database.\n');
      process.exit(1);
    }
    process.stdout.write(
      'No argument supplied — picked the first vendor in the table.\n'
    );
  }

  const ctx: ToolContext = {
    role: 'vendor',
    subjectId: vendor.vendorId,
    phone: vendor.phone,
    conversationId: 'harness-conversation',
  };

  divider('vendor');
  process.stdout.write(
    `vendorId=${vendor.vendorId} userId=${vendor.userId} shop="${vendor.shopName}" phone="${vendor.phone}"\n`
  );

  divider('registered tools');
  process.stdout.write(`${getRegisteredToolNames().join(', ')}\n`);

  divider('gemini declarations (vendor)');
  process.stdout.write(
    `${JSON.stringify(getGeminiToolDeclarations('vendor'), null, 2)}\n`
  );

  await runOne('list_orders', {}, ctx);
  await runOne('list_orders', { status: 'pending' }, ctx);
  await runOne('list_orders', { dateRange: 'week' }, ctx);
  await runOne('list_products', {}, ctx);
  await runOne('list_products', { filter: 'low_stock' }, ctx);
  await runOne('list_products', { filter: 'out_of_stock' }, ctx);
  await runOne('list_products', { query: 'a' }, ctx);

  // Try to use the first sub-order id from list_orders for get_order_details.
  const firstOrders = await callTool('list_orders', {}, ctx) as {
    recent: Array<{ id: string }>;
  };
  const sampleOrderId = firstOrders.recent[0]?.id;
  if (sampleOrderId) {
    await runOne('get_order_details', { orderId: sampleOrderId }, ctx);
  } else {
    divider('call_tool get_order_details');
    process.stdout.write('skipped — vendor has no orders to inspect.\n');
  }

  // Sanity: dispatch errors fire as expected.
  await runOne('get_order_details', { orderId: 'nonexistent' }, ctx);
  await runOne('list_orders', { status: 'badvalue' }, ctx);

  process.stdout.write('\nharness done.\n');
  process.exit(0);
}

main().catch((err: unknown) => {
  process.stdout.write(
    `harness crashed: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`
  );
  process.exit(1);
});
