import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, Button, Input, Select, TextArea, Card } from '../components/ui';
import { goodsReceipts, purchaseOrders } from '../mockData';
import type { GRStatus } from '../types';

export function GoodsReceipts() {
  const navigate = useNavigate();
  const columns = [
    { key: 'grnNumber', label: 'GRN Number', sortable: true, render: (row: any) => <span className="text-accent-indigo font-medium">{row.grnNumber}</span> },
    { key: 'poNumber', label: 'PO Number', render: (row: any) => <span className="text-text-secondary">{row.poNumber}</span> },
    { key: 'supplierName', label: 'Supplier', sortable: true },
    { key: 'receivedDate', label: 'Received Date', sortable: true, render: (row: any) => new Date(row.receivedDate).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Goods Receipts" description="Track received goods against purchase orders" actions={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/goods-receipts/new')}>Record Receipt</Button>} />
      <DataTable columns={columns} data={goodsReceipts} emptyMessage="No goods receipts recorded" emptyAction={<Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/goods-receipts/new')}>Record your first receipt</Button>} />
    </div>
  );
}

export function CreateGoodsReceipt() {
  const navigate = useNavigate();
  const approvedPOs = purchaseOrders.filter(po => po.status === 'PO_APPROVED');
  const [selectedPOId, setSelectedPOId] = useState(approvedPOs.length > 0 ? approvedPOs[0].id : '');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<{ lineItemId: string; itemName: string; expectedQty: number; receivedQty: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const selectedPO = purchaseOrders.find(po => po.id === selectedPOId);

  const handlePOSelect = (poId: string) => {
    setSelectedPOId(poId);
    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      setLineItems(po.lineItems.map(li => ({
        lineItemId: li.id,
        itemName: li.itemName,
        expectedQty: li.quantity,
        receivedQty: 0,
      })));
    }
  };

  // Initialize line items if PO is pre-selected
  if (selectedPO && lineItems.length === 0) {
    setLineItems(selectedPO.lineItems.map(li => ({
      lineItemId: li.id,
      itemName: li.itemName,
      expectedQty: li.quantity,
      receivedQty: 0,
    })));
  }

  const updateReceivedQty = (lineItemId: string, qty: number) => {
    setLineItems(prev => prev.map(item => item.lineItemId === lineItemId ? { ...item, receivedQty: qty } : item));
  };

  const allComplete = lineItems.every(item => item.receivedQty >= item.expectedQty);
  const anyPartial = lineItems.some(item => item.receivedQty > 0 && item.receivedQty < item.expectedQty);
  const status: GRStatus = allComplete ? 'COMPLETE' : anyPartial ? 'PARTIAL' : 'PARTIAL';

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); navigate('/goods-receipts'); }, 1000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <PageHeader title="Record Goods Receipt" description="Record received items against an approved purchase order" actions={<Button variant="ghost" onClick={() => navigate('/goods-receipts')}>← Back</Button>} />

      <Card className="p-6 space-y-6">
        <Select
          label="Select Approved PO"
          options={approvedPOs.map(po => ({ value: po.id, label: `${po.poNumber} — ${po.supplierName} ($${po.totalAmount.toLocaleString()})` }))}
          value={selectedPOId}
          onChange={(e) => handlePOSelect(e.target.value)}
        />
        <Input label="Received Date" type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
        <TextArea label="Notes" placeholder="Any notes about the delivery..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </Card>

      {lineItems.length > 0 && (
        <Card className="p-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">Line Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-surface-hover">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-text-muted uppercase">Item</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-text-muted uppercase">Expected Qty</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-text-muted uppercase">Received Qty</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-text-muted uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map(item => (
                  <tr key={item.lineItemId} className="border-t border-border-default">
                    <td className="px-4 py-3 font-medium text-text-primary">{item.itemName}</td>
                    <td className="px-4 py-3 text-right text-text-secondary">{item.expectedQty}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max={item.expectedQty}
                        value={item.receivedQty}
                        onChange={(e) => updateReceivedQty(item.lineItemId, parseInt(e.target.value) || 0)}
                        className="w-24 bg-bg-input border border-border-default rounded-md px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-indigo mx-auto block"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.receivedQty === 0 ? <span className="text-text-muted">Pending</span> :
                       item.receivedQty >= item.expectedQty ? <StatusBadge status="COMPLETE" /> :
                       <StatusBadge status="PARTIAL" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Overall status */}
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-border-default">
            <span className="text-sm font-medium text-text-secondary">Overall Receipt Status:</span>
            <StatusBadge status={status} />
          </div>
        </Card>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={() => navigate('/goods-receipts')}>Cancel</Button>
        <Button variant="primary" loading={submitting} onClick={handleSubmit} icon={<Package className="w-4 h-4" />}>Submit Receipt</Button>
      </div>
    </div>
  );
}
