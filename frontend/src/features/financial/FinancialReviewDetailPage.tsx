import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import {
  Button,
  Card,
  PageHeader,
  StatusBadge,
  Select,
  TextArea,
  useToast,
} from '../../components/ui';
import { useGetOrderByIdQuery } from '../../store/api/ordersApi';
import { useSubmitFinancialReviewMutation } from '../../store/api/financialReviewsApi';
import { formatMoney, formatQuantity, toNumber } from '../../lib/format';
import { apiErrorMessage } from '../../lib/apiError';

export const FinancialReviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: order, isLoading, isError } = useGetOrderByIdQuery(id!, { skip: !id });
  const [submitReview, { isLoading: isSubmitting }] = useSubmitFinancialReviewMutation();

  const [decision, setDecision] = useState<'APPROVED' | 'RETURNED' | ''>('');
  const [comments, setComments] = useState('');

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-bg-surface" />;
  }

  if (isError || !order) {
    return (
      <Card className="p-8 text-center">
        <p className="mb-4 text-text-secondary">This order could not be loaded.</p>
        <Button variant="secondary" onClick={() => navigate('/financial-review')}>
          Back to financial review
        </Button>
      </Card>
    );
  }

  const handleSubmit = async () => {
    if (!decision) {
      addToast('error', 'Please select a decision.');
      return;
    }
    if (decision === 'RETURNED' && !comments.trim()) {
      addToast('error', 'Comments are required when returning for correction.');
      return;
    }

    try {
      await submitReview({
        purchase_order: id!,
        decision: decision as 'APPROVED' | 'RETURNED',
        comments: comments.trim() || undefined,
      }).unwrap();
      addToast('success', `Financial review submitted for ${order.po_number}.`);
      navigate('/financial-review');
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not submit review.'));
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title={`Review ${order.po_number}`}
        description="Review purchase order for financial compliance"
        actions={
          <Button
            variant="ghost"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/financial-review')}
          >
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-4 p-6">
            <h3 className="text-base font-semibold text-text-primary">Order Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-xs text-text-muted">Supplier</p>
                <p className="text-sm font-medium text-text-primary">{order.supplier_name}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-text-muted">Status</p>
                <StatusBadge status={order.status} />
              </div>
              <div>
                <p className="text-xs text-text-muted">PR Number</p>
                <p className="text-sm font-medium text-text-primary">{order.pr_number}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Delivery Method</p>
                <p className="text-sm font-medium text-text-primary">{order.delivery_method || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-text-muted">Notes</p>
                <p className="text-sm text-text-secondary">{order.notes || '—'}</p>
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
                  {order.lines.map((line) => (
                    <tr key={line.id} className="border-t border-border-default">
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {line.item_name}
                        {line.description && (
                          <p className="mt-0.5 text-xs font-normal text-text-secondary">
                            {line.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-text-primary">
                        {formatQuantity(line.quantity)}
                      </td>
                      <td className="px-4 py-3 text-right text-text-primary">
                        {formatMoney(line.unit_price, order.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-text-primary">
                        {formatMoney(line.total_price, order.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4 text-base font-semibold text-text-primary">Cost Breakdown</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-medium text-text-primary">
                  {formatMoney(order.subtotal, order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Freight</span>
                <span className="font-medium text-text-primary">
                  {formatMoney(order.freight_cost, order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Insurance</span>
                <span className="font-medium text-text-primary">
                  {formatMoney(order.insurance_cost, order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax</span>
                <span className="font-medium text-text-primary">
                  {formatMoney(order.tax_amount, order.currency)}
                </span>
              </div>
              <div className="my-2 border-t border-border-default" />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-text-primary">Grand Total</span>
                <span className="font-bold text-accent-indigo">
                  {formatMoney(order.total_amount, order.currency)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-base font-semibold text-text-primary">Decision</h3>
            <div className="space-y-4">
              <Select
                label="Action"
                value={decision}
                onChange={(e) => setDecision(e.target.value as 'APPROVED' | 'RETURNED')}
                options={[
                  { value: '', label: 'Select action...' },
                  { value: 'APPROVED', label: 'Approve' },
                  { value: 'RETURNED', label: 'Return for Correction' },
                ]}
              />

              <TextArea
                label={decision === 'RETURNED' ? 'Comments (Required)' : 'Comments (Optional)'}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any notes about this review..."
                rows={4}
              />

              <Button
                className="w-full"
                isLoading={isSubmitting}
                onClick={handleSubmit}
                disabled={!decision}
                icon={
                  decision === 'APPROVED' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : decision === 'RETURNED' ? (
                    <XCircle className="h-4 w-4" />
                  ) : undefined
                }
                variant={decision === 'RETURNED' ? 'danger' : 'primary'}
              >
                Submit Review
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
