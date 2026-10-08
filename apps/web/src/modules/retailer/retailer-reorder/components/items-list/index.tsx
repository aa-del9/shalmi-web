'use client';

import type { ReorderRowDerived } from '../../types';
import { LineItemRow } from '../line-item-row';

interface ItemsListProps {
  rows: ReorderRowDerived[];
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onToggleSelected: (itemId: string) => void;
  onRemove: (itemId: string) => void;
}

/**
 * Pencil aDIg9 — flat single white card; rows separated by 1px rule.
 */
export function ItemsList({
  rows,
  onIncrement,
  onDecrement,
  onToggleSelected,
  onRemove,
}: ItemsListProps) {
  return (
    <ul className="overflow-hidden rounded-md border border-rule bg-white">
      {rows.map((row) => (
        <LineItemRow
          key={row.row.itemId}
          derived={row}
          onIncrement={() => onIncrement(row.row.itemId)}
          onDecrement={() => onDecrement(row.row.itemId)}
          onToggleSelected={() => onToggleSelected(row.row.itemId)}
          onRemove={() => onRemove(row.row.itemId)}
        />
      ))}
    </ul>
  );
}
