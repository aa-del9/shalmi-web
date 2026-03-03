'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRetailerOrdersQuery } from './hooks/use-retailer-orders-query';
import { OrderCard } from './components/order-card';
import type { RetailerOrder } from './types';

const TABS = [
  {
    key: 'pending',
    label: 'Naye',
    emoji: '🟡',
    accent: 'bg-amber-500',
    accentText: 'text-amber-600 dark:text-amber-400',
    accentBorder: 'border-amber-500',
    accentBg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    key: 'shipped',
    label: 'Raaste Mein',
    emoji: '🚚',
    accent: 'bg-blue-500',
    accentText: 'text-blue-600 dark:text-blue-400',
    accentBorder: 'border-blue-500',
    accentBg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    key: 'delivered',
    label: 'Mil Gaye',
    emoji: '✅',
    accent: 'bg-emerald-500',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    accentBorder: 'border-emerald-500',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function categorizeOrder(order: RetailerOrder): TabKey {
  const statuses = order.subOrders.map((s) => s.status);
  const allTerminal = statuses.every(
    (s) => s === 'delivered' || s === 'cancelled'
  );
  if (allTerminal) return 'delivered';
  if (statuses.some((s) => s === 'handed_to_courier')) return 'shipped';
  return 'pending';
}

const EMPTY_MESSAGES: Record<TabKey, string> = {
  pending: 'Koi naya order nahi',
  shipped: 'Koi order raaste mein nahi',
  delivered: 'Abhi tak koi delivery nahi',
};

export function RetailerOrders() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');

  const {
    data: allOrders = [],
    isLoading,
    isError,
    error,
  } = useRetailerOrdersQuery();

  const categorized = allOrders.reduce(
    (acc, order) => {
      const tab = categorizeOrder(order);
      acc[tab].push(order);
      return acc;
    },
    { pending: [], shipped: [], delivered: [] } as Record<TabKey, RetailerOrder[]>
  );

  const filteredOrders = categorized[activeTab];

  const tabCounts = TABS.map((tab) => ({
    ...tab,
    count: categorized[tab.key].length,
  }));

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Sticky tab bar */}
      <div className="sticky top-0 z-20 border-b bg-white/95 px-2 py-2 backdrop-blur-md dark:bg-neutral-950/95">
        <div className="flex gap-1.5">
          {tabCounts.map((tab) => {
            const isActive = activeTab === tab.key;
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
                <span className="text-2xl leading-none">{tab.emoji}</span>
                <span
                  className={`text-xs font-bold leading-tight sm:text-sm ${
                    isActive ? tab.accentText : ''
                  }`}
                >
                  {tab.label}
                </span>
                {tab.count > 0 && (
                  <span
                    className={`absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${tab.accent}`}
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
              {EMPTY_MESSAGES[activeTab]}
            </p>
          </div>
        )}

        {!isLoading && !isError && filteredOrders.length > 0 && (
          <div className="mx-auto flex max-w-lg flex-col gap-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
