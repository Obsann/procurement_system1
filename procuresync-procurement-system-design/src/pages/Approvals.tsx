import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, ArrowRight } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, Button, Card, TextArea, Timeline, Modal } from '../components/ui';
import { requisitions, purchaseOrders, approvalHistory } from '../mockData';

export function PendingApprovals() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('pr');

  const pendingPRs = requisitions.filter(r => r.status === 'SUBMITTED');
  const pendingPOs = purchaseOrders.filter(po => po.status === 'FINAL_APPROVAL');

  const prColumns = [
    { key: 'prNumber', label: 'PR Number', sortable: true, render: (row: any) => <span className="text-accent-indigo font-medium">{row.prNumber}</span> },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'requesterName', label: 'Requester', sortable: true },
    { key: 'totalAmount', label: 'Amount', sortable: true, render: (row: any) => <span className="font-medium">${row.totalAmount.toLocaleString()}</span> },
    { key: 'createdAt', label: 'Days Waiting', render: (row: any) => <span className="text-warning">{Math.floor((Date.now() - new Date(row.createdAt).getTime()) / 86400000)}d</span> },
    { key: 'actions', label: '', width: '120px', render: (row: any) => <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />} onClick={(e: any) => { e.stopPropagation(); navigate(`/approvals/${row.id}`); }}>Review</Button> },
  ];

  const poColumns = [
    { key: 'poNumber', label: 'PO Number', sortable: true, render: (row: any) => <span className="text-accent-indigo font-medium">{row.poNumber}</span> },
    { key: 'linkedPRNumber', label: 'Linked PR', sortable: true },
    { key: 'supplierName', label: 'Supplier', sortable: true },
    { key: 'totalAmount', label: 'Amount', sortable: true, render: (row: any) => <span className="font-medium">${row.totalAmount.toLocaleString()}</span> },
    { key: 'actions', label: '', width: '120px', render: (row: any) => <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />} onClick={(e: any) => { e.stopPropagation(); navigate(`/approvals/${row.id}`); }}>Review</Button> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Pending Approvals" description="Review and approve purchase requisitions and purchase orders" />
      <div className="flex items-center gap-1 bg-bg-surface rounded-lg border border-border-default p-1">
        <button className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'pr' ? 'bg-accent-indigo text-white' : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'}`} onClick={() => setTab('pr')}>PR Approvals ({pendingPRs.length})</button>
        <button className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'po' ? 'bg-accent-indigo text-white' : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'}`} onClick={() => setTab('po')}>PO Approvals ({pendingPOs.length})</button>
      </div>
      {tab === 'pr' ? (
        <DataTable columns={prColumns} data={pendingPRs} onRowClick={(row) => navigate(`/approvals/${row.id}`)} emptyMessage="No pending PR approvals" />
      ) : (
        <DataTable columns={poColumns} data={pendingPOs} onRowClick={(row) => navigate(`/approvals/${row.id}`)} emptyMessage="No pending PO approvals" />
      )}
    </div>
  );
}

export function ApprovalDetail() {
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // For demo, use the first requisition that is SUBMITTED
  const pr = requisitions.find(r => r.status === 'SUBMITTED') || requisitions[0];

  const handleConfirm = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setConfirmAction(null);
      navigate('/approvals');
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <PageHeader title={pr.prNumber} description={pr.title} actions={<Button variant="ghost" onClick={() => navigate('/approvals')}>← Back</Button>} />

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-xs text-text-muted">Status</p><StatusBadge status={pr.status} /></div>
          <div><p className="text-xs text-text-muted">Requester</p><p className="text-sm text-text-primary font-medium">{pr.requesterName}</p></div>
          <div><p className="text-xs text-text-muted">Department</p><p className="text-sm text-text-primary font-medium">{pr.department}</p></div>
          <div><p className="text-xs text-text-muted">Created</p><p className="text-sm text-text-primary font-medium">{new Date(pr.createdAt).toLocaleDateString()}</p></div>
        </div>
        <div><p className="text-xs text-text-muted mb-1">Description</p><p className="text-sm text-text-secondary">{pr.description}</p></div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">Line Items</h3>
        <div className="overflow-x-auto">
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
            <tfoot><tr className="border-t-2 border-border-default"><td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Grand Total:</td><td className="px-4 py-3 text-right text-lg font-bold text-accent-indigo">${pr.totalAmount.toLocaleString()}</td></tr></tfoot>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">Approval History</h3>
        <Timeline entries={approvalHistory} />
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">Your Decision</h3>
        <TextArea label="Comments" placeholder="Add your comments before making a decision..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
        <div className="flex items-center gap-3 mt-4">
          <Button variant="primary" icon={<CheckSquare className="w-4 h-4" />} onClick={() => setConfirmAction('approve')} className="!bg-success !hover:bg-success/90">Approve</Button>
          <Button variant="secondary" icon={<Clock className="w-4 h-4" />} onClick={() => setConfirmAction('return')} className="!text-warning !border-warning/30">Return</Button>
          <Button variant="danger" icon={<ArrowRight className="w-4 h-4" />} onClick={() => setConfirmAction('reject')}>Reject</Button>
        </div>
      </Card>

      <Modal
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        title={`Confirm ${confirmAction === 'approve' ? 'Approval' : confirmAction === 'return' ? 'Return' : 'Rejection'}`}
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button variant={confirmAction === 'approve' ? 'primary' : confirmAction === 'reject' ? 'danger' : 'secondary'} loading={submitting} onClick={handleConfirm}>Confirm</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          {confirmAction === 'approve' ? 'Are you sure you want to approve this requisition?' :
           confirmAction === 'return' ? 'Are you sure you want to return this requisition for revision?' :
           'Are you sure you want to reject this requisition? This action cannot be undone.'}
        </p>
      </Modal>
    </div>
  );
}
