import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { vendors } from './vendors';

/**
 * Vendor weekly payout snapshots.
 *
 * One row per (vendor, week-window). The Friday cycle-roll job inserts a
 * pending row for the upcoming week; the dashboard's "Payout pending" tile
 * + the ledger surface read from this table.
 *
 * Per `06-scope-cut.md` "Vendor weekly payouts" (IN_SCOPE) and
 * `features/vendor-payouts/surface-map.md`:
 *  - `weekStart` / `weekEnd` are inclusive ISO dates (e.g. Sat→Fri window).
 *  - `paidOn` + `txnId` populate when status flips to `paid`.
 *  - `gross/returns/mnpReimbursement/net` are cents-integer breakdowns;
 *    `net = gross - returns + mnpReimbursement`.
 *  - `status` is `pending|paid|held|failed` (text, not pg enum, to keep
 *    the migration additive).
 *
 * 7-day return window: a sub-order is eligible for a payout cycle once
 * `handedAt + 7 days <= weekEnd`. The eligibility check is derived in
 * the cycle-roll job (no schema column).
 */
export const payoutRuns = pgTable(
  'payout_runs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    vendorId: text('vendor_id')
      .notNull()
      .references(() => vendors.id, { onDelete: 'cascade' }),
    weekStart: date('week_start').notNull(),
    weekEnd: date('week_end').notNull(),
    paidOn: timestamp('paid_on'),
    txnId: text('txn_id'),
    completedOrdersCount: integer('completed_orders_count').notNull().default(0),
    grossAmountCents: integer('gross_amount_cents').notNull().default(0),
    returnsAmountCents: integer('returns_amount_cents').notNull().default(0),
    mnpReimbursementCents: integer('mnp_reimbursement_cents').notNull().default(0),
    netAmountCents: integer('net_amount_cents').notNull().default(0),
    status: text('status').notNull().default('pending'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    vendorIdx: index('payout_runs_vendor_idx').on(table.vendorId),
    vendorWeekIdx: uniqueIndex('payout_runs_vendor_week_idx').on(
      table.vendorId,
      table.weekStart
    ),
  })
);

export type PayoutRunStatus = 'pending' | 'paid' | 'held' | 'failed';
