import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, History, Send } from 'lucide-react';
import {
  Button,
  Card,
  PageHeader,
  StatusBadge,
  Timeline,
  useToast,
} from '../../components/ui';
import {
  useGetRequisitionByIdQuery,
  useSubmitRequisitionMutation,
} from '../../store/api/requisitionsApi';
import { useGetApprovalsQuery } from '../../store/api/approvalsApi';
import { formatDate, formatMoney, formatQuantity, toNumber } from '../../lib/format';
import { apiErrorMessage } from '../../lib/apiError';

export const RequisitionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: pr, isLoading, isError } = useGetRequisitionByIdQuery(id!, { skip: !id });
  const { data: approvals } = useGetApprovalsQuery(
    { entity_type: 'PR', entity_id: id! },
    { skip: !id },
  );
  const [submitRequisition, { isLoading: isSubmitting }] = useSubmitRequisitionMutation();

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-bg-surface" />;
  }

  if (isError || !pr) {
    return (
      <Card className="p-8 text-center">
        <p className="mb-4 text-text-secondary">This requisition could not be loaded.</p>
        <Button variant="secondary" onClick={() => navigate('/requisitions')}>
          Back to requisitions
        </Button>
      </Card>
    );
  }

  const handleSubmit = async () => {
    try {
      await submitRequisition(pr.id).unwrap();
      addToast('success', `${pr.pr_number} submitted for approval.`);
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not submit this requisition.'));
    }
  };

  // History is newest-first from the API; a timeline reads better oldest-first.
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
        title={pr.pr_number}
        description={pr.title}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate('/requisitions')}
            >
              Back
            </Button>
            {pr.status === 'DRAFT' && (
              <>
                <Button
                  variant="secondary"
                  icon={<Edit3 className="h-4 w-4" />}
                  onClick={() => navigate(`/requisitions/${pr.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  icon={<Send className="h-4 w-4" />}
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                >
                  Submit for approval
                </Button>
              </>
            )}
          </div>
        }
      />

      <Card className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
            <p className="text-xs text-text-muted">Required by</p>
            <p className="text-sm font-medium text-text-primary">
              {formatDate(pr.required_delivery_date)}
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
                <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">
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

      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-text-primary">
          <History className="h-4 w-4 text-text-muted" />
          Approval history
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
