'use client';

import { DashboardHeader } from './components/dashboard-header';
import { DashboardKpiGrid } from './components/dashboard-kpi-grid';
import { DashboardSalesChart } from './components/dashboard-sales-chart';
import { DashboardRecentOrders } from './components/dashboard-recent-orders';
import { DashboardLowStock } from './components/dashboard-low-stock';
import { DashboardTopSellers } from './components/dashboard-top-sellers';
import { DashboardPayoutsCallout } from './components/dashboard-payouts-callout';
import { useVendorShopQuery } from './hooks/use-vendor-shop-query';
import { useVendorKpisQuery } from './hooks/use-vendor-kpis-query';
import { useVendorRecentOrdersQuery } from './hooks/use-vendor-recent-orders-query';
import { useVendorLowStockQuery } from './hooks/use-vendor-low-stock-query';
import { useVendorNextPayoutQuery } from './hooks/use-vendor-next-payout-query';

export function VendorDashboard() {
  const shop = useVendorShopQuery();
  const kpis = useVendorKpisQuery();
  const recentOrders = useVendorRecentOrdersQuery();
  const lowStock = useVendorLowStockQuery();
  const nextPayout = useVendorNextPayoutQuery();

  return (
    <div className="space-y-6 md:space-y-7">
      <DashboardHeader shop={shop.data} isLoading={shop.isLoading} />
      <DashboardKpiGrid
        kpis={kpis.data}
        isLoading={kpis.isLoading}
        nextPayout={nextPayout.data ?? null}
        isPayoutLoading={nextPayout.isLoading}
      />
      <DashboardSalesChart />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:gap-6">
        <DashboardRecentOrders
          rows={recentOrders.data}
          isLoading={recentOrders.isLoading}
        />
        <div className="flex flex-col gap-5 lg:gap-6">
          <DashboardLowStock data={lowStock.data} isLoading={lowStock.isLoading} />
          <DashboardTopSellers />
        </div>
      </div>
      <DashboardPayoutsCallout
        nextPayout={nextPayout.data ?? null}
        isPayoutLoading={nextPayout.isLoading}
        shop={shop.data}
      />
    </div>
  );
}
