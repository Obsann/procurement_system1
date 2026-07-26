import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Eye, Plus, Search, Send, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  DataTable,
  Input,
  PageHeader,
  Select,
  StatusBadge,
  Modal,
  useToast,
  type Column,
} from '../../components/ui';
import {
  useDeleteRequisitionMutation,
  useGetRequisitionsQuery,
  useSubmitRequisitionMutation,
} from '../../store/api/requisitionsApi';
import { formatDate, formatMoney } from '../../lib/format';
import { apiErrorMessage } from '../../lib/apiError';
import { type PRStatus, type PurchaseRequisition } from '../../types';

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PROCUREMENT_PROCESSING', label: 'Procurement processing' },
];

export const RequisitionListPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data, isLoading, isError, refetch } = useGetRequisitionsQuery({});
  const [submitRequisition, { isLoading: isSubmitting }] = useSubmitRequisitionMutation();
  const [deleteRequisition, { isLoading: isDeleting }] = useDeleteRequisitionMutation();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [pendingDelete, setPendingDelete] = useState<PurchaseRequisition | null>(null);

  const requisitions = useMemo(() => data?.results ?? [], [data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requisitions.filter((pr) => {
      if (status !== 'all' && pr.status !== status) return false;
      if (!term) return true;
      return (
        pr.title.toLowerCase().includes(term) || pr.pr_number.toLowerCase().includes(term)
      );
    });
  }, [requisitions, search, status]);

  const handleSubmit = async (pr: PurchaseRequisition) => {
    try {
      await submitRequisition(pr.id).unwrap();
      addToast('success', `${pr.pr_number} submitted for approval.`);
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not submit this requisition.'));
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteRequisition(pendingDelete.id).unwrap();
      addToast('success', `${pendingDelete.pr_number} deleted.`);
      setPendingDelete(null);
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not delete this requisition.'));
    }
  };

  const columns: Column<PurchaseRequisition>[] = [
    {
      key: 'pr_number',
      label: 'PR Number',
      sortable: true,
      render: (row) => <span className="font-medium text-accent-indigo">{row.pr_number}</span>,
    },
    { key: 'title', label: 'Title', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
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
            onClick={() => navigate(`/requisitions/${row.id}`)}
          >
            View
          </Button>
          {row.status === 'DRAFT' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={<Edit3 className="h-3.5 w-3.5" />}
                onClick={() => navigate(`/requisitions/${row.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Send className="h-3.5 w-3.5" />}
                disabled={isSubmitting}
                onClick={() => handleSubmit(row)}
              >
                Submit
              </Button>
              <Button
                variant="danger"
                size="sm"
                aria-label={`Delete ${row.pr_number}`}
                icon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={() => setPendingDelete(row)}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Requisitions" />
        <Card className="p-8 text-center">
          <p className="mb-4 text-text-secondary">We could not load your requisitions.</p>
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
        title="Requisitions"
        description="Create, track and submit purchase requisitions"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/requisitions/new')}>
            New Requisition
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-56 flex-1">
            <Input
              label="Search"
              placeholder="Search by title or PR number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as PRStatus | 'all')}
          />
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        onRowClick={(row) => navigate(`/requisitions/${row.id}`)}
        emptyMessage={
          requisitions.length === 0
            ? 'No requisitions yet.'
            : 'No requisitions match these filters.'
        }
        emptyAction={
          requisitions.length === 0 ? (
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/requisitions/new')}
            >
              Create your first requisition
            </Button>
          ) : undefined
        }
      />

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete requisition"
        actions={
          <>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          {pendingDelete?.pr_number} will be permanently removed. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
