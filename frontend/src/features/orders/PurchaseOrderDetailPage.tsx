import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, History, Send } from 'lucide-react';
import {
  Button,
  Card,
  PageHeader,
  StatusBadge,
  Timeline,
  useToast,
} from '../../components/ui';
import {
  useGetOrderByIdQuery,
  useSubmitForReviewMutation,
  useSubmitForFinalApprovalMutation,
} from '../../store/api/ordersApi';
import { useGetApprovalsQuery } from '../../store/api/approvalsApi';
import { formatMoney, formatQuantity } from '../../lib/format';
import { apiErrorMessage } from '../../lib/apiError';

export const PurchaseOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: po, isLoading, isError } = useGetOrderByIdQuery(id!, { skip: !id });
  const { data: approvals } = useGetApprovalsQuery(
    { entity_type: 'PO', entity_id: id! },
    { skip: !id },
  );

  const [submitForReview, { isLoading: isSubmittingReview }] = useSubmitForReviewMutation();
  const [submitForFinalApproval, { isLoading: isSubmittingFinal }] = useSubmitForFinalApprovalMutation();

  const isSubmitting = isSubmittingReview || isSubmittingFinal;

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-bg-surface" />;
  }

  if (isError || !po) {
    return (
      <Card className="p-8 text-center">
        <p className="mb-4 text-text-secondary">This purchase order could not be loaded.</p>
        <Button variant="secondary" onClick={() => navigate('/orders')}>
          Back to orders
        </Button>
      </Card>
    );
  }

  const handleSubmitReview = async () => {
    try {
      await submitForReview(po.id).unwrap();
      addToast('success', `${po.po_number} submitted for financial review.`);
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not submit this PO for review.'));
    }
  };

  const handleSubmitFinal = async () => {
    try {
      await submitForFinalApproval(po.id).unwrap();
      addToast('success', `${po.po_number} submitted for final approval.`);
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not submit this PO for final approval.'));
    }
  };

  const timelineEntries = [...(approvals?.results ?? [])]
    .reverse()
    .map((approval) => ({
      id: approval.id,
      action: approval.action,
      actor: approval.approver_name,
      actorRole: approval.role,
      timestamp: approval.created_at,
      comment: approval.comment || undefined,
    }));

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title={po.po_number}
        description="Purchase Order Details"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate('/orders')}
            >
              Back
            </Button>
            {po.status === 'PO_CREATED' && (
              <Button
                icon={<Send className="h-4 w-4" />}
                isLoading={isSubmitting}
                onClick={handleSubmitReview}
              >
                Submit for Review
              </Button>
            )}
            {po.status === 'FINANCIAL_APPROVED' && (
              <Button
                icon={<Send className="h-4 w-4" />}
                isLoading={isSubmitting}
                onClick={handleSubmitFinal}
              >
                Submit Final
              </Button>
            )}
          </div>
        }
      />

      <Card className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <p className="mb-1 text-xs text-text-muted">Status</p>
            <StatusBadge status={po.status} />
          </div>
          <div>
            <p className="text-xs text-text-muted">Supplier</p>
            <p className="text-sm font-medium text-text-primary">{po.supplier_name}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">PR Number</p>
            <p className="text-sm font-medium text-text-primary">{po.pr_number}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Currency</p>
            <p className="text-sm font-medium text-text-primary">{po.currency}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Payment Terms</p>
            <p className="text-sm font-medium text-text-primary">{po.payment_terms || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Delivery Method</p>
            <p className="text-sm font-medium text-text-primary">{po.delivery_method || '—'}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-base font-semibold text-text-primary">Line Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-surface-hover">
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-text-muted">
                  Item
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-text-muted">
                  Description
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-text-muted">
                  Qty
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-text-muted">
                  Unit Price
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
                  <td className="px-4 py-3 text-text-secondary">{line.description || '—'}</td>
                  <td className="px-4 py-3 text-right text-text-primary">
                    {formatQuantity(line.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right text-text-primary">
                    {formatMoney(line.unit_price, po.currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-text-primary">
                    {formatMoney(line.total_price, po.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-sm space-y-2 border-t border-border-default pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span className="font-medium">{formatMoney(po.subtotal, po.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Freight</span>
              <span className="font-medium">{formatMoney(po.freight_cost, po.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Insurance</span>
              <span className="font-medium">{formatMoney(po.insurance_cost, po.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Tax</span>
              <span className="font-medium">{formatMoney(po.tax_amount, po.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-border-default pt-2 text-base font-bold text-accent-indigo">
              <span>Grand Total</span>
              <span>{formatMoney(po.total_amount, po.currency)}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-text-primary">
          <History className="h-4 w-4 text-text-muted" />
          Approval History
        </h3>
        {timelineEntries.length ? (
          <Timeline entries={timelineEntries} />
        ) : (
          <p className="text-sm text-text-muted">
            No approval decisions have been recorded yet.
          </p>
        )}
      </Card>
    </div>
  );
};
