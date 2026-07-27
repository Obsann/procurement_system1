import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileCheck, Plus, Send } from 'lucide-react';
import {
  Button,
  Card,
  PageHeader,
  StatusBadge,
  useToast,
} from '../../components/ui';
import {
  useCloseRFQMutation,
  useGetRFQByIdQuery,
  useSendRFQMutation,
} from '../../store/api/rfqApi';
import { useGetBidsQuery } from '../../store/api/bidsApi';
import { useGenerateOrderFromBidMutation } from '../../store/api/ordersApi';
import { formatDate, formatQuantity } from '../../lib/format';
import { apiErrorMessage } from '../../lib/apiError';
import { BidComparison } from './BidComparison';
import { BidFormDrawer } from './BidFormDrawer';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
    <p className="mt-1 text-sm text-text-primary">{children}</p>
  </div>
);

export const RFQDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: rfq, isLoading } = useGetRFQByIdQuery(id!, { skip: !id });
  const { data: bidData } = useGetBidsQuery(id ? { rfq: id } : undefined, { skip: !id });

  const [sendRFQ, { isLoading: isSending }] = useSendRFQMutation();
  const [closeRFQ, { isLoading: isClosing }] = useCloseRFQMutation();
  const [generateOrder, { isLoading: isGenerating }] = useGenerateOrderFromBidMutation();

  const bids = bidData?.results ?? [];
  const winner = bids.find((bid) => bid.is_winner);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-bg-surface" />;
  }

  if (!rfq) {
    return (
      <Card className="p-8 text-center">
        <p className="mb-4 text-text-secondary">That RFQ could not be found.</p>
        <Button variant="secondary" onClick={() => navigate('/rfqs')}>
          Back to list
        </Button>
      </Card>
    );
  }

  const run = async (
    action: () => Promise<unknown>,
    success: string,
    failure: string,
  ) => {
    try {
      await action();
      addToast('success', success);
    } catch (error) {
      addToast('error', apiErrorMessage(error, failure));
    }
  };

  const onGenerateOrder = async () => {
    if (!winner) return;
    try {
      const order = await generateOrder(winner.id).unwrap();
      addToast('success', `${order.po_number} created from the winning quotation.`);
      navigate('/purchase-orders');
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not generate a purchase order.'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={rfq.rfq_number}
        description={rfq.title}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate('/rfqs')}
            >
              Back
            </Button>
            {rfq.status === 'DRAFT' ? (
              <Button
                icon={<Send className="h-4 w-4" />}
                loading={isSending}
                onClick={() =>
                  run(
                    () => sendRFQ(rfq.id).unwrap(),
                    'RFQ sent to the invited suppliers.',
                    'Could not send this RFQ.',
                  )
                }
              >
                Send to suppliers
              </Button>
            ) : null}
            {rfq.status === 'RESPONDED' ? (
              <Button
                variant="secondary"
                loading={isClosing}
                onClick={() =>
                  run(
                    () => closeRFQ(rfq.id).unwrap(),
                    'RFQ closed.',
                    'Could not close this RFQ.',
                  )
                }
              >
                Close RFQ
              </Button>
            ) : null}
            {rfq.status !== 'CLOSED' ? (
              <Button
                variant="secondary"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setDrawerOpen(true)}
              >
                Record quotation
              </Button>
            ) : null}
            {winner ? (
              <Button
                icon={<FileCheck className="h-4 w-4" />}
                loading={isGenerating}
                onClick={onGenerateOrder}
              >
                Generate purchase order
              </Button>
            ) : null}
          </div>
        }
      />

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <StatusBadge status={rfq.status} />
          <span className="text-sm text-text-muted">Created {formatDate(rfq.created_at)}</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Submission deadline">{formatDate(rfq.submission_deadline)}</Field>
          <Field label="Invited suppliers">
            {rfq.invited_suppliers.length
              ? rfq.invited_suppliers.map((s) => s.supplier_name).join(', ')
              : 'None'}
          </Field>
          <Field label="Quotations received">{bids.length}</Field>
        </div>
        {rfq.description ? (
          <div className="mt-4">
            <Field label="Description">{rfq.description}</Field>
          </div>
        ) : null}
        {rfq.instructions ? (
          <div className="mt-4">
            <Field label="Instructions">{rfq.instructions}</Field>
          </div>
        ) : null}
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-border-default px-6 py-4">
          <h3 className="text-base font-semibold text-text-primary">Requested items</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default bg-bg-subtle">
              <th className="px-6 py-3 text-left font-medium text-text-secondary">Item</th>
              <th className="px-6 py-3 text-left font-medium text-text-secondary">Description</th>
              <th className="px-6 py-3 text-right font-medium text-text-secondary">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {rfq.lines.map((line) => (
              <tr key={line.id} className="border-b border-border-subtle last:border-0">
                <td className="px-6 py-3 font-medium text-text-primary">{line.item_name}</td>
                <td className="px-6 py-3 text-text-secondary">{line.description || '—'}</td>
                <td className="px-6 py-3 text-right text-text-primary">
                  {formatQuantity(line.quantity)} {line.unit_of_measure}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <BidComparison rfq={rfq} bids={bids} />

      <BidFormDrawer
        rfq={rfq}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        quotedSupplierIds={bids.map((bid) => bid.supplier)}
      />
    </div>
  );
};
