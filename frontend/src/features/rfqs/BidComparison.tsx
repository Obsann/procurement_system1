import React, { useState } from 'react';
import { Award, Trophy } from 'lucide-react';
import { Button, Card, Modal, useToast } from '../../components/ui';
import { useSelectWinnerMutation } from '../../store/api/bidsApi';
import { formatMoney, formatQuantity, toNumber } from '../../lib/format';
import { apiErrorMessage } from '../../lib/apiError';
import { cn } from '../../lib/cn';
import { type Bid, type RFQ } from '../../types';

interface BidComparisonProps {
  rfq: RFQ;
  bids: Bid[];
}

/** Cheapest wins on price; ties keep the first, which is the earliest quote. */
const cheapestBidId = (bids: Bid[]): string | undefined =>
  bids.reduce<Bid | undefined>(
    (best, bid) => (!best || toNumber(bid.grand_total) < toNumber(best.grand_total) ? bid : best),
    undefined,
  )?.id;

const fastestBidId = (bids: Bid[]): string | undefined =>
  bids
    .filter((bid) => bid.lead_time_days != null)
    .reduce<Bid | undefined>(
      (best, bid) => (!best || (bid.lead_time_days ?? 0) < (best.lead_time_days ?? 0) ? bid : best),
      undefined,
    )?.id;

export const BidComparison: React.FC<BidComparisonProps> = ({ rfq, bids }) => {
  const { addToast } = useToast();
  const [selectWinner, { isLoading }] = useSelectWinnerMutation();
  const [pendingAward, setPendingAward] = useState<Bid | null>(null);

  const cheapest = cheapestBidId(bids);
  const fastest = fastestBidId(bids);
  const awarded = bids.find((bid) => bid.is_winner);
  // BR-06: a winner needs quotations from at least two distinct suppliers.
  const canAward = new Set(bids.map((bid) => bid.supplier)).size >= 2;

  const priceFor = (bid: Bid, rfqLineId: string) =>
    bid.lines.find((line) => line.rfq_line === rfqLineId);

  const confirmAward = async () => {
    if (!pendingAward) return;
    try {
      await selectWinner(pendingAward.id).unwrap();
      addToast('success', `${pendingAward.supplier_name} selected as the winning supplier.`);
      setPendingAward(null);
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not select this supplier.'));
    }
  };

  if (bids.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-text-muted">
          No quotations recorded yet. Record at least two so they can be compared.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default px-6 py-4">
        <h3 className="text-base font-semibold text-text-primary">Quotation comparison</h3>
        {!canAward ? (
          <p className="text-sm text-warning">
            Quotations from two different suppliers are needed before a winner can be chosen.
          </p>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default bg-bg-subtle">
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Item</th>
              {bids.map((bid) => (
                <th key={bid.id} className="px-4 py-3 text-right font-medium text-text-secondary">
                  <span className="flex items-center justify-end gap-2">
                    {bid.is_winner ? <Trophy className="h-4 w-4 text-success" /> : null}
                    {bid.supplier_name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rfq.lines.map((line) => (
              <tr key={line.id} className="border-b border-border-subtle">
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary">{line.item_name}</p>
                  <p className="text-xs text-text-muted">
                    {formatQuantity(line.quantity)} {line.unit_of_measure}
                  </p>
                </td>
                {bids.map((bid) => {
                  const bidLine = priceFor(bid, line.id);
                  const unitPrices = bids
                    .map((other) => toNumber(priceFor(other, line.id)?.unit_price))
                    .filter((price) => price > 0);
                  const best = unitPrices.length ? Math.min(...unitPrices) : 0;
                  const isBest = bidLine != null && toNumber(bidLine.unit_price) === best;
                  return (
                    <td key={bid.id} className="px-4 py-3 text-right">
                      {bidLine ? (
                        <>
                          <p
                            className={cn(
                              'font-medium',
                              isBest ? 'text-success' : 'text-text-primary',
                            )}
                          >
                            {formatMoney(bidLine.unit_price)}
                          </p>
                          <p className="text-xs text-text-muted">
                            {formatMoney(bidLine.total_price)}
                          </p>
                        </>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr className="border-b border-border-subtle">
              <td className="px-4 py-3 text-text-secondary">Freight, insurance and tax</td>
              {bids.map((bid) => (
                <td key={bid.id} className="px-4 py-3 text-right text-text-secondary">
                  {formatMoney(
                    toNumber(bid.freight_cost) +
                      toNumber(bid.insurance_cost) +
                      toNumber(bid.tax_amount),
                  )}
                </td>
              ))}
            </tr>

            <tr className="border-b border-border-subtle">
              <td className="px-4 py-3 text-text-secondary">Lead time</td>
              {bids.map((bid) => (
                <td
                  key={bid.id}
                  className={cn(
                    'px-4 py-3 text-right',
                    bid.id === fastest ? 'font-medium text-success' : 'text-text-secondary',
                  )}
                >
                  {bid.lead_time_days != null ? `${bid.lead_time_days} days` : '—'}
                </td>
              ))}
            </tr>

            <tr className="bg-bg-subtle">
              <td className="px-4 py-3 font-semibold text-text-primary">Grand total</td>
              {bids.map((bid) => (
                <td
                  key={bid.id}
                  className={cn(
                    'px-4 py-3 text-right font-semibold',
                    bid.id === cheapest ? 'text-success' : 'text-text-primary',
                  )}
                >
                  {formatMoney(bid.grand_total)}
                  {bid.id === cheapest ? (
                    <span className="ml-2 text-xs font-normal text-success">lowest</span>
                  ) : null}
                </td>
              ))}
            </tr>

            <tr>
              <td className="px-4 py-3" />
              {bids.map((bid) => (
                <td key={bid.id} className="px-4 py-3 text-right">
                  {awarded ? (
                    bid.is_winner ? (
                      <span className="text-sm font-medium text-success">Awarded</span>
                    ) : null
                  ) : (
                    <Button
                      variant="secondary"
                      disabled={!canAward}
                      icon={<Award className="h-4 w-4" />}
                      onClick={() => setPendingAward(bid)}
                    >
                      Award
                    </Button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <Modal
        open={pendingAward != null}
        onClose={() => setPendingAward(null)}
        title="Select winning supplier"
        actions={
          <>
            <Button variant="secondary" onClick={() => setPendingAward(null)}>
              Cancel
            </Button>
            <Button onClick={confirmAward} loading={isLoading}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Awarding to {pendingAward?.supplier_name} for{' '}
          {formatMoney(pendingAward?.grand_total)} closes this RFQ, and a purchase order can then
          be generated. This cannot be undone.
        </p>
      </Modal>
    </Card>
  );
};
