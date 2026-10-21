'use client';

import { RIDER_NOTES_MAX_LENGTH } from '@repo/schemas/orders/checkout';

interface RiderInstructionsSectionProps {
  value: string;
  onChange: (next: string) => void;
}

export function RiderInstructionsSection({
  value,
  onChange,
}: RiderInstructionsSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-ink">
        <span className="text-ink-3">02</span>{' '}
        <span className="ml-2">RIDER INSTRUCTIONS</span>
      </h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={RIDER_NOTES_MAX_LENGTH}
        placeholder="e.g. Call before arrival, leave with the shopkeeper next door…"
        className="w-full rounded-sm border-[1.5px] border-rule-2 bg-white p-3 text-sm text-ink-2 placeholder:text-ink-4 focus:border-ink focus:outline-none md:h-[120px] h-[90px]"
      />
      <p className="text-right font-mono text-[10px] text-ink-3">
        {value.length}/{RIDER_NOTES_MAX_LENGTH}
      </p>
    </section>
  );
}
