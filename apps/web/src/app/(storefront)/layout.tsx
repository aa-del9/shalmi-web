import { StorefrontHeader } from '@/modules/storefront/components/header';
import { StorefrontFooter } from '@/modules/storefront/components/footer';

export const dynamic = 'force-dynamic';

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <>
      <StorefrontHeader />
      <main className="min-h-screen">{children}</main>
      <StorefrontFooter />
    </>
  );
}
