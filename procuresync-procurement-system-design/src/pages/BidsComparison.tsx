import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { PageHeader, StatusBadge, Button, Card, Modal } from '../components/ui';
import { rfqs } from '../mockData';

export function BidsComparison() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const rfqId = searchParams.get('rfqId') || 'rfq1';
  const rfq = rfqs.find(r => r.id === rfqId) || rfqs[0];
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);

  if (rfq.bids.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <PageHeader title="Bids Comparison" description={`No bids received for ${rfq.rfqNumber}`} actions={<Button variant="ghost" onClick={() => navigate('/rfqs')}>← Back</Button>} />
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-surface-hover border border-border-default flex items-center justify-center"><Trophy className="w-8 h-8 text-text-muted" /></div>
          <p className="text-text-secondary mb-2">No suppliers have submitted bids yet</p>
          <p className="text-xs text-text-muted">Wait for suppliers to respond or invite more suppliers.</p>
        </Card>
      </div>
    );
  }

  const lowestTotal = Math.min(...rfq.bids.map(b => b.grandTotal));

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title={`Bids for ${rfq.rfqNumber}`} description={`Comparing ${rfq.bids.length} supplier bids`} actions={<Button variant="ghost" onClick={() => navigate('/rfqs')}>← Back</Button>} />

      {/* Summary table */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">Bid Comparison Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-surface-hover">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Supplier</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase">Grand Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase">Freight</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase">Insurance</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase">Tax</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase">Items Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-muted uppercase">Best</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-muted uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {rfq.bids.map(bid => (
                <tr key={bid.id} className={`border-t border-border-default ${bid.grandTotal === lowestTotal ? 'bg-success/5' : 'hover:bg-bg-surface-hover'}`}>
                  <td className="px-4 py-3 font-medium text-text-primary">{bid.supplierName}</td>
                  <td className="px-4 py-3 text-right font-semibold text-text-primary">${bid.grandTotal.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">${bid.freight.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">${bid.insurance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">${bid.tax.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-text-primary">${(bid.grandTotal - bid.freight - bid.insurance - bid.tax).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    {bid.grandTotal === lowestTotal ? <StatusBadge status="APPROVED" /> : <span className="text-text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="primary" size="sm" disabled={rfq.bids.length < 2} onClick={() => { setSelectedWinner(bid.id); setConfirmModal(true); }}>Select Winner</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Line item breakdown */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">Line Item Breakdown</h3>
        <div className="space-y-4">
          {rfq.bids.map(bid => (
            <div key={bid.id}>
              <p className="text-sm font-medium text-accent-indigo mb-2">{bid.supplierName}</p>
              <table className="w-full text-xs">
                <thead><tr className="bg-bg-surface-hover"><th className="px-3 py-1.5 text-left text-text-muted">Item</th><th className="px-3 py-1.5 text-right text-text-muted">Qty</th><th className="px-3 py-1.5 text-right text-text-muted">Unit Price</th><th className="px-3 py-1.5 text-right text-text-muted">Total</th></tr></thead>
                <tbody>
                  {bid.lineItems.map(li => {
                    const prItem = rfq.lineItems.find(i => i.id === li.lineItemId);
                    return (
                      <tr key={li.lineItemId} className="border-t border-border-default">
                        <td className="px-3 py-1.5 text-text-primary">{prItem?.itemName || 'Item'}</td>
                        <td className="px-3 py-1.5 text-right text-text-secondary">{prItem?.quantity || 0}</td>
                        <td className="px-3 py-1.5 text-right text-text-primary">${li.unitPrice.toFixed(2)}</td>
                        <td className="px-3 py-1.5 text-right font-medium text-text-primary">${li.total.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={confirmModal} onClose={() => setConfirmModal(false)} title="Confirm Winner Selection" actions={<><Button variant="ghost" onClick={() => setConfirmModal(false)}>Cancel</Button><Button variant="primary" onClick={() => { setConfirmModal(false); navigate('/purchase-orders'); }}>Confirm & Generate PO</Button></>}>
        <p className="text-sm text-text-secondary">You are selecting <span className="font-medium text-text-primary">{rfq.bids.find(b => b.id === selectedWinner)?.supplierName || 'supplier'}</span> as the winning supplier. A Purchase Order will be generated.</p>
      </Modal>
    </div>
  );
}
