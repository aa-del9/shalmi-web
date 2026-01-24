import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { ReactQueryClientProvider } from './react-query-client-provider';
import { WithChildren } from '@repo/types/common';

export function Providers({ children }: WithChildren) {
  return (
    <ReactQueryClientProvider>
      <NuqsAdapter>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </NuqsAdapter>
    </ReactQueryClientProvider>
  );
}
