import NextTopLoader from 'nextjs-toploader';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';

import { Providers } from './providers';
import { GlobalModals } from './global-modals';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background min-h-screen font-sans antialiased">
        <NextTopLoader
          color="#16a34a"
          height={3}
          shadow="0 0 10px #16a34a, 0 0 5px #15803d"
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
