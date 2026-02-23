'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpenIcon,
  LayoutDashboardIcon,
  PackageIcon,
  PlusCircleIcon,
  ShoppingCartIcon,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@repo/ui/components/sidebar';
import { ABSOLUTE_ROUTES } from '@/modules/core/constants/absolute-routes';
import { VENDOR_NAV_ITEMS } from './vendor-sidebar.constants';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Dashboard: LayoutDashboardIcon,
  'My Products': PackageIcon,
  'Add Product': PlusCircleIcon,
  Orders: ShoppingCartIcon,
  Ledger: BookOpenIcon,
};

export const VendorSidebar = () => {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href={ABSOLUTE_ROUTES.VENDOR_DASHBOARD}
          className="text-sidebar-foreground flex items-center gap-2 px-2 font-semibold"
        >
          <span className="text-heading-sm">Shalmi Vendor</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {VENDOR_NAV_ITEMS.map(({ label, href }) => {
                const Icon = ICONS[label];
                const isActive =
                  href === pathname ||
                  (href !== ABSOLUTE_ROUTES.VENDOR_DASHBOARD &&
                    pathname.startsWith(href));
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={href}
                        onClick={() => isMobile && setOpenMobile(false)}
                      >
                        {Icon && <Icon className="size-5 shrink-0" />}
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
