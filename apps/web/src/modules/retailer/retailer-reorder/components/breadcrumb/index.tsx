import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/ui/components/breadcrumb';
import Link from 'next/link';

interface ReorderBreadcrumbProps {
  displayId: string;
  /** Compact mobile variant per gap-analysis Q1. */
  compact?: boolean;
}

/**
 * Pencil TlaJs — Reorder breadcrumb. Composes the existing shadcn
 * primitive — no custom drawing.
 */
export function ReorderBreadcrumb({
  displayId,
  compact = false,
}: ReorderBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList className={compact ? 'text-[10px]' : ''}>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/profile/orders">Orders</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Reorder {displayId}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
