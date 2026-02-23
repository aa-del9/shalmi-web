'use client';

import { TableBody, TableCell, TableRow } from '@repo/ui/components/table';
import { Skeleton } from '@repo/ui/components/skeleton';

type VendorsTableSkeletonProps = {
  rowCount?: number;
};

export function VendorsTableSkeleton({
  rowCount = 5,
}: VendorsTableSkeletonProps) {
  return (
    <TableBody>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-14" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
