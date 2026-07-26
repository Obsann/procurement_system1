import React from 'react';
import { History } from 'lucide-react';
import { Card, Timeline } from '../../components/ui';
import {
  useGetApprovalsQuery,
  type ApprovalEntityType,
} from '../../store/api/approvalsApi';

interface ApprovalHistoryProps {
  entityType: ApprovalEntityType;
  entityId: string;
}

export const ApprovalHistory: React.FC<ApprovalHistoryProps> = ({ entityType, entityId }) => {
  const { data } = useGetApprovalsQuery({ entity_type: entityType, entity_id: entityId });

  // The API orders newest-first; a timeline reads forwards.
  const entries = [...(data?.results ?? [])].reverse().map((approval) => ({
    id: approval.id,
    action: approval.action,
    actor: approval.approver_name,
    actorRole: approval.role,
    timestamp: approval.created_at,
    comment: approval.comment || undefined,
  }));

  return (
    <Card className="p-6">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-text-primary">
        <History className="h-4 w-4 text-text-muted" />
        Approval history
      </h3>
      {entries.length ? (
        <Timeline entries={entries} />
      ) : (
        <p className="text-sm text-text-muted">No approval decisions have been recorded yet.</p>
      )}
    </Card>
  );
};
