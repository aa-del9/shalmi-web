import type { Metadata } from 'next';
import '@repo/ui/globals.css';
import { RootLayout } from '@/modules/root-layout';
import { WithChildren } from '@repo/types/common';

export const metadata: Metadata = {
  title: 'Shaalmi - B2B Ecommerce Platform',
  description:
    'Shaalmi is a modern B2B ecommerce platform for wholesale and business transactions.',
};

export default function Layout({ children }: WithChildren) {
  return <RootLayout>{children}</RootLayout>;
}
