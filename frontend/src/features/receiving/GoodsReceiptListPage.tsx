import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import {
  Button,
  Card,
  DataTable,
  Input,
  PageHeader,
  Select,
  StatusBadge,
  type Column,
} from '../../components/ui';
import { useGetGoodsReceiptsQuery, type GoodsReceiptRecord } from '../../store/api/goodsReceiptsApi';
import { formatDate } from '../../lib/format';

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'COMPLETE', label: 'Complete' },
];

export const GoodsReceiptListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetGoodsReceiptsQuery({});

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const receipts = useMemo(() => data?.results ?? [], [data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return receipts.filter((gr) => {
      if (status !== 'all' && gr.status !== status) return false;
      if (!term) return true;
      return (
        gr.grn_number.toLowerCase().includes(term) ||
        gr.po_number.toLowerCase().includes(term)
      );
    });
  }, [receipts, search, status]);

  const columns: Column<GoodsReceiptRecord>[] = [
    {
      key: 'grn_number',
      label: 'GRN Number',
      sortable: true,
      render: (row) => <span className="font-medium text-accent-indigo">{row.grn_number}</span>,
    },
    { key: 'po_number', label: 'PO Number', sortable: true },
    {
      key: 'received_by_name',
      label: 'Received By',
      render: (row) => row.received_by_name || '—',
    },
    {
      key: 'received_date',
      label: 'Date',
      sortable: true,
      render: (row) => formatDate(row.received_date),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Goods Receipts" />
        <Card className="p-8 text-center">
          <p className="mb-4 text-text-secondary">We could not load goods receipts.</p>
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
        title="Goods Receipts"
        description="Track and manage received items against purchase orders"
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/goods-receipts/new')}
          >
            Record Receipt
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-56 flex-1">
            <Input
              label="Search"
              placeholder="Search by GRN or PO number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyMessage={
          receipts.length === 0
            ? 'No goods receipts recorded yet.'
            : 'No receipts match these filters.'
        }
        emptyAction={
          receipts.length === 0 ? (
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/goods-receipts/new')}
            >
              Record your first receipt
            </Button>
          ) : undefined
        }
      />
    </div>
  );
};
