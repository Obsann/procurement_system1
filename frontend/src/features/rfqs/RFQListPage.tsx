import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart } from 'lucide-react';
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  PageHeader,
  Select,
  StatusBadge,
  type Column,
} from '../../components/ui';
import { useGetRFQsQuery } from '../../store/api/rfqApi';
import { formatDate } from '../../lib/format';
import { type RFQ } from '../../types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'RESPONDED', label: 'Responded' },
  { value: 'CLOSED', label: 'Closed' },
];

export const RFQListPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch } = useGetRFQsQuery();

  const rfqs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.results ?? []).filter((rfq) => {
      if (statusFilter && rfq.status !== statusFilter) return false;
      if (!term) return true;
      return (
        rfq.rfq_number.toLowerCase().includes(term) || rfq.title.toLowerCase().includes(term)
      );
    });
  }, [data, statusFilter, search]);

  const columns: Column<RFQ>[] = [
    {
      key: 'rfq_number',
      label: 'RFQ Number',
      sortable: true,
      render: (row) => <span className="font-medium text-accent-indigo">{row.rfq_number}</span>,
    },
    { key: 'title', label: 'Title', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'invited_suppliers',
      label: 'Invited',
      render: (row) => `${row.invited_suppliers?.length ?? 0}`,
    },
    {
      key: 'submission_deadline',
      label: 'Deadline',
      sortable: true,
      render: (row) => formatDate(row.submission_deadline),
    },
  ];

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <p className="mb-4 text-text-secondary">Could not load requests for quotation.</p>
        <Button variant="secondary" onClick={() => refetch()}>
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Requests for Quotation"
        description="Invite suppliers to quote against an approved requisition"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/rfqs/new')}>
            New RFQ
          </Button>
        }
      />

      <div className="flex flex-wrap gap-4">
        <Input
          label="Search"
          placeholder="RFQ number or title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      {!isLoading && rfqs.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="h-8 w-8" />}
          title="No requests for quotation"
          description="Create an RFQ from an approved requisition to start collecting supplier prices."
          action={<Button onClick={() => navigate('/rfqs/new')}>New RFQ</Button>}
        />
      ) : (
        <DataTable
          columns={columns}
          data={rfqs}
          loading={isLoading}
          onRowClick={(row) => navigate(`/rfqs/${row.id}`)}
          emptyMessage="No RFQs match your filters."
        />
      )}
    </div>
  );
};
