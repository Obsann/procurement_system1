import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Trophy, ArrowRight } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, Button, Input, Select, Card } from '../components/ui';
import { rfqs, requisitions, suppliers } from '../mockData';

export function RFQManagement() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = rfqs.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery && !r.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const columns = [
    { key: 'rfqNumber', label: 'RFQ Number', sortable: true, render: (row: any) => <span className="text-accent-indigo font-medium">{row.rfqNumber}</span> },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'linkedPRNumber', label: 'Linked PR', render: (row: any) => <span className="text-text-secondary">{row.linkedPRNumber}</span> },
    { key: 'deadline', label: 'Deadline', sortable: true, render: (row: any) => new Date(row.deadline).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
    { key: 'supplierCount', label: 'Suppliers', render: (row: any) => <span>{row.supplierCount} invited</span> },
    {
      key: 'actions', label: '', width: '140px',
      render: (row: any) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={(e: any) => { e.stopPropagation(); }}>View</Button>
          {row.status === 'RESPONDED' && (
            <Button variant="primary" size="sm" icon={<Trophy className="w-4 h-4" />} onClick={(e: any) => { e.stopPropagation(); navigate(`/bids?rfqId=${row.id}`); }}>Compare</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="RFQ Management" description="Create and manage Requests for Quotation" actions={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/rfqs/new')}>Create RFQ</Button>} />
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]"><Input placeholder="Search RFQs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search className="w-4 h-4" />} /></div>
          <Select options={[{ value: 'all', label: 'All Statuses' }, { value: 'DRAFT', label: 'Draft' }, { value: 'SENT', label: 'Sent' }, { value: 'RESPONDED', label: 'Responded' }, { value: 'CLOSED', label: 'Closed' }]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        </div>
      </Card>
      <DataTable columns={columns} data={filtered} emptyMessage="No RFQs found" emptyAction={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/rfqs/new')}>Create your first RFQ</Button>} />
    </div>
  );
}

export function CreateRFQ() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [linkedPR, setLinkedPR] = useState('');
  const [deadline, setDeadline] = useState('');
  const [invitedSuppliers, setInvitedSuppliers] = useState<string[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePRSelect = (prId: string) => {
    setLinkedPR(prId);
    const pr = requisitions.find(r => r.id === prId);
    if (pr) {
      setLineItems(pr.lineItems);
      setTitle(`RFQ for ${pr.title}`);
    }
  };

  const handleSubmit = (_sendToSuppliers: boolean) => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); navigate('/rfqs'); }, 1000);
  };

  const approvedPRs = requisitions.filter(r => r.status === 'APPROVED');
  const activeSuppliers = suppliers.filter(s => s.status === 'ACTIVE');

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <PageHeader title="Create RFQ" description="Set up a Request for Quotation based on an approved requisition" actions={<Button variant="ghost" onClick={() => navigate('/rfqs')}>← Back</Button>} />

      <Card className="p-6 space-y-6">
        <Input label="Title" placeholder="RFQ title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Select label="Linked Purchase Requisition" options={[{ value: '', label: 'Select a PR...' }, ...approvedPRs.map(pr => ({ value: pr.id, label: `${pr.prNumber} — ${pr.title}` }))]} value={linkedPR} onChange={(e) => handlePRSelect(e.target.value)} />
        <Input label="Submission Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">Invite Suppliers</label>
          <div className="grid grid-cols-2 gap-2">
            {activeSuppliers.map(s => (
              <button key={s.id} className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-sm ${invitedSuppliers.includes(s.id) ? 'border-accent-indigo bg-accent-indigo/10 text-accent-indigo' : 'border-border-default bg-bg-input text-text-secondary hover:border-border-hover'}`} onClick={() => setInvitedSuppliers(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])}>
                <Eye className="w-4 h-4" />
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {lineItems.length > 0 && (
        <Card className="p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">Line Items (from PR)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-bg-surface-hover"><th className="px-4 py-2 text-left text-xs font-semibold text-text-muted uppercase">Item</th><th className="px-4 py-2 text-left text-xs font-semibold text-text-muted uppercase">Description</th><th className="px-4 py-2 text-right text-xs font-semibold text-text-muted uppercase">Qty</th><th className="px-4 py-2 text-right text-xs font-semibold text-text-muted uppercase">Est. Total</th></tr></thead>
              <tbody>
                {lineItems.map(li => (
                  <tr key={li.id} className="border-t border-border-default">
                    <td className="px-4 py-3 font-medium text-text-primary">{li.itemName}</td>
                    <td className="px-4 py-3 text-text-secondary">{li.description}</td>
                    <td className="px-4 py-3 text-right text-text-primary">{li.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium text-accent-indigo">${li.estimatedTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={() => navigate('/rfqs')}>Cancel</Button>
        <Button variant="secondary" loading={submitting} onClick={() => handleSubmit(false)}>Save Draft</Button>
        <Button variant="primary" loading={submitting} onClick={() => handleSubmit(true)} icon={<ArrowRight className="w-4 h-4" />}>Send to Suppliers</Button>
      </div>
    </div>
  );
}
