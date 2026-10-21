'use client';

import { Package, X } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';
import { formatPackWeightCaption } from '@/modules/cart/utils/pack-pricing';
import type { ReorderRowDerived } from '../../types';
import { QuantityStepper } from '../quantity-stepper';

interface LineItemRowProps {
  derived: ReorderRowDerived;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggleSelected: () => void;
  onRemove: () => void;
}

function StockLabel({ derived }: { derived: ReorderRowDerived }) {
  if (derived.isOutOfStock) {
    return (
      <span className="font-sans text-[11px] font-semibold text-red">
        unavailable
      </span>
    );
  }
  if (derived.isLowStock) {
    return (
      <span className="font-sans text-[11px] font-semibold text-amber">
        low stock · {derived.source.product.stock} left
      </span>
    );
  }
  return (
    <span className="font-sans text-[11px] font-semibold text-green-700">
      in stock
    </span>
  );
}

function buildPackEyebrow(derived: ReorderRowDerived): string {
  // STUBBED per gap-analysis Q14: weight = packWeightGrams × selectedPackQty
  // when > 1 pack, else just packWeightGrams. unitLabel falls back to PACK.
  const totalGrams =
    derived.source.product.packWeightGrams * derived.row.selectedPackQty;
  const weight = formatPackWeightCaption(totalGrams);
  const label = (derived.source.product.unitLabel ?? 'pack').toUpperCase();
  return `${weight} · ${label}`;
}

function buildPerUnitCopy(derived: ReorderRowDerived): string {
  // STUBBED per gap-analysis Q15: derive from `unitLabel` ("carton" / "bag" /
  // "tin" / "box" / "pack").
  const noun = derived.source.product.unitLabel?.toLowerCase() ?? 'pack';
  return `${formatRupeesFromCents(derived.perPackCents)} per ${noun}`;
}

function buildTitle(derived: ReorderRowDerived): string {
  // STUBBED per gap-analysis Q13: "Pack of N" suffix derived from packSize.
  const { name, packSize, unitLabel } = derived.source.product;
  if (packSize > 1) {
    const noun = unitLabel
      ? unitLabel.charAt(0).toUpperCase() + unitLabel.slice(1).toLowerCase()
      : 'Pack';
    return `${name} · ${noun} of ${packSize}`;
  }
  return name;
}

/**
 * Pencil CXe6z (desktop) / NuDbz (mobile) — reorder line-item row.
 *
 * Per gap-analysis answers:
 * - Q11: flat list (no parcel grouping).
 * - Q12: paper-2 thumbnail with `package` icon — no product image.
 * - Q16: stepper bounds 1..stock (in packs); X removes the row.
 * - Q19: bare X with no confirm.
 * - Q20: out-of-stock disables checkbox; X stays active.
 * - Q43: this is a screen-local molecule, not extending CartLineItem.
 */
export function LineItemRow({
  derived,
  onIncrement,
  onDecrement,
  onToggleSelected,
  onRemove,
}: LineItemRowProps) {
  const { row, source, isOutOfStock } = derived;
  const title = buildTitle(derived);
  const packEyebrow = buildPackEyebrow(derived);
  const perUnitCopy = isOutOfStock
    ? 'out of stock'
    : buildPerUnitCopy(derived);
  const lineTotalCopy = isOutOfStock
    ? 'Rs. 0'
    : formatRupeesFromCents(derived.lineTotalCents);

  return (
    <li className="border-b border-rule last:border-b-0">
      {/* Desktop layout */}
      <div className="hidden items-center gap-4 px-5 py-4 md:flex">
        <button
          type="button"
          onClick={onToggleSelected}
          disabled={isOutOfStock}
          aria-pressed={row.selected}
          aria-label={row.selected ? 'Deselect item' : 'Select item'}
          className={cn(
            'flex size-[18px] shrink-0 items-center justify-center rounded-[3px] border-[1.5px] transition-colors',
            row.selected
              ? 'border-ink bg-ink text-white'
              : 'border-rule-2 bg-white text-transparent',
            isOutOfStock && 'cursor-not-allowed opacity-50'
          )}
        >
          {row.selected ? (
            <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
              <path
                d="M2 6.5L5 9.5L10 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </button>

        <div
          className={cn(
            'flex size-16 shrink-0 items-center justify-center rounded-md border border-rule bg-paper-2',
            isOutOfStock && 'opacity-50'
          )}
          aria-hidden
        >
          <Package className="size-7 text-ink-3" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-[14px] font-semibold text-ink">
            {title}
          </p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">
            {packEyebrow}
          </p>
          <p
            className={cn(
              'mt-1 font-mono text-[12px]',
              isOutOfStock ? 'text-red' : 'text-ink-3'
            )}
          >
            {perUnitCopy}
          </p>
        </div>

        <QuantityStepper
          value={row.quantity}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          disabled={isOutOfStock}
        />

        <div className="flex w-28 flex-col items-end">
          <span
            className={cn(
              'font-mono text-[16px] font-bold',
              isOutOfStock ? 'text-ink-3' : 'text-ink'
            )}
          >
            {lineTotalCopy}
          </span>
          <span className="mt-0.5">
            <StockLabel derived={derived} />
          </span>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${source.product.name}`}
          className="-m-1 flex size-9 items-center justify-center rounded-sm text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
        >
          <X className="size-[18px]" aria-hidden />
        </button>
      </div>

      {/* Mobile layout */}
      <div className="flex flex-col gap-3 px-4 py-3 md:hidden">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onToggleSelected}
            disabled={isOutOfStock}
            aria-pressed={row.selected}
            aria-label={row.selected ? 'Deselect item' : 'Select item'}
            className={cn(
              'mt-1 flex size-[18px] shrink-0 items-center justify-center rounded-[3px] border-[1.5px]',
              row.selected
                ? 'border-ink bg-ink text-white'
                : 'border-rule-2 bg-white text-transparent',
              isOutOfStock && 'cursor-not-allowed opacity-50'
            )}
          >
            {row.selected ? (
              <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                <path
                  d="M2 6.5L5 9.5L10 3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </button>
          <div
            className={cn(
              'flex size-14 shrink-0 items-center justify-center rounded-md border border-rule bg-paper-2',
              isOutOfStock && 'opacity-50'
            )}
            aria-hidden
          >
            <Package className="size-6 text-ink-3" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[13px] font-semibold leading-tight text-ink">
              {title}
            </p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">
              {packEyebrow}
            </p>
            <p
              className={cn(
                'mt-1 font-mono text-[11px]',
                isOutOfStock ? 'text-red' : 'text-ink-3'
              )}
            >
              {perUnitCopy}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${source.product.name}`}
            className="-m-1 flex size-8 items-center justify-center rounded-sm text-ink-3"
          >
            <X className="size-[18px]" aria-hidden />
          </button>
        </div>
        <div className="flex items-center justify-between pl-7">
          <QuantityStepper
            value={row.quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            disabled={isOutOfStock}
            size="sm"
          />
          <div className="flex flex-col items-end">
            <span
              className={cn(
                'font-mono text-[15px] font-bold',
                isOutOfStock ? 'text-ink-3' : 'text-ink'
              )}
            >
              {lineTotalCopy}
            </span>
            <span className="mt-0.5">
              <StockLabel derived={derived} />
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}
