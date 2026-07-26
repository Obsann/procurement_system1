import { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { PageHeader, DataTable, Button, Input, Select, Card } from '../components/ui';
import { auditLog } from '../mockData';

export function AuditLog() {
  const [entityFilter, setEntityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = auditLog.filter(entry => {
    if (entityFilter !== 'all' && entry.entityType !== entityFilter) return false;
    if (searchQuery && !entry.actor.toLowerCase().includes(searchQuery.toLowerCase()) && !entry.action.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const columns = [
    { key: 'timestamp', label: 'Timestamp', sortable: true, render: (row: any) => new Date(row.timestamp).toLocaleString() },
    { key: 'actor', label: 'Actor', sortable: true },
    { key: 'action', label: 'Action', sortable: true, render: (row: any) => <span className="text-accent-indigo font-medium">{row.action}</span> },
    { key: 'entityType', label: 'Entity Type', sortable: true },
    { key: 'entityId', label: 'Entity ID', render: (row: any) => <span className="text-text-secondary">{row.entityId}</span> },
    { key: 'statusChange', label: 'Status Change', render: (row: any) => (
      <span className="text-xs">
        <span className="text-text-muted">{row.oldStatus}</span>
        <span className="text-accent-indigo mx-1">→</span>
        <span className="text-text-primary font-medium">{row.newStatus}</span>
      </span>
    ) },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Audit Log" description="Complete history of all workflow actions" actions={<Button variant="secondary" icon={<Download className="w-4 h-4" />}>Export CSV</Button>} />

      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]"><Input placeholder="Search by actor or action..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search className="w-4 h-4" />} /></div>
          <Select options={[
            { value: 'all', label: 'All Types' },
            { value: 'PR', label: 'Purchase Requisitions' },
            { value: 'RFQ', label: 'RFQs' },
            { value: 'PO', label: 'Purchase Orders' },
            { value: 'GRN', label: 'Goods Receipts' },
          ]} value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} />
        </div>
      </Card>

      <DataTable columns={columns} data={filtered} emptyMessage="No audit entries found" />
    </div>
  );
}
