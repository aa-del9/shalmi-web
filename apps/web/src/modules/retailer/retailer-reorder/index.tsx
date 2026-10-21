'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useRetailerOrderDetailQuery } from '../retailer-order-detail/hooks/use-retailer-order-detail-query';
import { useReorderDraft } from './hooks/use-reorder-draft';
import { useCartStore } from '@/modules/cart/stores/cart-store';
import { useAddressesQuery } from '@/modules/user-addresses/hooks/use-addresses-query';
import { resolveDeliveryTier } from '@/modules/cart/utils/delivery-tiers';
import type { CartItemInput } from '@/modules/cart/types';
import { ReorderBreadcrumb } from './components/breadcrumb';
import { PageHeader } from './components/page-header';
import { WeightGauge } from './components/weight-gauge';
import { HelpBanner } from './components/help-banner';
import { ItemsToolbar } from './components/items-toolbar';
import { ItemsList } from './components/items-list';
import { Receipt } from './components/receipt';
import { ComparisonCard } from './components/comparison-card';
import { CtaStack } from './components/cta-stack';
import { StickyBar } from './components/sticky-bar';
import { ReorderSkeleton, ReorderError } from './components/states';

interface RetailerReorderProps {
  orderId: string;
}

export function RetailerReorder({ orderId }: RetailerReorderProps) {
  const router = useRouter();
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useRetailerOrderDetailQuery(orderId);

  const draft = useReorderDraft(order);
  const { state, dispatch, derivedRows, items, itemsById } = draft;

  const addItem = useCartStore((s) => s.addItem);
  const { data: addresses } = useAddressesQuery();
  const defaultAddress = useMemo(
    () => addresses?.find((a) => a.isDefault) ?? addresses?.[0] ?? null,
    [addresses]
  );

  // Re-seed draft when order arrives (initial render uses []).
  useEffect(() => {
    if (!order) return;
    if (state.order.length === 0 && items.length > 0) {
      dispatch({
        type: 'init',
        rows: items.map((item) => {
          const defaultTier = item.product.packTiers.find((t) => t.isDefault);
          const fallbackTier = item.product.packTiers[0];
          const selectedPackQty =
            defaultTier?.packQty ?? fallbackTier?.packQty ?? 1;
          return {
            itemId: item.id,
            productId: item.productId,
            selected: item.product.stock > 0,
            removed: false,
            quantity: Math.max(1, item.quantity),
            selectedPackQty,
            originalQuantity: item.quantity,
          };
        }),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const selectedRows = derivedRows.filter(
    (r) => r.row.selected && !r.isOutOfStock
  );

  const subtotalCents = selectedRows.reduce(
    (sum, r) => sum + r.lineTotalCents,
    0
  );
  const totalWeightGrams = selectedRows.reduce(
    (sum, r) => sum + r.lineWeightGrams,
    0
  );
  const selectedCount = selectedRows.length;

  const allSelectableSelected = useMemo(() => {
    const selectables = derivedRows.filter((r) => !r.isOutOfStock);
    if (selectables.length === 0) return false;
    return selectables.every((r) => r.row.selected);
  }, [derivedRows]);

  const changesCount = useMemo(() => {
    let count = 0;
    for (const id of state.order) {
      const row = state.rowsById[id];
      const item = itemsById.get(id);
      if (!row || !item) continue;
      if (row.removed) {
        count += 1;
        continue;
      }
      if (row.quantity !== row.originalQuantity) count += 1;
      else if (!row.selected && item.product.stock > 0) count += 1;
    }
    return count;
  }, [state, itemsById]);

  const handleAddToCart = () => {
    if (selectedCount <= 0) return;
    for (const r of selectedRows) {
      const input: CartItemInput = {
        productId: r.source.productId,
        name: r.source.product.name,
        slug: r.source.product.slug,
        image: r.source.product.imageRecord ?? null,
        packWeightGrams: r.source.product.packWeightGrams,
        packSize: r.source.product.packSize,
        unitLabel: r.source.product.unitLabel,
        vendorId: r.source.product.vendorId,
        vendorName: r.source.product.vendorName ?? '',
        packTiers: r.source.product.packTiers,
        selectedPackQty: r.row.selectedPackQty,
      };
      addItem(input, r.row.quantity);
    }
    toast.success(
      `${selectedCount} item${selectedCount === 1 ? '' : 's'} added to cart`
    );
    router.push('/cart');
  };

  if (isLoading) {
    return (
      <div className="bg-paper">
        <div className="mx-auto max-w-[1360px] px-4 py-6 lg:px-10 lg:py-10">
          <ReorderSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-paper">
        <div className="mx-auto max-w-[1360px] px-4 py-6 lg:px-10 lg:py-10">
          <ReorderError
            message={error?.message ?? 'Failed to load order details'}
            onRetry={() => {
              void refetch();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[1360px] px-4 pt-4 pb-6 lg:px-10 lg:pt-8 lg:pb-10">
        <div className="hidden lg:block">
          <ReorderBreadcrumb displayId={order.displayId} />
        </div>
        <div className="lg:hidden">
          <ReorderBreadcrumb displayId={order.displayId} compact />
        </div>
        <div className="mt-4 hidden lg:block">
          <PageHeader
            displayId={order.displayId}
            createdAtIso={order.createdAt}
          />
        </div>
        <div className="mt-3 lg:hidden">
          <PageHeader
            displayId={order.displayId}
            createdAtIso={order.createdAt}
            mobile
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          {/* Left column */}
          <div className="space-y-4">
            <WeightGauge weightGrams={totalWeightGrams} />
            <div className="hidden md:block">
              <HelpBanner weightGrams={totalWeightGrams} />
            </div>
            <div className="md:hidden">
              <HelpBanner weightGrams={totalWeightGrams} compact />
            </div>
            <ItemsToolbar
              itemCount={derivedRows.length}
              changesCount={changesCount}
              allSelected={allSelectableSelected}
              onToggleSelectAll={() =>
                dispatch({
                  type: allSelectableSelected ? 'deselectAll' : 'selectAll',
                })
              }
            />
            <ItemsList
              rows={derivedRows}
              onIncrement={(id) => dispatch({ type: 'increment', itemId: id })}
              onDecrement={(id) => dispatch({ type: 'decrement', itemId: id })}
              onToggleSelected={(id) =>
                dispatch({ type: 'toggleSelected', itemId: id })
              }
              onRemove={(id) => dispatch({ type: 'remove', itemId: id })}
            />
          </div>

          {/* Right column — desktop only */}
          <aside className="hidden flex-col gap-4 lg:flex">
            <Receipt
              itemCount={selectedCount}
              subtotalCents={subtotalCents}
              weightGrams={totalWeightGrams}
            />
            <ComparisonCard
              originalTotalCents={order.grandTotal}
              reorderTotalCents={
                subtotalCents + resolveDeliveryTier(totalWeightGrams).feeCents
              }
            />
            <CtaStack
              selectedCount={selectedCount}
              onAddToCart={handleAddToCart}
              deliveryCity={defaultAddress?.city ?? null}
            />
          </aside>

          {/* Mobile receipt below the items list */}
          <div className="lg:hidden">
            <Receipt
              itemCount={selectedCount}
              subtotalCents={subtotalCents}
              weightGrams={totalWeightGrams}
              compact
            />
          </div>
        </div>
      </div>
      <StickyBar
        selectedCount={selectedCount}
        totalCents={subtotalCents}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
