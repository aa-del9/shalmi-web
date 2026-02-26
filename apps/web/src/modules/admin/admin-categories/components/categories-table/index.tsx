'use client';

import Image from 'next/image';
import { Button } from '@repo/ui/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import type { CategoryListItem } from '../../types';
import { CategoriesTableSkeleton } from '../categories-table-skeleton';

type CategoriesTableProps = {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  isSuccess: boolean;
  categories: CategoryListItem[];
  onEditClick: (categoryId: string) => void;
};

function formatDate(value: Date | string): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function CategoriesTable({
  isLoading,
  hasError,
  errorMessage,
  isSuccess,
  categories,
  onEditClick,
}: CategoriesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        {isLoading && <CategoriesTableSkeleton rowCount={5} />}
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
            {!hasError && isSuccess && categories.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  No categories yet.
                </TableCell>
              </TableRow>
            )}
            {!hasError &&
              isSuccess &&
              categories.length > 0 &&
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {category.slug}
                  </TableCell>
                  <TableCell>
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEditClick(category.id)}
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
