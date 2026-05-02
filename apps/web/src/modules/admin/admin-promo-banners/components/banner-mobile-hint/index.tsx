import { InfoIcon } from 'lucide-react';

// Q1 binding: mobile is read-only — render footer hint instructing users to
// edit on desktop.
export function BannerMobileHint() {
  return (
    <div
      role="note"
      className="border-rule bg-paper-2 text-ink-3 flex items-center gap-2 rounded-md border px-3 py-2 text-xs md:hidden"
    >
      <InfoIcon className="size-3.5 shrink-0" aria-hidden />
      <span>Edit banners from desktop. Mobile is read-only for now.</span>
    </div>
  );
}
