'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  Inbox,
} from 'lucide-react';

import { Spinner } from '@repo/ui/components/spinner';
import { LanguageToggle } from '@repo/ui/components/language-toggle';
import { cn } from '@repo/ui/lib/utils';

import {
  isCancelledOrder,
  isDeliveredOrder,
  isInTransit,
} from '@/modules/core/utils/order-status-display';
import { formatRupeesFromCents } from '@/modules/core/utils/format-price';

import { useRetailerOrdersQuery } from './hooks/use-retailer-orders-query';
import { OrderCard } from './components/order-card';
import type {
  RetailerOrder,
  RetailerOrdersSort,
  RetailerOrdersResponse,
} from './types';

type TabKey = 'all' | 'in_transit' | 'delivered' | 'cancelled';

const TABS: ReadonlyArray<{ key: TabKey; label: string }> = [
  { key: 'all', label: 'All orders' },
  { key: 'in_transit', label: 'In transit' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const SORT_OPTIONS: ReadonlyArray<{ key: RetailerOrdersSort; label: string }> =
  [
    { key: 'newest', label: 'Newest first' },
    { key: 'oldest', label: 'Oldest first' },
  ];

function categorizeOrder(order: RetailerOrder, tab: TabKey): boolean {
  if (tab === 'all') return true;
  const statuses = order.subOrders.map((s) => s.status);
  if (tab === 'cancelled') return isCancelledOrder(statuses);
  if (tab === 'delivered') return isDeliveredOrder(statuses);
  if (tab === 'in_transit') return isInTransit(statuses);
  return true;
}

function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

interface TabPillProps {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  size?: 'sm' | 'md';
}

function TabPill({
  active,
  label,
  count,
  onClick,
  size = 'md',
}: TabPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full transition-colors',
        size === 'md' ? 'px-3.5 py-2' : 'px-3 py-1.5',
        active
          ? 'bg-ink text-white'
          : 'border border-ink/20 bg-white text-ink-2 hover:bg-paper-2'
      )}
    >
      <span
        className={cn(
          'font-sans text-[13px]',
          active ? 'font-bold' : 'font-semibold'
        )}
      >
        {label}
      </span>
      {typeof count === 'number' ? (
        <span
          className={cn(
            'font-mono text-[11px] font-bold',
            active ? 'text-white/70' : 'text-ink-3'
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

function emptyMessage(tab: TabKey, hasQuery: boolean): string {
  if (hasQuery) return 'No orders match your search.';
  switch (tab) {
    case 'in_transit':
      return 'No orders are in transit.';
    case 'delivered':
      return 'No deliveries yet.';
    case 'cancelled':
      return 'No cancelled orders.';
    default:
      return "You haven't placed any orders yet.";
  }
}

export function RetailerOrders() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState<RetailerOrdersSort>('newest');
  const debouncedQuery = useDebouncedValue(searchInput);

  const query = useRetailerOrdersQuery({ q: debouncedQuery, sort });

  const response: RetailerOrdersResponse = query.data ?? {
    orders: [],
    summary: { count: 0, lifetimeTotalCents: 0 },
  };
  const { orders: fetchedOrders, summary } = response;

  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = {
      all: fetchedOrders.length,
      in_transit: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const order of fetchedOrders) {
      const statuses = order.subOrders.map((s) => s.status);
      if (isCancelledOrder(statuses)) counts.cancelled += 1;
      else if (isDeliveredOrder(statuses)) counts.delivered += 1;
      else if (isInTransit(statuses)) counts.in_transit += 1;
    }
    return counts;
  }, [fetchedOrders]);

  const filteredOrders = useMemo(
    () => fetchedOrders.filter((order) => categorizeOrder(order, activeTab)),
    [fetchedOrders, activeTab]
  );

  return (
    <div className="bg-paper">
      {/* ===== Mobile app bar ===== */}
      <div className="flex items-center justify-between border-b border-rule bg-paper px-4 py-3.5 md:hidden">
        {/* `/profile` has no page route yet — Batch 6 lands the account
            drawer there. `prefetch={false}` avoids a 404 RSC fetch. */}
        <Link
          href="/profile"
          prefetch={false}
          className="inline-flex items-center gap-2.5 text-ink"
          aria-label="Back to profile"
        >
          <ChevronLeft className="size-6" />
          <span className="font-sans text-lg font-bold tracking-[-0.01em]">
            Your orders
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Q23: STUBBED — visible-but-inert. */}
          {/* TODO(post-v1): wire LanguageToggle to global i18n state. */}
          <LanguageToggle disabled />
          <Link
            href="/profile"
            prefetch={false}
            className="inline-flex size-10 items-center justify-center rounded-full bg-paper-2 text-ink"
            aria-label="Account"
          >
            <span className="font-sans text-sm font-semibold">
              <UserGlyph />
            </span>
          </Link>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-0 py-0 md:px-10 md:py-10 md:pb-20">
        {/* ===== Desktop breadcrumb ===== */}
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-2 md:flex"
        >
          <Link href="/" className="text-[13px] text-ink-3 hover:text-ink-2">
            Home
          </Link>
          <ChevronRight className="size-3.5 text-ink-3" aria-hidden />
          <Link
            href="/profile"
            prefetch={false}
            className="text-[13px] text-ink-3 hover:text-ink-2"
          >
            Account
          </Link>
          <ChevronRight className="size-3.5 text-ink-3" aria-hidden />
          <span className="text-[13px] font-semibold text-ink">Orders</span>
        </nav>

        {/* ===== Desktop page header ===== */}
        <header className="hidden items-center justify-between md:flex">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-sans text-4xl font-extrabold tracking-[-0.02em] text-ink">
              Your orders
            </h1>
            <p className="text-sm text-ink-3">
              {summary.count} {summary.count === 1 ? 'order' : 'orders'} ·{' '}
              {formatRupeesFromCents(summary.lifetimeTotalCents)} lifetime
            </p>
          </div>
          {/* Per Batch 1 watch-out + scope-cut: Export CSV is DROPPED, and
              "Quick reorder" depends on the Batch 5 Reorder screen. The
              right-side action cluster is intentionally empty for now. */}
        </header>

        {/* ===== Filter card (desktop) ===== */}
        <section
          aria-label="Filters"
          className="hidden flex-col gap-3 rounded-md border border-rule bg-white px-5 py-4 md:flex md:flex-row md:items-center"
        >
          <div className="flex flex-wrap items-center gap-1" role="tablist">
            {TABS.map((tab) => (
              <TabPill
                key={tab.key}
                active={activeTab === tab.key}
                label={tab.label}
                count={tabCounts[tab.key]}
                onClick={() => setActiveTab(tab.key)}
              />
            ))}
          </div>

          <div className="flex-1" />

          <label className="inline-flex h-10 min-w-[260px] items-center gap-2 rounded-sm bg-paper-2 px-3.5 text-ink-3 focus-within:text-ink-2">
            <Search className="size-4" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order ID or product"
              className="w-full bg-transparent text-[13px] text-ink-2 placeholder:text-ink-3 focus:outline-none"
            />
          </label>

          <SortControl value={sort} onChange={setSort} />
        </section>

        {/* ===== Filter row (mobile) ===== */}
        <div
          className="flex gap-2 overflow-x-auto border-b border-rule px-4 py-3 md:hidden"
          role="tablist"
          aria-label="Order filter tabs"
        >
          {TABS.map((tab) => (
            <TabPill
              key={tab.key}
              size="sm"
              active={activeTab === tab.key}
              label={tab.key === 'all' ? 'All' : tab.label}
              count={tabCounts[tab.key]}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </div>

        {/* ===== Mobile search/sort row ===== */}
        <div className="flex flex-col gap-2 px-4 md:hidden">
          <label className="inline-flex h-10 items-center gap-2 rounded-sm bg-paper-2 px-3.5 text-ink-3 focus-within:text-ink-2">
            <Search className="size-4" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order ID or product"
              className="w-full bg-transparent text-[13px] text-ink-2 placeholder:text-ink-3 focus:outline-none"
            />
          </label>
          <SortControl value={sort} onChange={setSort} />
        </div>

        {/* ===== List / states ===== */}
        <section
          aria-label="Order list"
          className="flex flex-col gap-4 px-4 pb-12 md:gap-4 md:px-0 md:pb-0"
        >
          {query.isLoading ? (
            <div className="flex flex-col items-center gap-3 py-16 text-ink-3">
              <Spinner className="size-6 text-ink" />
              <p className="text-sm">Loading orders…</p>
            </div>
          ) : query.isError ? (
            <div className="flex flex-col items-center gap-3 rounded-md border border-red bg-red-bg px-4 py-10 text-center">
              <AlertCircle className="size-6 text-red" />
              <p className="text-sm font-semibold text-red">
                {query.error instanceof Error
                  ? query.error.message
                  : "Couldn't load your orders."}
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-ink-3">
              <Inbox className="size-7 text-ink-4" aria-hidden />
              <p className="text-sm font-medium">
                {emptyMessage(activeTab, debouncedQuery.length > 0)}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </section>
      </div>
    </div>
  );
}

interface SortControlProps {
  value: RetailerOrdersSort;
  onChange: (next: RetailerOrdersSort) => void;
}

function SortControl({ value, onChange }: SortControlProps) {
  const [open, setOpen] = useState(false);

  const current = SORT_OPTIONS.find((o) => o.key === value) ?? SORT_OPTIONS[0]!;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-sm border-[1.5px] border-ink/20 bg-white px-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-paper-2"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ArrowDownUp className="size-3.5" aria-hidden />
        {current.label}
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 z-10 mt-1.5 w-44 overflow-hidden rounded-sm border border-rule bg-white"
        >
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.key}>
              <button
                type="button"
                role="option"
                aria-selected={opt.key === value}
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center px-3.5 py-2 text-left text-[13px] transition-colors hover:bg-paper-2',
                  opt.key === value
                    ? 'font-semibold text-ink'
                    : 'font-medium text-ink-2'
                )}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function UserGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
