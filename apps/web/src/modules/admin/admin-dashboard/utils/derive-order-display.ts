// Q-RT-3 / Q-OS-2 binding helpers — derive a display rollup label from
// raw `sub_orders.status` values so the row stamp aligns with Pencil
// "DELIVERED / OUT FOR DELIVERY / AT MNP HUB / PENDING / CANCELLED"
// taxonomy. (OUT FOR DELIVERY collapses to AT MNP HUB per Q-OS-2.)
//
// TODO(post-v1): promote to a shared status-display module — see
// 06-scope-cut.md "Status display-label mapping table".

export type OrderDisplayState =
  | 'DELIVERED'
  | 'AT MNP HUB'
  | 'PACKED'
  | 'PENDING'
  | 'CANCELLED';

export function deriveOrderDisplayState(
  subStatuses: ReadonlyArray<string>
): OrderDisplayState {
  if (subStatuses.length === 0) return 'PENDING';
  if (subStatuses.every((s) => s === 'cancelled')) return 'CANCELLED';
  if (subStatuses.every((s) => s === 'delivered')) return 'DELIVERED';
  if (subStatuses.some((s) => s === 'handed_to_courier')) return 'AT MNP HUB';
  if (subStatuses.some((s) => s === 'packed')) return 'PACKED';
  return 'PENDING';
}

export function stampVariantFor(
  state: OrderDisplayState
): 'success' | 'info' | 'neutral' | 'warning' | 'critical' {
  switch (state) {
    case 'DELIVERED':
      return 'success';
    case 'AT MNP HUB':
      return 'info';
    case 'PACKED':
      return 'neutral';
    case 'PENDING':
      return 'warning';
    case 'CANCELLED':
      return 'critical';
  }
}
