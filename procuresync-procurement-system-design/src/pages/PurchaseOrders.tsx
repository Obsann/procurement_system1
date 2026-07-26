import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, Button, Input, Select, Card } from '../components/ui';
import { purchaseOrders } from '../mockData';

export function PurchaseOrders() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = purchaseOrders.filter(po => {
    if (statusFilter !== 'all' && po.status !== statusFilter) return false;
    if (searchQuery && !po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) && !po.supplierName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const columns = [
    { key: 'poNumber', label: 'PO Number', sortable: true, render: (row: any) => <span className="text-accent-indigo font-medium">{row.poNumber}</span> },
    { key: 'linkedPRNumber', label: 'Linked PR', render: (row: any) => <span className="text-text-secondary">{row.linkedPRNumber}</span> },
    { key: 'supplierName', label: 'Supplier', sortable: true },
    { key: 'totalAmount', label: 'Total Amount', sortable: true, render: (row: any) => <span className="font-medium">${row.totalAmount.toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', label: 'Created', sortable: true, render: (row: any) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Purchase Orders" description="Manage purchase orders throughout the workflow" actions={<Button variant="primary" icon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/bids')}>Generate from Bid</Button>} />
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]"><Input placeholder="Search POs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search className="w-4 h-4" />} /></div>
          <Select options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'PO_CREATED', label: 'Created' },
            { value: 'FINANCIAL_REVIEW', label: 'Financial Review' },
            { value: 'FINANCIAL_APPROVED', label: 'Financially Approved' },
            { value: 'FINAL_APPROVAL', label: 'Final Approval' },
            { value: 'PO_APPROVED', label: 'Approved' },
            { value: 'GOODS_RECEIVED', label: 'Goods Received' },
          ]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        </div>
      </Card>
      <DataTable columns={columns} data={filtered} emptyMessage="No purchase orders found" emptyAction={<Button variant="primary" onClick={() => navigate('/bids')}>Generate from Bid</Button>} />
    </div>
  );
}
