import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import {
  Button,
  Card,
  Input,
  PageHeader,
  Select,
  TextArea,
  useToast,
} from '../../components/ui';
import { useGetOrdersQuery } from '../../store/api/ordersApi';
import { useCreateGoodsReceiptMutation } from '../../store/api/goodsReceiptsApi';
import { apiErrorMessage } from '../../lib/apiError';
import { formatQuantity } from '../../lib/format';

export const GoodsReceiptFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: ordersData, isLoading: loadingOrders } = useGetOrdersQuery({});
  const [createReceipt, { isLoading: isSubmitting }] = useCreateGoodsReceiptMutation();

  const [selectedPoId, setSelectedPoId] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'PARTIAL' | 'COMPLETE'>('COMPLETE');
  const [globalNotes, setGlobalNotes] = useState('');

  // line id -> state mapping
  const [lineInputs, setLineInputs] = useState<
    Record<string, { received_quantity: string; notes: string }>
  >({});

  const eligibleOrders = useMemo(() => {
    return (ordersData?.results || []).filter(
      (po) => po.status === 'PO_APPROVED' || po.status === 'PARTIALLY_RECEIVED'
    );
  }, [ordersData]);

  const selectedOrder = useMemo(() => {
    return eligibleOrders.find((po) => po.id === selectedPoId);
  }, [eligibleOrders, selectedPoId]);

  const handlePoChange = (poId: string) => {
    setSelectedPoId(poId);
    // Reset lines
    const order = eligibleOrders.find((o) => o.id === poId);
    if (order) {
      const initialInputs: Record<string, { received_quantity: string; notes: string }> = {};
      order.lines.forEach((line) => {
        initialInputs[line.id] = {
          received_quantity: line.quantity, // Default to full quantity
          notes: '',
        };
      });
      setLineInputs(initialInputs);
    } else {
      setLineInputs({});
    }
  };

  const handleLineChange = (lineId: string, field: 'received_quantity' | 'notes', value: string) => {
    setLineInputs((prev) => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedPoId || !selectedOrder) {
      addToast('error', 'Please select a purchase order.');
      return;
    }

    const payloadLines = selectedOrder.lines.map((line) => ({
      po_line: line.id,
      expected_quantity: line.quantity,
      received_quantity: lineInputs[line.id]?.received_quantity || '0',
      notes: lineInputs[line.id]?.notes || '',
    }));

    // Filter out rows where 0 was received if you want, but backend might want them all or just the received ones.
    // Assuming backend needs all or we just send everything mapped.
    const filteredLines = payloadLines.filter((l) => parseFloat(l.received_quantity) > 0);

    if (filteredLines.length === 0) {
      addToast('error', 'Please enter a received quantity for at least one item.');
      return;
    }

    try {
      await createReceipt({
        purchase_order: selectedPoId,
        received_date: receivedDate,
        status,
        notes: globalNotes,
        lines: filteredLines,
      }).unwrap();

      addToast('success', 'Goods receipt recorded successfully.');
      navigate('/goods-receipts');
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not record goods receipt.'));
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Record Goods Receipt"
        description="Log items received from a supplier"
        actions={
          <Button
            variant="ghost"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/goods-receipts')}
          >
            Cancel
          </Button>
        }
      />

      <Card className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Select
            label="Purchase Order"
            value={selectedPoId}
            onChange={(e) => handlePoChange(e.target.value)}
            options={[
              { value: '', label: loadingOrders ? 'Loading orders...' : 'Select a PO...' },
              ...eligibleOrders.map((po) => ({
                value: po.id,
                label: `${po.po_number} - ${po.supplier_name}`,
              })),
            ]}
          />

          {selectedOrder && (
            <Input
              label="Received Date"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
            />
          )}
        </div>
      </Card>

      {selectedOrder && (
        <>
          <Card className="p-6">
            <h3 className="mb-4 text-base font-semibold text-text-primary">Items Received</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-surface-hover">
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-text-muted">
                      Item
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-text-muted">
                      Expected
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-text-muted">
                      Received
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-text-muted">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.lines.map((line) => (
                    <tr key={line.id} className="border-t border-border-default">
                      <td className="px-4 py-3 text-text-primary">
                        <div className="font-medium">{line.item_name}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-text-secondary">
                        {formatQuantity(line.quantity)}
                      </td>
                      <td className="w-32 px-4 py-3 align-top">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={lineInputs[line.id]?.received_quantity || ''}
                          onChange={(e) => handleLineChange(line.id, 'received_quantity', e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td className="w-64 px-4 py-3 align-top">
                        <Input
                          value={lineInputs[line.id]?.notes || ''}
                          onChange={(e) => handleLineChange(line.id, 'notes', e.target.value)}
                          placeholder="Condition, serials..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-base font-semibold text-text-primary">Receipt Details</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Select
                label="Receipt Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'PARTIAL' | 'COMPLETE')}
                options={[
                  { value: 'COMPLETE', label: 'Complete (All items received)' },
                  { value: 'PARTIAL', label: 'Partial (Some items missing/rejected)' },
                ]}
              />

              <div className="md:col-span-2">
                <TextArea
                  label="General Notes"
                  value={globalNotes}
                  onChange={(e) => setGlobalNotes(e.target.value)}
                  placeholder="Any additional notes about this delivery..."
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-border-default pt-6">
              <Button variant="ghost" onClick={() => navigate('/goods-receipts')}>
                Cancel
              </Button>
              <Button
                icon={<Save className="h-4 w-4" />}
                isLoading={isSubmitting}
                onClick={handleSubmit}
              >
                Save Goods Receipt
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
