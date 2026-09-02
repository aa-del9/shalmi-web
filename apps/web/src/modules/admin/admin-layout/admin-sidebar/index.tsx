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
import { ADMIN_NAV_SECTIONS } from './admin-sidebar.constants';

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader className="border-rule border-b">
        <Link
          href={ABSOLUTE_ROUTES.ADMIN}
          className="text-ink flex items-center gap-2 px-2 py-1 font-bold"
        >
          <span className="text-base tracking-tight">Shalmi Mart</span>
          <span className="text-ink-3 font-mono text-[11px] tracking-[0.08em] uppercase">
            Admin
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {ADMIN_NAV_SECTIONS.map((group) => (
          <SidebarGroup key={group.section ?? 'root'}>
            {group.section ? (
              <SidebarGroupLabel className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
                {group.section}
              </SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ label, href, Icon, badge }) => {
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
                          <span className="flex-1">{label}</span>
                          {typeof badge === 'number' && badge > 0 ? (
                            <span className="bg-ink text-white inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold">
                              {badge}
                            </span>
                          ) : null}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};
