import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckSquare, ShoppingCart, Package, Plus, Clock, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { KPICard, Card, PageHeader, Button } from '../components/ui';
import { requisitions, activityFeed, roleLabels } from '../mockData';
import type { UserRole } from '../types';

const prStatusData = [
  { name: 'Draft', value: 1, color: '#475569' },
  { name: 'Submitted', value: 3, color: '#3B82F6' },
  { name: 'Approved', value: 2, color: '#22C55E' },
  { name: 'Returned', value: 1, color: '#F59E0B' },
  { name: 'Rejected', value: 1, color: '#EF4444' },
];

const quickActions: Record<UserRole, { label: string; icon: React.ReactNode; path: string }[]> = {
  requester: [{ label: 'New Requisition', icon: <Plus className="w-4 h-4" />, path: '/requisitions/new' }],
  budget_holder: [{ label: 'Review Approvals', icon: <CheckSquare className="w-4 h-4" />, path: '/approvals' }],
  procurement: [
    { label: 'New Requisition', icon: <Plus className="w-4 h-4" />, path: '/requisitions/new' },
    { label: 'Create RFQ', icon: <ShoppingCart className="w-4 h-4" />, path: '/rfqs/new' },
    { label: 'Review Bids', icon: <ArrowRight className="w-4 h-4" />, path: '/bids' },
  ],
  financial: [{ label: 'Review POs', icon: <Package className="w-4 h-4" />, path: '/financial-review' }],
  warehouse: [{ label: 'Record Receipt', icon: <Package className="w-4 h-4" />, path: '/goods-receipts/new' }],
  admin: [
    { label: 'New Requisition', icon: <Plus className="w-4 h-4" />, path: '/requisitions/new' },
    { label: 'Create RFQ', icon: <ShoppingCart className="w-4 h-4" />, path: '/rfqs/new' },
  ],
};

const activityIcons: Record<string, string> = {
  approval: '✅', rfq: '📋', bid: '💰', po: '📦', receipt: '📥', pr: '📝',
};

export function Dashboard({ userRole }: { userRole: UserRole }) {
  const navigate = useNavigate();

  const kpis = [
    { icon: <FileText className="w-5 h-5" />, value: 3, label: 'Open PRs', trend: 'up' as const, trendValue: '+2 this week' },
    { icon: <CheckSquare className="w-5 h-5" />, value: 5, label: 'Pending Approvals', trend: 'down' as const, trendValue: '-3 vs last week' },
    { icon: <ShoppingCart className="w-5 h-5" />, value: 3, label: 'Active RFQs', trend: 'up' as const, trendValue: '+1 this week' },
    { icon: <Package className="w-5 h-5" />, value: 8, label: 'POs this month', trend: 'neutral' as const, trendValue: 'Same as last' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Dashboard"
        description={`Welcome back! You're logged in as ${roleLabels[userRole]}`}
        actions={quickActions[userRole].map((action, i) => (
          <Button key={i} variant="primary" icon={action.icon} onClick={() => navigate(action.path)}>
            {action.label}
          </Button>
        ))}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Recent Activity</h2>
            <Clock className="w-4 h-4 text-text-muted" />
          </div>
          <div className="space-y-3">
            {activityFeed.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-bg-surface-hover hover:bg-bg-deep transition-colors cursor-pointer">
                <span className="text-lg shrink-0">{activityIcons[item.type] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{item.message}</p>
                  <p className="text-xs text-text-muted mt-0.5">{new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* PR Status Breakdown */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">PR Status Breakdown</h2>
          <div className="h-200">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={prStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {prStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1A1D27', border: '1px solid #2A2D3A', borderRadius: '8px', color: '#F1F5F9', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {prStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-text-secondary">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pending items preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Pending Requisitions</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/requisitions')}>View All →</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-surface-hover">
                <th className="px-4 py-2 text-left text-xs font-semibold text-text-muted uppercase">PR Number</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-text-muted uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-text-muted uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-text-muted uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.filter(r => r.status === 'SUBMITTED').slice(0, 5).map(pr => (
                <tr key={pr.id} className="border-t border-border-default hover:bg-bg-surface-hover cursor-pointer transition-colors" onClick={() => navigate('/requisitions')}>
                  <td className="px-4 py-3 text-accent-indigo font-medium">{pr.prNumber}</td>
                  <td className="px-4 py-3 text-text-primary">{pr.title}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-info/20 text-info uppercase">{pr.status}</span>
                  </td>
                  <td className="px-4 py-3 text-text-primary font-medium">${pr.totalAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
