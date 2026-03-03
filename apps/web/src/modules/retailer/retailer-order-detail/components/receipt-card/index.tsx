'use client';

import type { OrderDetail } from '../../types';

type ReceiptCardProps = {
  order: OrderDetail;
};

export function ReceiptCard({ order }: ReceiptCardProps) {
  const cancelledSubOrders = order.subOrders.filter(
    (s) => s.status === 'cancelled'
  );
  const walletRefund = cancelledSubOrders.reduce(
    (sum, s) => sum + s.codAmount,
    0
  );

  const activeGrandTotal = order.grandTotal - walletRefund;

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#fefcf5] shadow-md dark:bg-neutral-900/80">
      {/* Jagged top edge */}
      <div
        className="h-3 w-full"
        style={{
          background:
            'repeating-linear-gradient(90deg, transparent, transparent 8px, #fefcf5 8px, #fefcf5 16px)',
          WebkitMaskImage:
            'linear-gradient(135deg, transparent 33.33%, #fefcf5 33.33%, #fefcf5 66.66%, transparent 66.66%), linear-gradient(225deg, transparent 33.33%, #fefcf5 33.33%, #fefcf5 66.66%, transparent 66.66%)',
          WebkitMaskSize: '16px 100%',
          WebkitMaskRepeat: 'repeat-x',
        }}
      />

      <div className="px-5 pt-2 pb-5">
        {/* Receipt header */}
        <div className="mb-3 text-center">
          <p className="text-[10px] font-medium tracking-widest text-neutral-400 uppercase">
            🧾 Payment Summary
          </p>
          <p className="mt-0.5 font-mono text-xs text-neutral-400">
            {order.displayId}
          </p>
        </div>

        <div className="border-t border-dashed border-neutral-300 pt-3 dark:border-neutral-700">
          {/* Line items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Items Total
              </span>
              <span className="font-mono text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Rs. {order.totalItemsCost.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Shipping Fee
              </span>
              <span className="font-mono text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Rs. {order.totalShippingCost.toLocaleString()}
              </span>
            </div>

            {walletRefund > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-600 dark:text-emerald-400">
                  Wallet Refund (Items not available)
                </span>
                <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  -Rs. {walletRefund.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Total separator */}
          <div className="my-3 border-t border-dashed border-neutral-300 dark:border-neutral-700" />

          {/* COD Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              COD Amount to Collect
            </span>
            <span className="font-mono text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
              Rs. {activeGrandTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Jagged bottom edge */}
      <div
        className="h-3 w-full"
        style={{
          background:
            'repeating-linear-gradient(90deg, transparent, transparent 8px, #fefcf5 8px, #fefcf5 16px)',
          WebkitMaskImage:
            'linear-gradient(315deg, transparent 33.33%, #fefcf5 33.33%, #fefcf5 66.66%, transparent 66.66%), linear-gradient(45deg, transparent 33.33%, #fefcf5 33.33%, #fefcf5 66.66%, transparent 66.66%)',
          WebkitMaskSize: '16px 100%',
          WebkitMaskRepeat: 'repeat-x',
        }}
      />
    </div>
  );
}
