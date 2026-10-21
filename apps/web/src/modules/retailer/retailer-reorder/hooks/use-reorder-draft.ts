'use client';

import { useMemo, useReducer } from 'react';
import type {
  OrderDetail,
  OrderDetailItem,
} from '../../retailer-order-detail/types';
import { findDefaultTier } from '@/modules/cart/utils/pack-pricing';
import type { ReorderDraftRow, ReorderRowDerived } from '../types';

type DraftState = {
  rowsById: Record<string, ReorderDraftRow>;
  /** Order of itemIds — preserved from the original order_items list. */
  order: string[];
};

type DraftAction =
  | { type: 'init'; rows: ReorderDraftRow[] }
  | { type: 'setQuantity'; itemId: string; quantity: number }
  | { type: 'increment'; itemId: string }
  | { type: 'decrement'; itemId: string }
  | { type: 'toggleSelected'; itemId: string }
  | { type: 'remove'; itemId: string }
  | { type: 'restore'; itemId: string }
  | { type: 'selectAll' }
  | { type: 'deselectAll' };

function reducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'init': {
      const rowsById: Record<string, ReorderDraftRow> = {};
      const order: string[] = [];
      for (const r of action.rows) {
        rowsById[r.itemId] = r;
        order.push(r.itemId);
      }
      return { rowsById, order };
    }
    case 'setQuantity': {
      const row = state.rowsById[action.itemId];
      if (!row) return state;
      const quantity = Math.max(1, Math.floor(action.quantity));
      return {
        ...state,
        rowsById: {
          ...state.rowsById,
          [action.itemId]: { ...row, quantity, removed: false },
        },
      };
    }
    case 'increment': {
      const row = state.rowsById[action.itemId];
      if (!row) return state;
      return {
        ...state,
        rowsById: {
          ...state.rowsById,
          [action.itemId]: { ...row, quantity: row.quantity + 1 },
        },
      };
    }
    case 'decrement': {
      const row = state.rowsById[action.itemId];
      if (!row) return state;
      return {
        ...state,
        rowsById: {
          ...state.rowsById,
          [action.itemId]: {
            ...row,
            quantity: Math.max(1, row.quantity - 1),
          },
        },
      };
    }
    case 'toggleSelected': {
      const row = state.rowsById[action.itemId];
      if (!row) return state;
      return {
        ...state,
        rowsById: {
          ...state.rowsById,
          [action.itemId]: { ...row, selected: !row.selected },
        },
      };
    }
    case 'remove': {
      const row = state.rowsById[action.itemId];
      if (!row) return state;
      return {
        ...state,
        rowsById: {
          ...state.rowsById,
          [action.itemId]: { ...row, removed: true, selected: false },
        },
      };
    }
    case 'restore': {
      const row = state.rowsById[action.itemId];
      if (!row) return state;
      return {
        ...state,
        rowsById: {
          ...state.rowsById,
          [action.itemId]: { ...row, removed: false, selected: true },
        },
      };
    }
    case 'selectAll':
    case 'deselectAll': {
      const next: Record<string, ReorderDraftRow> = {};
      const select = action.type === 'selectAll';
      for (const id of state.order) {
        const row = state.rowsById[id];
        if (!row) continue;
        next[id] = {
          ...row,
          // Per gap-analysis Q10: select-all skips out-of-stock (the
          // hook can't see stock here, so it relies on row.selected
          // staying false when caller has already locked the row).
          selected: select && row.quantity > 0,
          removed: select ? false : row.removed,
        };
      }
      return { ...state, rowsById: next };
    }
  }
}

function seedRows(items: OrderDetailItem[]): ReorderDraftRow[] {
  return items.map((item) => {
    const defaultTier = findDefaultTier(item.product.packTiers);
    return {
      itemId: item.id,
      productId: item.productId,
      selected: item.product.stock > 0,
      removed: false,
      quantity: Math.max(1, item.quantity),
      selectedPackQty: defaultTier?.packQty ?? 1,
      originalQuantity: item.quantity,
    };
  });
}

function flattenItems(order: OrderDetail | undefined): OrderDetailItem[] {
  if (!order) return [];
  return order.subOrders.flatMap((s) => s.items);
}

export function useReorderDraft(order: OrderDetail | undefined) {
  const items = flattenItems(order);

  const [state, dispatch] = useReducer(
    reducer,
    items,
    (initial): DraftState => {
      const rows = seedRows(initial);
      const rowsById: Record<string, ReorderDraftRow> = {};
      const orderArr: string[] = [];
      for (const r of rows) {
        rowsById[r.itemId] = r;
        orderArr.push(r.itemId);
      }
      return { rowsById, order: orderArr };
    }
  );

  const itemsById = useMemo(() => {
    const map = new Map<string, OrderDetailItem>();
    for (const item of items) map.set(item.id, item);
    return map;
  }, [items]);

  const derivedRows: ReorderRowDerived[] = useMemo(() => {
    const out: ReorderRowDerived[] = [];
    for (const id of state.order) {
      const row = state.rowsById[id];
      const source = itemsById.get(id);
      if (!row || !source) continue;
      if (row.removed) continue;
      const tier = source.product.packTiers.find(
        (t) => t.packQty === row.selectedPackQty
      );
      const perPackCents = tier?.pricePerPackCents ?? source.unitPrice;
      const lineTotalCents = perPackCents * row.quantity;
      const lineWeightGrams =
        source.product.packWeightGrams *
        row.selectedPackQty *
        row.quantity;
      const isOutOfStock = source.product.stock <= 0;
      const isLowStock =
        !isOutOfStock &&
        source.product.stock <= source.product.lowStockThreshold;
      out.push({
        row,
        source,
        perPackCents,
        lineTotalCents,
        lineWeightGrams,
        isOutOfStock,
        isLowStock,
      });
    }
    return out;
  }, [state, itemsById]);

  return {
    state,
    dispatch,
    derivedRows,
    items,
    itemsById,
  };
}
