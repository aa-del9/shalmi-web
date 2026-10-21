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
import { useVendorOrdersQuery } from '@/modules/vendor/vendor-orders/hooks/use-vendor-orders-query';
import { VENDOR_NAV_SECTIONS } from './vendor-sidebar.constants';

export const VendorSidebar = () => {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  // Per scope-cut: "Vendor sidebar Orders count badge IN_SCOPE — single
  // COUNT, derivable from existing useVendorOrdersQuery."
  const ordersQuery = useVendorOrdersQuery();
  const pendingOrders = ordersQuery.data?.meta?.pendingCount ?? 0;

  const badgeFor = (key?: 'pendingOrders'): number | undefined => {
    if (key === 'pendingOrders') return pendingOrders;
    return undefined;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-rule border-b">
        <Link
          href={ABSOLUTE_ROUTES.VENDOR_DASHBOARD}
          className="text-ink flex items-center gap-2 px-2 py-1 font-bold"
          prefetch={false}
        >
          <span className="text-base tracking-tight">Shalmi Mart</span>
          <span className="text-ink-3 font-mono text-[11px] tracking-[0.08em] uppercase">
            Vendor
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {VENDOR_NAV_SECTIONS.map((group) => (
          <SidebarGroup key={group.section ?? 'root'}>
            {group.section ? (
              <SidebarGroupLabel className="text-ink-3 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
                {group.section}
              </SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ label, href, Icon, badgeKey }) => {
                  const isActive =
                    href === pathname ||
                    (href !== ABSOLUTE_ROUTES.VENDOR_DASHBOARD &&
                      pathname.startsWith(href));
                  const badge = badgeFor(badgeKey);
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        {/* prefetch={false} for routes that may 404
                            until their pages ship in this batch
                            (Settings is a placeholder; Ledger is owned
                            by Batch 6). */}
                        <Link
                          href={href}
                          prefetch={false}
                          onClick={() => isMobile && setOpenMobile(false)}
                        >
                          {Icon && <Icon className="size-5 shrink-0" />}
                          <span className="flex-1">{label}</span>
                          {typeof badge === 'number' && badge > 0 ? (
                            <span className="bg-amber text-white inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold">
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
