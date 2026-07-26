import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, PageHeader, StatusBadge } from '../../components/ui';
import { useGetRequisitionByIdQuery } from '../../store/api/requisitionsApi';
import { formatDate, formatMoney, formatQuantity, toNumber } from '../../lib/format';
import { daysWaiting } from './useDaysWaiting';
import { ApprovalHistory } from './ApprovalHistory';
import { DecisionPanel } from './DecisionPanel';

export const RequisitionReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pr, isLoading, isError } = useGetRequisitionByIdQuery(id!, { skip: !id });

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-bg-surface" />;

  if (isError || !pr) {
    return (
      <Card className="p-8 text-center">
        <p className="mb-4 text-text-secondary">This requisition could not be loaded.</p>
        <Button variant="secondary" onClick={() => navigate('/approvals')}>
          Back to approvals
        </Button>
      </Card>
    );
  }

  const waiting = daysWaiting(pr.submitted_at ?? pr.created_at);
  const decidable = pr.status === 'SUBMITTED';

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title={pr.pr_number}
        description={pr.title}
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div>
            <p className="mb-1 text-xs text-text-muted">Status</p>
            <StatusBadge status={pr.status} />
          </div>
          <div>
            <p className="text-xs text-text-muted">Requester</p>
            <p className="text-sm font-medium text-text-primary">{pr.requester_name}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Department</p>
            <p className="text-sm font-medium text-text-primary">{pr.department_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Submitted</p>
            <p className="text-sm font-medium text-text-primary">
              {formatDate(pr.submitted_at)}
              {waiting > 0 && (
                <span className="ml-1 text-text-muted">({waiting}d ago)</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Total</p>
            <p className="text-sm font-bold text-accent-indigo">
              {formatMoney(pr.total_estimated_amount, pr.currency)}
            </p>
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs text-text-muted">Description</p>
          <p className="text-sm text-text-secondary">{pr.description}</p>
        </div>
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
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-text-muted">
                  Description
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
              {pr.lines.map((line) => (
                <tr key={line.id} className="border-t border-border-default">
                  <td className="px-4 py-3 font-medium text-text-primary">{line.item_name}</td>
                  <td className="px-4 py-3 text-text-secondary">{line.description || '—'}</td>
                  <td className="px-4 py-3 text-right text-text-primary">
                    {formatQuantity(line.quantity)} {line.unit_of_measure}
                  </td>
                  <td className="px-4 py-3 text-right text-text-primary">
                    {formatMoney(line.estimated_unit_price, pr.currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-accent-indigo">
                    {formatMoney(
                      toNumber(line.estimated_total) ||
                        toNumber(line.quantity) * toNumber(line.estimated_unit_price),
                      pr.currency,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border-default">
                <td
                  colSpan={4}
                  className="px-4 py-3 text-right text-sm font-semibold text-text-secondary"
                >
                  Total estimated
                </td>
                <td className="px-4 py-3 text-right text-lg font-bold text-accent-indigo">
                  {formatMoney(pr.total_estimated_amount, pr.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <ApprovalHistory entityType="PR" entityId={pr.id} />

      {decidable ? (
        <DecisionPanel entityType="PR" entityId={pr.id} onDecided={() => navigate('/approvals')} />
      ) : (
        <Card className="p-6">
          <p className="text-sm text-text-muted">
            This requisition is {pr.status.replace(/_/g, ' ').toLowerCase()} and is no longer
            awaiting a decision.
          </p>
        </Card>
      )}
    </div>
  );
};
