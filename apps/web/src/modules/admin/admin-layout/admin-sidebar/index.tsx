'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { ADMIN_NAV_ITEMS } from './admin-sidebar.constants';

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href={ABSOLUTE_ROUTES.ADMIN}
          className="text-sidebar-foreground flex items-center gap-2 px-2 font-semibold"
        >
          <span className="text-heading-sm">Shalmi Admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMIN_NAV_ITEMS.map(({ label, href, Icon }) => {
                const isActive =
                  href === pathname ||
                  (href !== ABSOLUTE_ROUTES.ADMIN_DASHBOARD &&
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
