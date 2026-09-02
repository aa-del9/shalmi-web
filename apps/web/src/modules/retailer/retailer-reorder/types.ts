import type { OrderDetailItem } from '../retailer-order-detail/types';

export interface ReorderDraftRow {
  itemId: string;
  productId: string;
  selected: boolean;
  removed: boolean;
  /** Local quantity in PACKS (matches cart-store convention). */
  quantity: number;
  /** Pack qty of the active tier. Defaults to first tier or 1. */
  selectedPackQty: number;
  /** Snapshot of the original line so the comparison panel works. */
  originalQuantity: number;
}

export interface ReorderRowDerived {
  row: ReorderDraftRow;
  source: OrderDetailItem;
  /** `pricePerPackCents` from the active tier (or fallback `unitPrice`). */
  perPackCents: number;
  /** `quantity × perPackCents`. Live, not historical. */
  lineTotalCents: number;
  /** `packWeightGrams × selectedPackQty × quantity`. */
  lineWeightGrams: number;
  isOutOfStock: boolean;
  isLowStock: boolean;
}
