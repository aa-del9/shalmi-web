import { formatPackWeightCaption } from '../../utils/pack-pricing';

interface PdpSpecSectionProps {
  vendorName: string | null;
  packSize: number;
  packWeightGrams: number;
  unitWeightGrams: number | null;
  unitLabel: string | null;
}

export function PdpSpecSection({
  vendorName,
  packSize,
  packWeightGrams,
  unitWeightGrams,
  unitLabel,
}: PdpSpecSectionProps) {
  // Per buyer-product gap-analysis Q19: spec section as a fixed inline list
  // (brand + vendor + weight + pack size from existing data once pack-pricing
  // lands).
  const rows: { label: string; value: string }[] = [];
  if (vendorName) rows.push({ label: 'Vendor', value: vendorName });
  if (packSize > 1) {
    rows.push({
      label: 'Pack of',
      value: `${packSize} ${unitLabel ? unitLabel.toLowerCase() : 'units'}`,
    });
  }
  rows.push({
    label: 'Pack net weight',
    value: formatPackWeightCaption(packWeightGrams),
  });
  if (unitWeightGrams) {
    rows.push({
      label: 'Per-unit weight',
      value: formatPackWeightCaption(unitWeightGrams),
    });
  }

  if (rows.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">
        SPECIFICATIONS
      </h3>
      <dl className="divide-y divide-rule rounded-md border border-rule bg-white">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <dt className="text-ink-3">{row.label}</dt>
            <dd className="font-medium text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
