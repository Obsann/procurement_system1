import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import {
  Button,
  Card,
  DataTable,
  PageHeader,
  StatusBadge,
  Tabs,
  type Column,
} from '../../components/ui';
import { useGetOrdersQuery } from '../../store/api/ordersApi';
import { useGetFinancialReviewsQuery, type FinancialReviewRecord } from '../../store/api/financialReviewsApi';
import { formatDate, formatMoney } from '../../lib/format';
import { type PurchaseOrder } from '../../types';

export const FinancialReviewListPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');

  const {
    data: pendingData,
    isLoading: pendingLoading,
  } = useGetOrdersQuery({ status: 'FINANCIAL_REVIEW' });

  const {
    data: historyData,
    isLoading: historyLoading,
  } = useGetFinancialReviewsQuery({});

  const pendingOrders = useMemo(() => pendingData?.results ?? [], [pendingData]);
  const reviewHistory = useMemo(() => historyData?.results ?? [], [historyData]);

  const pendingColumns: Column<PurchaseOrder>[] = [
    {
      key: 'po_number',
      label: 'PO Number',
      sortable: true,
      render: (row) => <span className="font-medium text-accent-indigo">{row.po_number}</span>,
    },
    { key: 'supplier_name', label: 'Supplier', sortable: true },
    {
      key: 'total_amount',
      label: 'Total Amount',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-medium">
          {formatMoney(row.total_amount, row.currency)}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (row) => formatDate(row.created_at),
    },
    {
      key: 'actions',
      label: 'Action',
      width: '120px',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          icon={<CheckSquare className="h-4 w-4" />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/financial-review/${row.id}`);
          }}
        >
          Review
        </Button>
      ),
    },
  ];

  const historyColumns: Column<FinancialReviewRecord>[] = [
    {
      key: 'po_number',
      label: 'PO Number',
      sortable: true,
      render: (row) => <span className="font-medium text-text-primary">{row.po_number || '—'}</span>,
    },
    {
      key: 'decision',
      label: 'Decision',
      render: (row) => <StatusBadge status={row.decision} />,
    },
    {
      key: 'reviewer_name',
      label: 'Reviewer',
      render: (row) => row.reviewer_name || '—',
    },
    {
      key: 'comments',
      label: 'Comments',
      render: (row) => row.comments || '—',
    },
    {
      key: 'reviewed_at',
      label: 'Date',
      sortable: true,
      render: (row) => formatDate(row.reviewed_at),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Review"
        description="Review and approve purchase orders for financial compliance"
      />

      <div className="flex justify-center md:justify-start">
        <Tabs
          tabs={[
            { key: 'pending', label: 'Pending Review' },
            { key: 'history', label: 'Review History' },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <Card className="p-0">
        {activeTab === 'pending' ? (
          <DataTable
            columns={pendingColumns}
            data={pendingOrders}
            loading={pendingLoading}
            onRowClick={(row) => navigate(`/financial-review/${row.id}`)}
            emptyMessage="No purchase orders currently pending financial review."
          />
        ) : (
          <DataTable
            columns={historyColumns}
            data={reviewHistory}
            loading={historyLoading}
            emptyMessage="No financial review history available."
          />
        )}
      </Card>
    </div>
  );
};
