import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, Send } from 'lucide-react';
import {
  Button,
  Card,
  DataTable,
  Input,
  PageHeader,
  Select,
  StatusBadge,
  useToast,
  type Column,
} from '../../components/ui';
import {
  useGetOrdersQuery,
  useSubmitForReviewMutation,
  useSubmitForFinalApprovalMutation,
} from '../../store/api/ordersApi';
import { formatDate, formatMoney } from '../../lib/format';
import { apiErrorMessage } from '../../lib/apiError';
import { type POStatus, type PurchaseOrder } from '../../types';

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'PO_CREATED', label: 'Created' },
  { value: 'FINANCIAL_REVIEW', label: 'Financial Review' },
  { value: 'FINANCIAL_APPROVED', label: 'Financial Approved' },
  { value: 'FINAL_APPROVAL', label: 'Final Approval' },
  { value: 'PO_APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
  { value: 'GOODS_RECEIVED', label: 'Goods Received' },
];

export const PurchaseOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data, isLoading, isError, refetch } = useGetOrdersQuery({});
  
  const [submitForReview, { isLoading: isSubmittingReview }] = useSubmitForReviewMutation();
  const [submitForFinalApproval, { isLoading: isSubmittingFinal }] = useSubmitForFinalApprovalMutation();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const orders = useMemo(() => data?.results ?? [], [data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (status !== 'all' && order.status !== status) return false;
      if (!term) return true;
      return (
        order.po_number.toLowerCase().includes(term) ||
        order.supplier_name.toLowerCase().includes(term)
      );
    });
  }, [orders, search, status]);

  const handleSubmitReview = async (order: PurchaseOrder) => {
    try {
      await submitForReview(order.id).unwrap();
      addToast('success', `${order.po_number} submitted for financial review.`);
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not submit this PO for review.'));
    }
  };

  const handleSubmitFinal = async (order: PurchaseOrder) => {
    try {
      await submitForFinalApproval(order.id).unwrap();
      addToast('success', `${order.po_number} submitted for final approval.`);
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not submit this PO for final approval.'));
    }
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'po_number',
      label: 'PO Number',
      sortable: true,
      render: (row) => <span className="font-medium text-accent-indigo">{row.po_number}</span>,
    },
    { key: 'supplier_name', label: 'Supplier', sortable: true },
    { key: 'pr_number', label: 'PR Number' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'total_amount',
      label: 'Total Amount',
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
      label: 'Actions',
      width: '220px',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => navigate(`/orders/${row.id}`)}
          >
            View
          </Button>
          {row.status === 'PO_CREATED' && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Send className="h-3.5 w-3.5" />}
              disabled={isSubmittingReview || isSubmittingFinal}
              onClick={() => handleSubmitReview(row)}
            >
              Submit for Review
            </Button>
          )}
          {row.status === 'FINANCIAL_APPROVED' && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Send className="h-3.5 w-3.5" />}
              disabled={isSubmittingReview || isSubmittingFinal}
              onClick={() => handleSubmitFinal(row)}
            >
              Submit Final
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Purchase Orders" />
        <Card className="p-8 text-center">
          <p className="mb-4 text-text-secondary">We could not load your purchase orders.</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Track and manage purchase orders"
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-56 flex-1">
            <Input
              label="Search"
              placeholder="Search by PO number or supplier name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as POStatus | 'all')}
          />
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        onRowClick={(row) => navigate(`/orders/${row.id}`)}
        emptyMessage={
          orders.length === 0
            ? 'No purchase orders yet.'
            : 'No purchase orders match these filters.'
        }
      />
    </div>
  );
};
