'use client';

import { QueryClientProvider } from '@tanstack/react-query';

import { getQueryClient } from '@/modules/core/query-client';
import { WithChildren } from '@repo/types/common';
import { clientEnv } from '@/modules/core/env/client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const ReactQueryClientProvider = ({ children }: WithChildren) => {
  // NOTE: Using getQueryClient() instead of useState ensures:
  // - SSR: New client per request (no cross-request data leaks)
  // - Client: Singleton instance (preserves cache across navigations)
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {!clientEnv.NEXT_PUBLIC_IS_PROD && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};
