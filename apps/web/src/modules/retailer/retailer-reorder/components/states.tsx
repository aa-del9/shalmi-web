'use client';

import { Skeleton } from '@repo/ui/components/skeleton';
import { Button } from '@repo/ui/components/button';

/**
 * Per gap-analysis Q39: skeleton rows in items list.
 */
export function ReorderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[150px] w-full rounded-md" />
      <ul className="overflow-hidden rounded-md border border-rule bg-white">
        {Array.from({ length: 4 }).map((_, idx) => (
          <li
            key={idx}
            className="flex items-center gap-4 border-b border-rule p-4 last:border-b-0"
          >
            <Skeleton className="size-16 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-9 w-28" />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ReorderErrorProps {
  message: string;
  onRetry: () => void;
}

/**
 * Per gap-analysis Q40: full-page retry card.
 */
export function ReorderError({ message, onRetry }: ReorderErrorProps) {
  return (
    <div className="rounded-md border border-rule bg-white p-10 text-center">
      <p className="font-sans text-[14px] font-semibold text-ink">
        {message}
      </p>
      <Button onClick={onRetry} variant="outline" className="mt-4">
        Try again
      </Button>
    </div>
  );
}
