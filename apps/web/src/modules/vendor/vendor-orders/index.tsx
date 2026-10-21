'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowDownUp, Hourglass, AlertCircle, Inbox } from 'lucide-react';
import dayjs from 'dayjs';

import { Spinner } from '@repo/ui/components/spinner';
import { cn } from '@repo/ui/lib/utils';

import { useVendorOrdersQuery } from './hooks/use-vendor-orders-query';
import { useUpdateSubOrderStatusMutation } from './hooks/use-update-sub-order-status-mutation';
import { OrderCard } from './components/order-card';
import type { VendorSubOrder } from './types';

type SegmentKey = 'new' | 'packed' | 'complete';

interface SegmentDef {
  key: SegmentKey;
  label: string;
  /** Tile palette (border + content + fill — Pencil §3.5). */
  tone: 'amber' | 'neutral' | 'green';
  /** sub_orders.status values that this segment counts/filters. */
  matches: ReadonlyArray<string>;
}

const SEGMENTS: ReadonlyArray<SegmentDef> = [
  { key: 'new', label: 'New · to pack', tone: 'amber', matches: ['pending'] },
  { key: 'packed', label: 'Packed · ready', tone: 'neutral', matches: ['packed'] },
  // Per gap-analysis Q4: third segment = handed_to_courier + delivered rollup.
  {
    key: 'complete',
    label: 'Complete',
    tone: 'green',
    matches: ['handed_to_courier', 'delivered'],
  },
];

function triggerSuccessFeedback() {
  try {
    navigator.vibrate?.([100, 50, 100]);
  } catch {
    // empty — vibrate is best-effort
  }
  try {
    const audio = new Audio('/success-ding.wav');
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {
    // empty — autoplay can be blocked
  }
}

function emptyMessage(segment: SegmentKey): string {
  switch (segment) {
    case 'new':
      return 'No orders waiting to pack.';
    case 'packed':
      return 'No packed orders ready for the courier.';
    case 'complete':
      return 'No completed orders yet.';
    default:
      return 'No orders.';
  }
}

interface StatusSegmentProps {
  def: SegmentDef;
  count: number;
  active: boolean;
  onClick: () => void;
}

function StatusSegment({ def, count, active, onClick }: StatusSegmentProps) {
  const tonePalette = {
    amber: {
      fill: 'bg-amber-bg',
      content: 'text-amber',
      border: 'border-amber',
    },
    neutral: {
      fill: 'bg-white',
      content: 'text-ink',
      border: 'border-rule',
    },
    green: {
      fill: 'bg-green-bg',
      content: 'text-green-700',
      border: 'border-green-700',
    },
  }[def.tone];

  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={cn(
        'flex flex-1 flex-col items-start gap-2 rounded-md border px-5 py-5 text-left transition-shadow md:px-6 md:py-5',
        tonePalette.fill,
        active ? `border-[1.5px] ${tonePalette.border}` : 'border-rule',
        active && 'ring-2 ring-ink/15'
      )}
    >
      <span
        className={cn(
          'font-mono text-[11px] font-bold uppercase tracking-[0.12em]',
          tonePalette.content
        )}
      >
        {def.label}
      </span>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'font-mono text-3xl font-extrabold leading-none tracking-[-0.02em] md:text-4xl',
            tonePalette.content
          )}
        >
          {count}
        </span>
        <span
          className={cn(
            'font-sans text-[12px] font-semibold',
            tonePalette.content
          )}
        >
          {count === 1 ? 'order' : 'orders'}
        </span>
      </div>
    </button>
  );
}

export function VendorOrders() {
  const [activeSegment, setActiveSegment] = useState<SegmentKey>('new');
  const advancingId = useRef<string | null>(null);

  const query = useVendorOrdersQuery();
  const mutation = useUpdateSubOrderStatusMutation();

  const subOrders: VendorSubOrder[] = useMemo(
    () => query.data?.subOrders ?? [],
    [query.data]
  );

  const segmentCounts = useMemo(() => {
    const counts: Record<SegmentKey, number> = {
      new: 0,
      packed: 0,
      complete: 0,
    };
    for (const sub of subOrders) {
      for (const seg of SEGMENTS) {
        if (seg.matches.includes(sub.status)) {
          counts[seg.key] += 1;
        }
      }
    }
    return counts;
  }, [subOrders]);

  const filteredOrders = useMemo(() => {
    const seg = SEGMENTS.find((s) => s.key === activeSegment);
    if (!seg) return subOrders;
    return subOrders.filter((s) => seg.matches.includes(s.status));
  }, [subOrders, activeSegment]);

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

  const today = dayjs().format('DD MMMM YYYY').toUpperCase();
  const heroPrimary =
    activeSegment === 'new'
      ? `${segmentCounts.new} ${segmentCounts.new === 1 ? 'order to pack' : 'orders to pack'}`
      : activeSegment === 'packed'
        ? `${segmentCounts.packed} ready for courier`
        : `${segmentCounts.complete} completed`;

  return (
    <div className="flex flex-col">
      {/* ===== Hero ===== */}
      <header className="flex flex-col gap-3 border-b border-rule bg-paper px-4 py-5 md:gap-5 md:px-12 md:py-10">
        <div className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-amber md:text-xs">
              Today · {today}
            </span>
            <h1 className="font-sans text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink md:text-5xl">
              {heroPrimary}
            </h1>
            <p className="max-w-[600px] text-[13px] text-ink-2 md:text-base">
              Pack each order. Tap the green button when each one is ready.
            </p>
          </div>
          {/* Per scope-cut + Q15: "Print all labels" is DROPPED (Statement /
              CSV downloads). "Need help?" is drawn but not covered by any
              gap-analysis Answer; per CLAUDE.md hard rule 1, we do not
              invent a help-flow target. Both buttons are intentionally
              omitted in Batch 1.
              TODO(post-v1): wire Print all labels when label PDF generation
              ships, and add Help-center link when the support surface lands. */}
        </div>
      </header>

      {/* ===== Status segments ===== */}
      <div
        role="tablist"
        aria-label="Order status filters"
        className="flex gap-2 overflow-hidden border-b border-rule bg-paper px-4 py-3 md:gap-0 md:rounded-md md:border md:border-rule md:bg-white md:p-0 md:mx-12 md:my-6 md:divide-x md:divide-rule"
      >
        {SEGMENTS.map((seg) => (
          <StatusSegment
            key={seg.key}
            def={seg}
            count={segmentCounts[seg.key]}
            active={activeSegment === seg.key}
            onClick={() => setActiveSegment(seg.key)}
          />
        ))}
      </div>

      {/* ===== voSubHd ===== */}
      <div className="flex items-end justify-between gap-3 px-4 pt-4 md:px-12 md:pt-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-sans text-base font-extrabold tracking-[-0.015em] text-ink md:text-2xl">
            Packing list
          </h2>
          <p className="text-xs text-ink-3 md:text-[13px]">
            Oldest first · pack the items in order
          </p>
        </div>
        {/* Visual-only sort indicator (matches Pencil voSubAct). The list
            is server-sorted ASC by createdAt; the pill is presentational. */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3.5 py-2 text-[12px] font-semibold text-ink-2 md:text-[13px]">
          <ArrowDownUp className="size-3.5" aria-hidden />
          Sort: Oldest
        </span>
      </div>

      {/* ===== Cards / states ===== */}
      <section
        aria-label="Order cards"
        className="flex flex-col gap-4 px-4 py-4 pb-12 md:gap-5 md:px-12 md:py-6"
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
                : "Couldn't load orders."}
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-ink-3">
            <Inbox className="size-7 text-ink-4" aria-hidden />
            <p className="text-sm font-medium">{emptyMessage(activeSegment)}</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAdvance={handleAdvance}
              isPending={mutation.isPending && advancingId.current === order.id}
            />
          ))
        )}

        {/* ===== Later zone (static info footer per Q5) ===== */}
        {filteredOrders.length > 0 && activeSegment === 'new' ? (
          <div className="mt-2 flex items-center gap-3.5 rounded-md border border-rule bg-paper-2 px-5 py-4 md:gap-4 md:px-7 md:py-5">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-paper-3 md:size-12">
              <Hourglass className="size-5 text-ink-2 md:size-[22px]" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink md:text-lg">
                More orders queued for today
              </p>
              <p className="text-[11px] text-ink-3 md:text-[13px]">
                They appear here as you finish the current batch.
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
