import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  Button,
  DataTable,
  PageHeader,
  StatusBadge,
  Tabs,
  type Column,
} from '../../components/ui';
import { useGetRequisitionsQuery } from '../../store/api/requisitionsApi';
import { useGetOrdersQuery } from '../../store/api/ordersApi';
import { formatMoney } from '../../lib/format';
import { daysWaiting, waitingTone } from './useDaysWaiting';
import { type PurchaseOrder, type PurchaseRequisition } from '../../types';

const Waiting: React.FC<{ since: string | null }> = ({ since }) => {
  const days = daysWaiting(since);
  return (
    <span className={waitingTone(days)}>
      {days === 0 ? 'today' : `${days}d`}
    </span>
  );
};

export const ApprovalQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'pr' | 'po'>('pr');

  // BR-04 puts requisitions in front of the budget holder at SUBMITTED, and
  // purchase orders at FINAL_APPROVAL.
  const { data: prData, isLoading: loadingPRs } = useGetRequisitionsQuery({ status: 'SUBMITTED' });
  const { data: poData, isLoading: loadingPOs } = useGetOrdersQuery({ status: 'FINAL_APPROVAL' });

  const pendingPRs = prData?.results ?? [];
  const pendingPOs = poData?.results ?? [];

  const prColumns: Column<PurchaseRequisition>[] = [
    {
      key: 'pr_number',
      label: 'PR Number',
      sortable: true,
      render: (row) => <span className="font-medium text-accent-indigo">{row.pr_number}</span>,
    },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'requester_name', label: 'Requester', sortable: true },
    {
      key: 'department_name',
      label: 'Department',
      sortable: true,
      render: (row) => row.department_name ?? '—',
    },
    {
      key: 'total_estimated_amount',
      label: 'Amount',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-medium">
          {formatMoney(row.total_estimated_amount, row.currency)}
        </span>
      ),
    },
    {
      key: 'submitted_at',
      label: 'Waiting',
      sortable: true,
      render: (row) => <Waiting since={row.submitted_at ?? row.created_at} />,
    },
    {
      key: 'actions',
      label: '',
      width: '120px',
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            icon={<ArrowRight className="h-4 w-4" />}
            onClick={() => navigate(`/approvals/pr/${row.id}`)}
          >
            Review
          </Button>
        </div>
      ),
    },
  ];

  const poColumns: Column<PurchaseOrder>[] = [
    {
      key: 'po_number',
      label: 'PO Number',
      sortable: true,
      render: (row) => <span className="font-medium text-accent-indigo">{row.po_number}</span>,
    },
    { key: 'pr_number', label: 'Linked PR', sortable: true },
    { key: 'supplier_name', label: 'Supplier', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'total_amount',
      label: 'Amount',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-medium">{formatMoney(row.total_amount, row.currency)}</span>
      ),
    },
    {
      key: 'submitted_at',
      label: 'Waiting',
      sortable: true,
      render: (row) => <Waiting since={row.submitted_at ?? row.created_at} />,
    },
    {
      key: 'actions',
      label: '',
      width: '120px',
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            icon={<ArrowRight className="h-4 w-4" />}
            onClick={() => navigate(`/approvals/po/${row.id}`)}
          >
            Review
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Approvals"
        description="Requisitions and purchase orders awaiting your decision"
      />

      <Tabs
        tabs={[
          { key: 'pr', label: `Requisitions (${pendingPRs.length})` },
          { key: 'po', label: `Purchase Orders (${pendingPOs.length})` },
        ]}
        active={tab}
        onChange={(key) => setTab(key as 'pr' | 'po')}
      />

      {tab === 'pr' ? (
        <DataTable
          columns={prColumns}
          data={pendingPRs}
          loading={loadingPRs}
          onRowClick={(row) => navigate(`/approvals/pr/${row.id}`)}
          emptyMessage="Nothing is waiting on your approval."
        />
      ) : (
        <DataTable
          columns={poColumns}
          data={pendingPOs}
          loading={loadingPOs}
          onRowClick={(row) => navigate(`/approvals/po/${row.id}`)}
          emptyMessage="No purchase orders are awaiting final approval."
        />
      )}
    </div>
  );
};
