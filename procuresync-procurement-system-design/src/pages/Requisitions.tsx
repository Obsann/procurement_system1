import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, Eye, Edit3, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, Button, Input, Select, TextArea, Card, Modal } from '../components/ui';
import { requisitions, departments, locations } from '../mockData';

export function MyRequisitions() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  const filtered = requisitions.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase()) && !r.prNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const columns = [
    { key: 'prNumber', label: 'PR Number', sortable: true, render: (row: any) => <span className="text-accent-indigo font-medium cursor-pointer">{row.prNumber}</span> },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'totalAmount', label: 'Amount', sortable: true, render: (row: any) => <span className="font-medium">${row.totalAmount.toLocaleString()}</span> },
    { key: 'createdAt', label: 'Date', sortable: true, render: (row: any) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: 'actions', label: 'Actions', width: '180px',
      render: (row: any) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={(e: any) => { e.stopPropagation(); navigate(`/requisitions/edit/${row.id}`); }}>View</Button>
          {row.status === 'DRAFT' && (
            <Button variant="ghost" size="sm" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={(e: any) => { e.stopPropagation(); navigate(`/requisitions/new?edit=${row.id}`); }}>Edit</Button>
          )}
          {row.status === 'DRAFT' && (
            <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={(e: any) => { e.stopPropagation(); setDeleteModal(row.id); }}>Delete</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="My Requisitions"
        description="Manage your purchase requisitions"
        actions={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/requisitions/new')}>New Requisition</Button>}
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-200">
            <Input placeholder="Search requisitions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search className="w-4 h-4" />} />
          </div>
          <Select
            label=""
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'SUBMITTED', label: 'Submitted' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'RETURNED', label: 'Returned' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Table */}
      <DataTable columns={columns} data={filtered} onRowClick={(row) => navigate(`/requisitions/edit/${row.id}`)} emptyMessage="No requisitions found" emptyAction={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/requisitions/new')}>Create your first requisition</Button>} />

      {/* Delete modal */}
      <Modal open={deleteModal !== null} onClose={() => setDeleteModal(null)} title="Confirm Delete" actions={<><Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button><Button variant="danger" onClick={() => setDeleteModal(null)}>Delete</Button></>}>
        <p className="text-sm text-text-secondary">Are you sure you want to delete this requisition? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}

export function CreateRequisition() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState(departments[0]);
  const [location, setLocation] = useState(locations[0]);
  const [lineItems, setLineItems] = useState([
    { id: `li_new_${Date.now()}`, itemName: '', description: '', quantity: 1, unitPrice: 0, estimatedTotal: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(items => items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.estimatedTotal = updated.quantity * updated.unitPrice;
      }
      return updated;
    }));
  };

  const addLineItem = () => {
    setLineItems(items => [...items, { id: `li_new_${Date.now()}`, itemName: '', description: '', quantity: 1, unitPrice: 0, estimatedTotal: 0 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(items => items.filter(item => item.id !== id));
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.estimatedTotal, 0);

  const handleSubmit = (_isDraft: boolean) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigate('/requisitions');
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <PageHeader
        title="Create Requisition"
        description="Fill in the details for your purchase requisition"
        actions={<Button variant="ghost" onClick={() => navigate('/requisitions')}>← Back to List</Button>}
      />

      {/* Main form */}
      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title" placeholder="Enter requisition title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Select label="Department" options={departments.map(d => ({ value: d, label: d }))} value={department} onChange={(e) => setDepartment(e.target.value)} />
        </div>
        <TextArea label="Description" placeholder="Describe what you need to procure" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        <Select label="Location" options={locations.map(l => ({ value: l, label: l }))} value={location} onChange={(e) => setLocation(e.target.value)} />
      </Card>

      {/* Line items */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">Line Items</h3>
          <Button variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={addLineItem}>Add Item</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-surface-hover">
                <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase">Item Name</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase">Description</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase">Qty</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase">Unit Price</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase">Est. Total</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id} className="border-t border-border-default">
                  <td className="px-3 py-2"><input className="w-full bg-bg-input border border-border-default rounded-md px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-indigo" value={item.itemName} onChange={(e) => updateLineItem(item.id, 'itemName', e.target.value)} placeholder="Item name" /></td>
                  <td className="px-3 py-2"><input className="w-full bg-bg-input border border-border-default rounded-md px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-indigo" value={item.description} onChange={(e) => updateLineItem(item.id, 'description', e.target.value)} placeholder="Description" /></td>
                  <td className="px-3 py-2"><input type="number" className="w-20 bg-bg-input border border-border-default rounded-md px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-indigo" value={item.quantity} onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)} min="1" /></td>
                  <td className="px-3 py-2"><input type="number" className="w-24 bg-bg-input border border-border-default rounded-md px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-indigo" value={item.unitPrice} onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} min="0" step="0.01" /></td>
                  <td className="px-3 py-2"><span className="font-medium text-accent-indigo">${item.estimatedTotal.toLocaleString()}</span></td>
                  <td className="px-3 py-2"><button className="text-text-muted hover:text-danger transition-colors" onClick={() => removeLineItem(item.id)} disabled={lineItems.length <= 1}><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border-default">
                <td colSpan={4} className="px-3 py-3 text-right text-sm font-semibold text-text-secondary">Total Amount:</td>
                <td className="px-3 py-3 text-lg font-bold text-accent-indigo">${totalAmount.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={() => navigate('/requisitions')}>Cancel</Button>
        <Button variant="secondary" loading={submitting} onClick={() => handleSubmit(true)}>Save as Draft</Button>
        <Button variant="primary" loading={submitting} onClick={() => handleSubmit(false)}>Submit for Approval</Button>
      </div>
    </div>
  );
}

export function RequisitionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const pr = requisitions.find(r => r.id === id) || requisitions[0];

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <PageHeader
        title={pr.prNumber}
        description={pr.title}
        actions={<Button variant="ghost" onClick={() => navigate('/requisitions')}>← Back to List</Button>}
      />

      {/* Details card */}
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-xs text-text-muted">Status</p><StatusBadge status={pr.status} /></div>
          <div><p className="text-xs text-text-muted">Department</p><p className="text-sm text-text-primary font-medium">{pr.department}</p></div>
          <div><p className="text-xs text-text-muted">Location</p><p className="text-sm text-text-primary font-medium">{pr.location}</p></div>
          <div><p className="text-xs text-text-muted">Requester</p><p className="text-sm text-text-primary font-medium">{pr.requesterName}</p></div>
        </div>
        <div><p className="text-xs text-text-muted mb-1">Description</p><p className="text-sm text-text-secondary">{pr.description}</p></div>
      </Card>

      {/* Line items */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">Line Items</h3>
        <table className="w-full text-sm">
          <thead><tr className="bg-bg-surface-hover"><th className="px-4 py-2 text-left text-xs font-semibold text-text-muted uppercase">Item</th><th className="px-4 py-2 text-left text-xs font-semibold text-text-muted uppercase">Description</th><th className="px-4 py-2 text-right text-xs font-semibold text-text-muted uppercase">Qty</th><th className="px-4 py-2 text-right text-xs font-semibold text-text-muted uppercase">Unit Price</th><th className="px-4 py-2 text-right text-xs font-semibold text-text-muted uppercase">Total</th></tr></thead>
          <tbody>
            {pr.lineItems.map(li => (
              <tr key={li.id} className="border-t border-border-default">
                <td className="px-4 py-3 font-medium text-text-primary">{li.itemName}</td>
                <td className="px-4 py-3 text-text-secondary">{li.description}</td>
                <td className="px-4 py-3 text-right text-text-primary">{li.quantity}</td>
                <td className="px-4 py-3 text-right text-text-primary">${li.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-medium text-accent-indigo">${li.estimatedTotal.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border-default">
              <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Grand Total:</td>
              <td className="px-4 py-3 text-right text-lg font-bold text-accent-indigo">${pr.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </Card>
    </div>
  );
}
