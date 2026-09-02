import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/ui/components/breadcrumb';
import Link from 'next/link';

interface BreadcrumbCrumb {
  label: string;
  href?: string;
}

interface SettingsBreadcrumbProps {
  trail: BreadcrumbCrumb[];
}

/**
 * Settings breadcrumb — Pencil pdIJF "Home › Account › Settings".
 *
 * Per gap-analysis Q2 STUBBED: shadcn `Breadcrumb` already in `@repo/ui`;
 * this composes it with the trail config the Settings layout passes in.
 */
export function SettingsBreadcrumb({ trail }: SettingsBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {trail.map((crumb, idx) => {
          const last = idx === trail.length - 1;
          return (
            <span key={`${crumb.label}-${idx}`} className="contents">
              <BreadcrumbItem>
                {last || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!last ? <BreadcrumbSeparator /> : null}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
