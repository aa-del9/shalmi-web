'use client';

import { SearchIcon } from 'lucide-react';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import type { CategoryListItem } from '@/modules/common/queries/categories';
import type {
  VendorProductsSort,
  VendorProductsStatusFilter,
} from '../../types';

type ProductsFilterBarProps = {
  q: string;
  onQueryChange: (next: string) => void;
  status: VendorProductsStatusFilter;
  onStatusChange: (next: VendorProductsStatusFilter) => void;
  categoryId: string | null;
  onCategoryChange: (next: string | null) => void;
  sort: VendorProductsSort;
  onSortChange: (next: VendorProductsSort) => void;
  categories: CategoryListItem[];
};

export function ProductsFilterBar({
  q,
  onQueryChange,
  status,
  onStatusChange,
  categoryId,
  onCategoryChange,
  sort,
  onSortChange,
  categories,
}: ProductsFilterBarProps) {
  return (
    <div className="border-rule hidden flex-wrap items-center gap-3 border-b px-5 py-3 md:flex">
      <label className="relative flex-1 min-w-[240px] max-w-[360px]">
        <SearchIcon
          className="text-ink-3 pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          aria-label="Search products"
          placeholder="Search products, SKU, brand…"
          value={q}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-9"
        />
      </label>
      <Select
        value={categoryId ?? 'all'}
        onValueChange={(v) => onCategoryChange(v === 'all' ? null : v)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={status}
        onValueChange={(v) => onStatusChange(v as VendorProductsStatusFilter)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status: any" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Status: any</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="low-stock">Low stock</SelectItem>
          <SelectItem value="drafts">Drafts</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={sort}
        onValueChange={(v) => onSortChange(v as VendorProductsSort)}
      >
        <SelectTrigger className="ml-auto w-[160px]">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Sort: newest</SelectItem>
          <SelectItem value="oldest">Sort: oldest</SelectItem>
          <SelectItem value="stock-asc">Sort: stock low → high</SelectItem>
          <SelectItem value="stock-desc">Sort: stock high → low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
