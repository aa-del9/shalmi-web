import { StorefrontHeader } from '@/modules/storefront/components/header';
import { StorefrontFooter } from '@/modules/storefront/components/footer';
import { UtilStrip } from '@/modules/storefront/components/util-strip';
import { Subnav } from '@/modules/storefront/components/subnav';

export const dynamic = 'force-dynamic';

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <>
      {/* UtilStrip + Subnav land at the top of every storefront desktop
          page per buyer-home gap-analysis. They self-hide on mobile so
          the existing per-screen mobile chrome (e.g. buyer-orders' app
          bar) remains the topmost element. */}
      <UtilStrip />
      <Subnav />
      <StorefrontHeader />
      <main className="min-h-screen bg-paper">{children}</main>
      <StorefrontFooter />
    </>
  );
}
