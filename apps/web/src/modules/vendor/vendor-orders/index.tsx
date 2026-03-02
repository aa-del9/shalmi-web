'use client';

import { useState, useCallback, useRef } from 'react';
import { Package, PackageCheck, Truck, Loader2 } from 'lucide-react';
import { useVendorOrdersQuery } from './hooks/use-vendor-orders-query';
import { useUpdateSubOrderStatusMutation } from './hooks/use-update-sub-order-status-mutation';
import { OrderCard } from './components/order-card';

const TABS = [
  {
    key: 'pending',
    label: 'Naye Order',
    icon: Package,
    accent: 'bg-amber-500',
    accentText: 'text-amber-600 dark:text-amber-400',
    accentBorder: 'border-amber-500',
    accentBg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    key: 'packed',
    label: 'Pack Ho Rahay',
    icon: PackageCheck,
    accent: 'bg-blue-500',
    accentText: 'text-blue-600 dark:text-blue-400',
    accentBorder: 'border-blue-500',
    accentBg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    key: 'handed_to_courier',
    label: 'Bhejne Ke Liye Tayar',
    icon: Truck,
    accent: 'bg-emerald-500',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    accentBorder: 'border-emerald-500',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
] as const;

const EMPTY_MESSAGES: Record<string, string> = {
  pending: 'Koi naya order nahi',
  packed: 'Abhi kuch pack nahi ho raha',
  handed_to_courier: 'Courier ke liye kuch tayar nahi',
};

function triggerSuccessFeedback() {
  try {
    navigator.vibrate?.([100, 50, 100]);
  } catch {
    // empty
  }

  try {
    const audio = new Audio('/success-ding.wav');
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {
    // empty
  }
}

export function VendorOrders() {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const advancingId = useRef<string | null>(null);

  const {
    data: allOrders = [],
    isLoading,
    isError,
    error,
  } = useVendorOrdersQuery();

  const mutation = useUpdateSubOrderStatusMutation();

  const filteredOrders = allOrders.filter((o) => o.status === activeTab);

  const handleAdvance = useCallback(
    (subOrderId: string) => {
      advancingId.current = subOrderId;
      mutation.mutate(subOrderId, {
        onSuccess: () => {
          triggerSuccessFeedback();
          advancingId.current = null;
        },
        onError: () => {
          advancingId.current = null;
        },
      });
    },
    [mutation]
  );

  const tabCounts = TABS.map((tab) => ({
    ...tab,
    count: allOrders.filter((o) => o.status === tab.key).length,
  }));

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Sticky tab bar */}
      <div className="sticky top-0 z-20 border-b bg-white/95 px-2 py-2 backdrop-blur-md dark:bg-neutral-950/95">
        <div className="flex gap-1.5">
          {tabCounts.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                aria-selected={isActive}
                role="tab"
                className={`relative flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-3 text-center transition-all ${
                  isActive
                    ? `${tab.accentBg} ${tab.accentBorder} border-2 shadow-sm`
                    : 'border-2 border-transparent text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                <Icon className={`size-6 ${isActive ? tab.accentText : ''}`} />
                <span
                  className={`text-xs leading-tight font-bold sm:text-sm ${
                    isActive ? tab.accentText : ''
                  }`}
                >
                  {tab.label}
                </span>
                {tab.count > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${tab.accent}`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-3 py-4 sm:px-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-400">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-lg">Orders load ho rahay hain...</p>
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-lg font-medium text-red-600 dark:text-red-400">
              {error?.message ?? 'Orders load nahi ho sakay'}
            </p>
          </div>
        )}

        {!isLoading && !isError && filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-400">
            <span className="text-5xl">📭</span>
            <p className="text-lg font-medium">
              {EMPTY_MESSAGES[activeTab] ?? 'Koi order nahi'}
            </p>
          </div>
        )}

        {!isLoading && !isError && filteredOrders.length > 0 && (
          <div className="mx-auto flex max-w-lg flex-col gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAdvance={handleAdvance}
                isPending={
                  mutation.isPending && advancingId.current === order.id
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
