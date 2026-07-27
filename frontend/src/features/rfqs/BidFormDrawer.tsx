import React, { useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Input, Select, TextArea, useToast } from '../../components/ui';
import { useCreateBidMutation } from '../../store/api/bidsApi';
import { formatMoney, toNumber } from '../../lib/format';
import { apiErrorMessage } from '../../lib/apiError';
import { type RFQ } from '../../types';

interface BidFormDrawerProps {
  rfq: RFQ;
  open: boolean;
  onClose: () => void;
  /** Suppliers that have already quoted, so they are not offered twice. */
  quotedSupplierIds: string[];
}

interface LineEntry {
  quantity: string;
  unitPrice: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export const BidFormDrawer: React.FC<BidFormDrawerProps> = ({
  rfq,
  open,
  onClose,
  quotedSupplierIds,
}) => {
  const { addToast } = useToast();
  const [createBid, { isLoading }] = useCreateBidMutation();

  const [supplier, setSupplier] = useState('');
  const [bidDate, setBidDate] = useState(today);
  const [leadTime, setLeadTime] = useState('');
  const [freight, setFreight] = useState('0');
  const [insurance, setInsurance] = useState('0');
  const [tax, setTax] = useState('0');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Record<string, LineEntry>>({});
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    setSupplier('');
    setBidDate(today());
    setLeadTime('');
    setFreight('0');
    setInsurance('0');
    setTax('0');
    setNotes('');
    setError(undefined);
    setLines(
      Object.fromEntries(
        rfq.lines.map((line) => [line.id, { quantity: String(toNumber(line.quantity)), unitPrice: '' }]),
      ),
    );
  }, [open, rfq.lines]);

  const availableSuppliers = rfq.invited_suppliers.filter(
    (invited) => !quotedSupplierIds.includes(invited.supplier),
  );

  const lineTotal = (entry: LineEntry | undefined) =>
    toNumber(entry?.quantity) * toNumber(entry?.unitPrice);

  const subtotal = useMemo(
    () => rfq.lines.reduce((sum, line) => sum + lineTotal(lines[line.id]), 0),
    [rfq.lines, lines],
  );

  const grandTotal = subtotal + toNumber(freight) + toNumber(insurance) + toNumber(tax);

  const updateLine = (lineId: string, patch: Partial<LineEntry>) =>
    setLines((current) => ({ ...current, [lineId]: { ...current[lineId], ...patch } }));

  const save = async () => {
    if (!supplier) {
      setError('Choose which supplier this quotation came from.');
      return;
    }
    const missingPrice = rfq.lines.some((line) => lines[line.id]?.unitPrice.trim() === '');
    if (missingPrice) {
      setError('Every line needs a unit price.');
      return;
    }
    setError(undefined);

    try {
      await createBid({
        rfq: rfq.id,
        supplier,
        bid_date: bidDate,
        lead_time_days: leadTime ? Number(leadTime) : null,
        freight_cost: String(toNumber(freight)),
        insurance_cost: String(toNumber(insurance)),
        tax_amount: String(toNumber(tax)),
        grand_total: grandTotal.toFixed(2),
        notes,
        lines: rfq.lines.map((line) => ({
          rfq_line: line.id,
          quantity_offered: String(toNumber(lines[line.id]?.quantity)),
          unit_price: String(toNumber(lines[line.id]?.unitPrice)),
          total_price: lineTotal(lines[line.id]).toFixed(2),
        })),
      }).unwrap();
      addToast('success', 'Quotation recorded.');
      onClose();
    } catch (err) {
      addToast('error', apiErrorMessage(err, 'Could not record this quotation.'));
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="Record a quotation" width="560px">
      <div className="space-y-5">
        <Select
          label="Supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          options={[
            { value: '', label: 'Select an invited supplier' },
            ...availableSuppliers.map((invited) => ({
              value: invited.supplier,
              label: invited.supplier_name,
            })),
          ]}
        />
        {availableSuppliers.length === 0 ? (
          <p className="text-sm text-text-muted">
            Every invited supplier has already submitted a quotation.
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Quotation date"
            type="date"
            value={bidDate}
            onChange={(e) => setBidDate(e.target.value)}
          />
          <Input
            label="Lead time (days)"
            type="number"
            value={leadTime}
            onChange={(e) => setLeadTime(e.target.value)}
          />
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-text-primary">Prices per line</h4>
          <div className="space-y-3">
            {rfq.lines.map((line) => (
              <div key={line.id} className="rounded-lg border border-border-subtle p-3">
                <p className="mb-2 text-sm font-medium text-text-primary">{line.item_name}</p>
                <div className="grid grid-cols-3 items-end gap-3">
                  <Input
                    label="Quantity"
                    type="number"
                    step="0.01"
                    value={lines[line.id]?.quantity ?? ''}
                    onChange={(e) => updateLine(line.id, { quantity: e.target.value })}
                  />
                  <Input
                    label="Unit price"
                    type="number"
                    step="0.01"
                    value={lines[line.id]?.unitPrice ?? ''}
                    onChange={(e) => updateLine(line.id, { unitPrice: e.target.value })}
                  />
                  <p className="pb-2 text-right text-sm text-text-secondary">
                    {formatMoney(lineTotal(lines[line.id]))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Freight"
            type="number"
            step="0.01"
            value={freight}
            onChange={(e) => setFreight(e.target.value)}
          />
          <Input
            label="Insurance"
            type="number"
            step="0.01"
            value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
          />
          <Input
            label="Tax"
            type="number"
            step="0.01"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
          />
        </div>

        <TextArea label="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="flex items-center justify-between rounded-lg bg-bg-subtle px-4 py-3">
          <span className="text-sm text-text-secondary">Grand total</span>
          <span className="text-lg font-semibold text-text-primary">{formatMoney(grandTotal)}</span>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={isLoading} disabled={availableSuppliers.length === 0}>
            Save quotation
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
