import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { KPICard } from '../../components/ui/KPICard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FileText, Clock, Package, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { displayName } from '../../lib/user';
import { useGetDashboardStatsQuery } from '../../store/api/dashboardApi';
import { formatDate, formatMoney } from '../../lib/format';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading, isError, refetch } = useGetDashboardStatsQuery();

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Welcome back, {displayName(user)} 👋
          </h2>
        </div>
        <Card className="border-border-default">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-text-secondary mb-4">Failed to load dashboard data</div>
            <Button variant="primary" onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          Welcome back, {displayName(user)} 👋
        </h2>
      </div>

      {isLoading || !stats ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-border-default animate-pulse h-28">
                <CardContent className="h-full" />
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border-default animate-pulse h-80">
              <CardContent className="h-full" />
            </Card>
            <Card className="border-border-default animate-pulse h-80">
              <CardContent className="h-full" />
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Requisitions"
              value={stats.total_requisitions.toString()}
              icon={FileText}
              iconClassName="text-accent-indigo"
            />
            <KPICard
              title="Pending Approvals"
              value={stats.pending_approvals.toString()}
              icon={Clock}
              iconClassName="text-amber-500"
            />
            <KPICard
              title="Active POs"
              value={stats.total_purchase_orders.toString()}
              icon={Package}
              iconClassName="text-blue-500"
            />
            <KPICard
              title="Goods Received"
              value={stats.total_goods_receipts.toString()}
              icon={CheckCircle}
              iconClassName="text-emerald-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border-default">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-medium text-text-primary">Recent Requisitions</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/requisitions')} icon={ArrowRight} iconPosition="right">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <DataTable
                  data={stats.recent_requisitions}
                  loading={false}
                  onRowClick={(row) => navigate(`/requisitions/${row.id}`)}
                  emptyMessage="No recent requisitions"
                  columns={[
                    { key: 'pr_number', label: 'PR Number' },
                    { key: 'title', label: 'Title' },
                    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                    { key: 'created_at', label: 'Date', render: (val) => formatDate(val) },
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="border-border-default">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-medium text-text-primary">Recent Purchase Orders</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/purchase-orders')} icon={ArrowRight} iconPosition="right">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <DataTable
                  data={stats.recent_purchase_orders}
                  loading={false}
                  onRowClick={(row) => navigate(`/purchase-orders/${row.id}`)}
                  emptyMessage="No recent purchase orders"
                  columns={[
                    { key: 'po_number', label: 'PO Number' },
                    { key: 'total_amount', label: 'Amount', render: (val) => formatMoney(val) },
                    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
                    { key: 'created_at', label: 'Date', render: (val) => formatDate(val) },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
