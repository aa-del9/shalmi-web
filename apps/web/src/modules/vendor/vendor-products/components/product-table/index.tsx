'use client';

import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { PencilIcon } from 'lucide-react';
import type { VendorProductListItem } from '../../types';
import { getVendorProductEditPath } from '../../constants/routes';
import { ProductTableSkeleton } from '../product-table-skeleton';

type ProductTableProps = {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  isSuccess: boolean;
  products: VendorProductListItem[];
};

export function ProductTable({
  isLoading,
  hasError,
  errorMessage,
  isSuccess,
  products,
}: ProductTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="w-24">Weight</TableHead>
            <TableHead className="w-20">Stock</TableHead>
            <TableHead className="w-20">Images</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        {isLoading && <ProductTableSkeleton rowCount={5} />}
        {!isLoading && (
          <TableBody>
            {hasError && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  {errorMessage}
                </TableCell>
              </TableRow>
            )}
            {!hasError && isSuccess && products.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  No products yet. Add your first product to get started.
                </TableCell>
              </TableRow>
            )}
            {!hasError &&
              isSuccess &&
              products.length > 0 &&
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.weightGrams}g</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    {Array.isArray(product.images) ? product.images.length : 0}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={getVendorProductEditPath(product.id)}>
                        <PencilIcon className="size-4" />
                        Edit
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
}
