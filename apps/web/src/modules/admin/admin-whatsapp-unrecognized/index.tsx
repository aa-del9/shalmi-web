'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquareTextIcon } from 'lucide-react';
import { AdminBreadcrumb } from '@/modules/admin/admin-layout/admin-breadcrumb';

type UnrecognizedMessage = {
  id: string;
  phone: string;
  body: string | null;
  messageType: string;
  createdAt: string;
};

const TRUNCATE_AT = 120;

function truncate(text: string | null, max = TRUNCATE_AT): string {
  if (!text) return '—';
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function AdminWhatsappUnrecognized() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'whatsapp-unrecognized'],
    queryFn: async (): Promise<UnrecognizedMessage[]> => {
      const res = await fetch('/api/admin/whatsapp-unrecognized');
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body?.error ?? 'Failed to load messages');
      }
      return body.data ?? [];
    },
  });

  return (
    <div className="flex flex-col gap-5 p-5 md:p-7">
      <AdminBreadcrumb trail={['Operations', 'WhatsApp · Unrecognized']} />

      <header className="flex flex-col gap-1">
        <h1 className="text-ink text-2xl font-extrabold tracking-tight">
          Unrecognized WhatsApp messages
        </h1>
        <p className="text-ink-3 text-sm max-w-2xl">
          Inbound messages from phone numbers we haven&apos;t onboarded.
          Use this list to identify vendors reaching out before they were
          added — once you create the vendor with the matching phone, the
          worker will link future messages automatically.
        </p>
      </header>

      <section className="border-rule rounded-md border bg-white">
        <div className="border-rule bg-paper-2 flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
            Last 30 days
          </h2>
          <span className="text-ink-3 font-mono text-[11px] tracking-[0.04em]">
            {data ? `${data.length} message${data.length === 1 ? '' : 's'}` : ''}
          </span>
        </div>

        {isLoading ? (
          <p className="text-ink-3 px-5 py-8 text-sm">Loading…</p>
        ) : isError ? (
          <p className="px-5 py-8 text-sm text-red-600">
            {error instanceof Error ? error.message : 'Failed to load.'}
          </p>
        ) : data && data.length > 0 ? (
          <ul className="divide-rule divide-y">
            {data.map((row) => (
              <li
                key={row.id}
                className="grid grid-cols-[140px_1fr_140px] items-start gap-4 px-5 py-3 text-sm"
              >
                <span className="text-ink-2 font-mono text-[12px] tracking-[0.04em]">
                  {row.phone}
                </span>
                <span className="text-ink-2">
                  {row.messageType === 'text'
                    ? truncate(row.body)
                    : `[${row.messageType}]`}
                </span>
                <span className="text-ink-3 text-right font-mono text-[11px] tracking-[0.04em]">
                  {formatTimestamp(row.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <MessageSquareTextIcon
              className="text-ink-4 size-8"
              aria-hidden
            />
            <p className="text-ink-2 font-semibold">No unrecognized messages</p>
            <p className="text-ink-3 max-w-sm text-sm">
              When a phone number we haven&apos;t onboarded sends a WhatsApp
              message, it will appear here so you can decide whether to add
              them as a vendor.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
