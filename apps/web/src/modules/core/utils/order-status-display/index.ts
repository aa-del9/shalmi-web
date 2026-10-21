/**
 * Pencil status display-label mapping for orders / sub-orders.
 *
 * Maps the underlying `sub_orders.status` enum
 * (`pending | packed | handed_to_courier | delivered | cancelled`) to
 * the Pencil display stamps and to the `Stamp` atom's intent variants.
 *
 * Per gap-analysis Q5 (buyer-orders):
 *   `handed_to_courier` → "AT MNP HUB" (info / blue) is canonical.
 *   "OUT FOR DELIVERY" is intentionally dropped from the mapping until
 *   a real OFD discriminator exists in the schema.
 *
 * Per gap-analysis Q6:
 *   `packed`  → "PACKED"  (neutral / ink)
 *   `pending` → "PENDING" (warning / amber)
 *
 * Per gap-analysis Q25 — multi-sub-order rollup precedence:
 *   any cancelled        → CANCELLED
 *   all delivered        → DELIVERED
 *   any handed_to_courier→ AT MNP HUB
 *   any packed           → PACKED
 *   else                 → PENDING
 *
 * STUBBED — see `06-scope-cut.md` feature: "Status display-label
 * mapping table". Promote to a richer enum + per-sub-status
 * discriminator once order-tracking design lands.
 */

export type SubOrderStatus =
  | 'pending'
  | 'packed'
  | 'handed_to_courier'
  | 'delivered'
  | 'cancelled';

export type StampIntent = 'success' | 'info' | 'neutral' | 'warning' | 'critical';

export interface StatusDisplay {
  /** UPPERCASE label rendered inside the Stamp atom. */
  label: string;
  /** Maps to `Stamp` atom variant in `@repo/ui`. */
  intent: StampIntent;
  /** The underlying enum value this display resolves from (for tests). */
  source: SubOrderStatus | 'rollup-pending';
}

const SINGLE_STATUS_MAP: Record<SubOrderStatus, StatusDisplay> = {
  pending: { label: 'PENDING', intent: 'warning', source: 'pending' },
  packed: { label: 'PACKED', intent: 'neutral', source: 'packed' },
  handed_to_courier: {
    label: 'AT MNP HUB',
    intent: 'info',
    source: 'handed_to_courier',
  },
  delivered: { label: 'DELIVERED', intent: 'success', source: 'delivered' },
  cancelled: { label: 'CANCELLED', intent: 'critical', source: 'cancelled' },
};

export function getSubOrderStatusDisplay(status: string): StatusDisplay {
  return (
    SINGLE_STATUS_MAP[status as SubOrderStatus] ?? {
      label: status.toUpperCase(),
      intent: 'neutral',
      source: 'pending',
    }
  );
}

/**
 * Roll a list of sub-order statuses up into a single display stamp for
 * an order card. Order matters — earlier matches win (per Q25).
 */
export function rollupSubOrderStatuses(statuses: string[]): StatusDisplay {
  if (statuses.length === 0) {
    return { label: 'PENDING', intent: 'warning', source: 'rollup-pending' };
  }
  if (statuses.some((s) => s === 'cancelled')) {
    return SINGLE_STATUS_MAP.cancelled;
  }
  if (statuses.every((s) => s === 'delivered')) {
    return SINGLE_STATUS_MAP.delivered;
  }
  if (statuses.some((s) => s === 'handed_to_courier')) {
    return SINGLE_STATUS_MAP.handed_to_courier;
  }
  if (statuses.some((s) => s === 'packed')) {
    return SINGLE_STATUS_MAP.packed;
  }
  return SINGLE_STATUS_MAP.pending;
}

/** True iff at least one sub-order is in `handed_to_courier`. */
export function isInTransit(statuses: string[]): boolean {
  return statuses.some((s) => s === 'handed_to_courier');
}

/** True iff every sub-order is `cancelled` (and there is at least one). */
export function isCancelledOrder(statuses: string[]): boolean {
  return statuses.length > 0 && statuses.every((s) => s === 'cancelled');
}

/** True iff every sub-order is `delivered`. */
export function isDeliveredOrder(statuses: string[]): boolean {
  return statuses.length > 0 && statuses.every((s) => s === 'delivered');
}
