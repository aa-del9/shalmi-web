'use client';

import { AdminBreadcrumb } from '@/modules/admin/admin-layout/admin-breadcrumb';
import { DashboardHeader } from './components/dashboard-header';
import { DashboardKpiGrid } from './components/dashboard-kpi-grid';
import { DashboardSalesByVendor } from './components/dashboard-sales-by-vendor';
import { DashboardOrderStatus } from './components/dashboard-order-status';
import { DashboardRecentOrders } from './components/dashboard-recent-orders';
import { DashboardTopSellers } from './components/dashboard-top-sellers';
import { DashboardAuditLog } from './components/dashboard-audit-log';
import { useAdminKpisQuery } from './hooks/use-admin-kpis-query';
import { useAdminRecentOrdersQuery } from './hooks/use-admin-recent-orders-query';

export const AdminDashboard = () => {
  const kpis = useAdminKpisQuery();
  const recentOrders = useAdminRecentOrdersQuery(7);

  return (
    <div className="space-y-5">
      <AdminBreadcrumb trail={['Overview', 'Dashboard']} />
      <DashboardHeader />
      <DashboardKpiGrid data={kpis.data} isLoading={kpis.isLoading} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
        <DashboardSalesByVendor />
        <DashboardOrderStatus
          data={kpis.data?.orderStatus}
          isLoading={kpis.isLoading}
          totalOrders={kpis.data?.totalOrders}
        />
      </div>
      <DashboardRecentOrders
        orders={recentOrders.data}
        isLoading={recentOrders.isLoading}
        totalOrders={kpis.data?.totalOrders}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardTopSellers />
        <DashboardAuditLog />
      </div>
    </div>
  );
};
