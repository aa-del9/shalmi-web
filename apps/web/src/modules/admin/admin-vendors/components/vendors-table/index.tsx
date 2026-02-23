'use client';

import { Button } from '@repo/ui/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import type { VendorListItem } from '../../types';
import { VendorsTableSkeleton } from '../vendors-table-skeleton';

type VendorsTableProps = {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  isSuccess: boolean;
  vendors: VendorListItem[];
  onEditClick: (vendorId: string) => void;
};

export function VendorsTable({
  isLoading,
  hasError,
  errorMessage,
  isSuccess,
  vendors,
  onEditClick,
}: VendorsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shop Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Market Hub</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        {isLoading && <VendorsTableSkeleton rowCount={5} />}
        {!isLoading && (
          <TableBody>
            {hasError && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground h-24 text-center"
                >
                  {errorMessage}
                </TableCell>
              </TableRow>
            )}
            {!hasError && isSuccess && vendors.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground h-24 text-center"
                >
                  No vendors yet.
                </TableCell>
              </TableRow>
            )}
            {!hasError &&
              isSuccess &&
              vendors.length > 0 &&
              vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">
                    {vendor.shopName}
                  </TableCell>
                  <TableCell>{vendor.phoneNumber ?? '—'}</TableCell>
                  <TableCell>{vendor.city || '—'}</TableCell>
                  <TableCell>{vendor.marketHub}</TableCell>
                  <TableCell>
                    <span
                      className={
                        vendor.isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-muted-foreground'
                      }
                    >
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEditClick(vendor.id)}
                    >
                      Edit
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
