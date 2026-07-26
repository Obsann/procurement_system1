import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, PageHeader, StatusBadge } from '../../components/ui';
import { useGetOrderByIdQuery } from '../../store/api/ordersApi';
import { formatDate, formatMoney, formatQuantity } from '../../lib/format';
import { ApprovalHistory } from './ApprovalHistory';
import { DecisionPanel } from './DecisionPanel';

export const OrderReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: po, isLoading, isError } = useGetOrderByIdQuery(id!, { skip: !id });

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-bg-surface" />;

  if (isError || !po) {
    return (
      <Card className="p-8 text-center">
        <p className="mb-4 text-text-secondary">This purchase order could not be loaded.</p>
        <Button variant="secondary" onClick={() => navigate('/approvals')}>
          Back to approvals
        </Button>
      </Card>
    );
  }

  const costs = [
    { label: 'Subtotal', value: po.subtotal },
    { label: 'Freight', value: po.freight_cost },
    { label: 'Insurance', value: po.insurance_cost },
    { label: 'Tax', value: po.tax_amount },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title={po.po_number}
        description={`Supplier: ${po.supplier_name}`}
        actions={
          <Button
            variant="ghost"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/approvals')}
          >
            Back to queue
          </Button>
        }
      />

      <Card className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="mb-1 text-xs text-text-muted">Status</p>
            <StatusBadge status={po.status} />
          </div>
          <div>
            <p className="text-xs text-text-muted">Linked requisition</p>
            <p className="text-sm font-medium text-text-primary">{po.pr_number}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Payment terms</p>
            <p className="text-sm font-medium text-text-primary">{po.payment_terms || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Submitted</p>
            <p className="text-sm font-medium text-text-primary">{formatDate(po.submitted_at)}</p>
          </div>
        </div>
        {po.notes && (
          <div>
            <p className="mb-1 text-xs text-text-muted">Notes</p>
            <p className="text-sm text-text-secondary">{po.notes}</p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-base font-semibold text-text-primary">Line items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-surface-hover">
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-text-muted">
                  Item
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-text-muted">
                  Qty
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-text-muted">
                  Unit price
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-text-muted">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {po.lines.map((line) => (
                <tr key={line.id} className="border-t border-border-default">
                  <td className="px-4 py-3 font-medium text-text-primary">{line.item_name}</td>
                  <td className="px-4 py-3 text-right text-text-primary">
                    {formatQuantity(line.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right text-text-primary">
                    {formatMoney(line.unit_price, po.currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-accent-indigo">
                    {formatMoney(line.total_price, po.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-6 space-y-2 border-t border-border-default pt-4 text-sm">
          {costs.map((cost) => (
            <div key={cost.label} className="flex justify-between">
              <dt className="text-text-secondary">{cost.label}</dt>
              <dd className="text-text-primary">{formatMoney(cost.value, po.currency)}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-border-default pt-2">
            <dt className="font-semibold text-text-secondary">Total</dt>
            <dd className="text-lg font-bold text-accent-indigo">
              {formatMoney(po.total_amount, po.currency)}
            </dd>
          </div>
        </dl>
      </Card>

      <ApprovalHistory entityType="PO" entityId={po.id} />

      {po.status === 'FINAL_APPROVAL' ? (
        <DecisionPanel entityType="PO" entityId={po.id} onDecided={() => navigate('/approvals')} />
      ) : (
        <Card className="p-6">
          <p className="text-sm text-text-muted">
            This order is {po.status.replace(/_/g, ' ').toLowerCase()} and is not awaiting final
            approval.
          </p>
        </Card>
      )}
    </div>
  );
};
