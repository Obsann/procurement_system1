import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Eye, Plus, Search } from 'lucide-react';
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
import { useGetSuppliersQuery } from '../../store/api/suppliersApi';
import { type Supplier } from '../../store/api/suppliersApi';

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'BLOCKED', label: 'Blocked' },
];

export const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetSuppliersQuery({});
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const suppliers = useMemo(() => data?.results ?? [], [data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return suppliers.filter((supplier) => {
      if (status !== 'all' && supplier.status !== status) return false;
      if (!term) return true;
      return (
        supplier.legal_name.toLowerCase().includes(term) ||
        supplier.supplier_code.toLowerCase().includes(term)
      );
    });
  }, [suppliers, search, status]);

  const columns: Column<Supplier>[] = [
    {
      key: 'supplier_code',
      label: 'Supplier Code',
      sortable: true,
      render: (row) => <span className="font-medium text-accent-indigo">{row.supplier_code}</span>,
    },
    { key: 'legal_name', label: 'Legal Name', sortable: true },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'City' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '150px',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => navigate(`/suppliers/${row.id}`)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit3 className="h-3.5 w-3.5" />}
            onClick={() => navigate(`/suppliers/${row.id}/edit`)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Suppliers" />
        <Card className="p-8 text-center">
          <p className="mb-4 text-text-secondary">We could not load your suppliers.</p>
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
        title="Suppliers"
        description="Manage your supplier database"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/suppliers/new')}>
            New Supplier
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-56 flex-1">
            <Input
              label="Search"
              placeholder="Search by name or code"
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
        onRowClick={(row) => navigate(`/suppliers/${row.id}`)}
        emptyMessage={
          suppliers.length === 0
            ? 'No suppliers yet.'
            : 'No suppliers match these filters.'
        }
        emptyAction={
          suppliers.length === 0 ? (
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/suppliers/new')}
            >
              Add your first supplier
            </Button>
          ) : undefined
        }
      />
    </div>
  );
};
