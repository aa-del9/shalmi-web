import { AdminBreadcrumb } from '@/modules/admin/admin-layout/admin-breadcrumb';

type ComingSoonProps = {
  /** Page title rendered as h1 */
  title: string;
  /** Breadcrumb trail, e.g. ['Operations', 'Orders'] */
  trail: ReadonlyArray<string>;
  /** One-line subtitle / description */
  description?: string;
};

// Placeholder page used by the new admin nav rows pending dedicated screens.
// TODO(post-v1): replace with real surface as it lands per scope-cut.
export function ComingSoonShell({ title, trail, description }: ComingSoonProps) {
  return (
    <div className="space-y-5">
      <AdminBreadcrumb trail={trail} />
      <div className="border-rule rounded-md border bg-white p-8 text-center">
        <h1 className="text-ink text-2xl font-extrabold">{title}</h1>
        <p className="text-ink-3 mt-2 text-sm">
          {description ??
            'This surface is on the roadmap. Check back after the next milestone.'}
        </p>
      </div>
    </div>
  );
}
