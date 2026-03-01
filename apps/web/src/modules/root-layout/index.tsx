import NextTopLoader from 'nextjs-toploader';

import { Providers } from './providers';
import { GlobalModals } from './global-modals';

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background min-h-screen font-sans antialiased">
        <NextTopLoader
          color="rgb(16, 185, 129)"
          height={3}
          shadow="0 0 10px rgb(16, 185, 129), 0 0 5px rgb(5, 150, 105)"
          showSpinner={false}
        />
        <Providers>
          {children}
          <GlobalModals />
        </Providers>
      </body>
    </html>
  );
}
