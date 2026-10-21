'use client';

import { ArrowDownUpIcon, SearchIcon } from 'lucide-react';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { cn } from '@repo/ui/lib/utils';
import type {
  AdminCategoriesSortDir,
  AdminCategoriesSortKey,
  AdminCategoriesStatusFilter,
} from '../../hooks/use-admin-categories-query';

type CategoriesFiltersProps = {
  status: AdminCategoriesStatusFilter;
  onStatusChange: (next: AdminCategoriesStatusFilter) => void;
  searchInput: string;
  onSearchInputChange: (next: string) => void;
  sortValue: `${AdminCategoriesSortKey}:${AdminCategoriesSortDir}`;
  onSortValueChange: (
    next: `${AdminCategoriesSortKey}:${AdminCategoriesSortDir}`
  ) => void;
  totals: {
    all: number;
    active: number;
    inactive: number;
  };
};

const STATUS_TABS: ReadonlyArray<{
  key: AdminCategoriesStatusFilter;
  label: string;
}> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

export function CategoriesFilters({
  status,
  onStatusChange,
  searchInput,
  onSearchInputChange,
  sortValue,
  onSortValueChange,
  totals,
}: CategoriesFiltersProps) {
  return (
    <section
      aria-label="Filters"
      className="border-rule flex flex-col gap-3 rounded-md border bg-white p-3 md:flex-row md:items-center md:justify-between md:p-4"
    >
      <div
        role="tablist"
        aria-label="Status"
        className="flex flex-wrap items-center gap-1.5"
      >
        {STATUS_TABS.map((tab) => {
          const isSelected = tab.key === status;
          const count =
            tab.key === 'all'
              ? totals.all
              : tab.key === 'active'
                ? totals.active
                : totals.inactive;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onStatusChange(tab.key)}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-sm border px-3 text-sm font-semibold transition-colors',
                isSelected
                  ? 'border-ink bg-ink text-white'
                  : 'border-rule-2 bg-white text-ink-2 hover:border-ink'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'font-mono text-[11px] font-bold tracking-[0.08em]',
                  isSelected ? 'text-white/80' : 'text-ink-3'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <div className="relative">
          <SearchIcon
            aria-hidden
            className="text-ink-3 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <Input
            type="search"
            placeholder="Search categories"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            className="bg-paper-2 border-transparent pl-9 md:w-72"
          />
        </div>
        <Select value={sortValue} onValueChange={onSortValueChange}>
          <SelectTrigger className="bg-white md:w-44">
            <ArrowDownUpIcon className="size-4 shrink-0" aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name:asc">Sort: A → Z</SelectItem>
            <SelectItem value="name:desc">Sort: Z → A</SelectItem>
            <SelectItem value="createdAt:desc">Newest first</SelectItem>
            <SelectItem value="createdAt:asc">Oldest first</SelectItem>
            <SelectItem value="updatedAt:desc">Recently updated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
