'use client';

import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import { PlusIcon } from 'lucide-react';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';

export function ProductListPageHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          My Products
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your product catalog and pricing tiers.
        </p>
      </div>
      <Button asChild>
        <Link href={ABSOLUTE_ROUTES.VENDOR_PRODUCTS_NEW}>
          <PlusIcon className="size-4" />
          Add Product
        </Link>
      </Button>
    </div>
  );
}
