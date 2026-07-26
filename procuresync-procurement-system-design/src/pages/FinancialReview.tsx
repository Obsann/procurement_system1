import { useState } from 'react';

import { X } from 'lucide-react';
import { PageHeader, StatusBadge, Button, Card, TextArea } from '../components/ui';
import { purchaseOrders } from '../mockData';

export function FinancialReview() {
  
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const reviewPOs = purchaseOrders.filter(po => po.status === 'FINANCIAL_REVIEW');
  const selectedPO = purchaseOrders.find(po => po.id === selectedPOId);

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Financial Review Queue" description={`${reviewPOs.length} purchase orders awaiting financial review`} />

      {reviewPOs.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-surface-hover border border-border-default flex items-center justify-center text-text-muted text-2xl">✓</div>
          <p className="text-text-secondary mb-2">No POs pending financial review</p>
          <p className="text-xs text-text-muted">All purchase orders have been reviewed.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviewPOs.map(po => (
            <Card key={po.id} className="p-4 hover:bg-bg-surface-hover cursor-pointer transition-all" onClick={() => setSelectedPOId(po.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-accent-indigo font-medium text-sm">{po.poNumber}</span>
                  <span className="text-sm text-text-primary">{po.linkedPRNumber}</span>
                  <span className="text-sm text-text-secondary">{po.supplierName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-sm">${po.totalAmount.toLocaleString()}</span>
                  <StatusBadge status={po.status} />
                  <Button variant="secondary" size="sm">Review</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Side drawer */}
      {selectedPOId && selectedPO && (
        <div className="fixed inset-0 z-50" onClick={() => setSelectedPOId(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 bottom-0 w-[480px] bg-bg-surface border-l border-border-default shadow-xl overflow-y-auto animate-slideInRight" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">{selectedPO.poNumber}</h3>
                <button onClick={() => setSelectedPOId(null)} className="text-text-muted hover:text-text-primary transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-text-muted">Linked PR</p><p className="text-sm text-text-primary font-medium">{selectedPO.linkedPRNumber}</p></div>
                <div><p className="text-xs text-text-muted">Supplier</p><p className="text-sm text-text-primary font-medium">{selectedPO.supplierName}</p></div>
                <div><p className="text-xs text-text-muted">Total Amount</p><p className="text-sm font-bold text-accent-indigo">${selectedPO.totalAmount.toLocaleString()}</p></div>
                <div><p className="text-xs text-text-muted">Status</p><StatusBadge status={selectedPO.status} /></div>
              </div>

              {/* Budget check */}
              <Card className="p-4">
                <h4 className="text-sm font-semibold text-text-primary mb-3">Budget Check</h4>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-text-muted">Department Budget</span><span className="text-sm text-text-primary">$50,000</span></div>
                  <div className="flex justify-between"><span className="text-xs text-text-muted">Spent to Date</span><span className="text-sm text-text-primary">$12,000</span></div>
                  <div className="flex justify-between"><span className="text-xs text-text-muted">This PO</span><span className="text-sm font-medium text-accent-indigo">${selectedPO.totalAmount.toLocaleString()}</span></div>
                  <div className="border-t border-border-default pt-2 flex justify-between">
                    <span className="text-xs text-text-muted">Remaining after PO</span>
                    <span className="text-sm font-semibold text-success">$38,000</span>
                  </div>
                </div>
              </Card>

              {/* Line items */}
              <Card className="p-4">
                <h4 className="text-sm font-semibold text-text-primary mb-3">Line Items</h4>
                <table className="w-full text-xs">
                  <thead><tr className="bg-bg-surface-hover"><th className="px-2 py-1 text-left text-text-muted">Item</th><th className="px-2 py-1 text-right text-text-muted">Qty</th><th className="px-2 py-1 text-right text-text-muted">Total</th></tr></thead>
                  <tbody>
                    {selectedPO.lineItems.map(li => (
                      <tr key={li.id} className="border-t border-border-default"><td className="px-2 py-1 text-text-primary">{li.itemName}</td><td className="px-2 py-1 text-right">{li.quantity}</td><td className="px-2 py-1 text-right font-medium">${li.estimatedTotal.toLocaleString()}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <TextArea label="Comments" placeholder="Add your review comments..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />

              <div className="flex items-center gap-3">
                <Button variant="primary" onClick={() => setSelectedPOId(null)}>Approve</Button>
                <Button variant="secondary" onClick={() => setSelectedPOId(null)}>Return</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
