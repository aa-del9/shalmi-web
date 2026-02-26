'use client';

import { TableBody, TableCell, TableRow } from '@repo/ui/components/table';
import { Skeleton } from '@repo/ui/components/skeleton';

type CategoriesTableSkeletonProps = {
  rowCount?: number;
};

export function CategoriesTableSkeleton({
  rowCount = 5,
}: CategoriesTableSkeletonProps) {
  return (
    <TableBody>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-10 w-10 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-14" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
