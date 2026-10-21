import { ChevronRightIcon } from 'lucide-react';

type AdminBreadcrumbProps = {
  /**
   * Trail rendered as: Admin › ...trail. The final entry renders in
   * `text-ink` weight 600; intermediate entries are non-clickable per
   * Q2 STUBBED (visual-only). The leading `Admin` segment links to the
   * dashboard.
   */
  trail: ReadonlyArray<string>;
};

// TODO(post-v1): wire entries to real routes — see 06-scope-cut.md
// "Admin Catalog sidebar grouping + Breadcrumb component" feature.
export function AdminBreadcrumb({ trail }: AdminBreadcrumbProps) {
  if (trail.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="text-ink-3 flex items-center gap-1.5 text-sm"
    >
      <span className="text-ink-3">Admin</span>
      {trail.map((segment, index) => {
        const isLast = index === trail.length - 1;
        return (
          <span
            key={`${segment}-${index}`}
            className="flex items-center gap-1.5"
          >
            <ChevronRightIcon
              className="text-ink-3 size-3.5 shrink-0"
              aria-hidden
            />
            <span
              className={
                isLast
                  ? 'text-ink font-semibold'
                  : 'text-ink-3'
              }
            >
              {segment}
            </span>
          </span>
        );
      })}
    </nav>
  );
}
