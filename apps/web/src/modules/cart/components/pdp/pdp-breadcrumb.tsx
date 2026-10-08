import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/ui/components/breadcrumb';

interface PdpBreadcrumbProps {
  category: { name: string; slug: string } | null;
  productName: string;
  className?: string;
}

export function PdpBreadcrumb({
  category,
  productName,
  className,
}: PdpBreadcrumbProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" prefetch={false}>
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {category ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/categories/${category.slug}`}
                  prefetch={false}
                >
                  {category.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ) : null}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="line-clamp-1 normal-case">
            {productName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
