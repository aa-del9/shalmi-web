'use client';

import {
  TableBody,
  TableCell,
  TableRow,
} from '@repo/ui/components/table';
import { Skeleton } from '@repo/ui/components/skeleton';

type ProductTableSkeletonProps = {
  rowCount?: number;
};

export function ProductTableSkeleton({
  rowCount = 5,
}: ProductTableSkeletonProps) {
  return (
    <TableBody>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-14" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
