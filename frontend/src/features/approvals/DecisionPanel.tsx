import React, { useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { Button, Card, Modal, TextArea, useToast } from '../../components/ui';
import {
  useApproveEntityMutation,
  useRejectEntityMutation,
  useReturnEntityMutation,
  type ApprovalEntityType,
} from '../../store/api/approvalsApi';
import { apiErrorMessage } from '../../lib/apiError';

type Decision = 'approve' | 'return' | 'reject';

const copy: Record<Decision, { title: string; body: string; confirm: string; done: string }> = {
  approve: {
    title: 'Confirm approval',
    body: 'This moves the record forward in the workflow and is recorded against your name.',
    confirm: 'Approve',
    done: 'Approved.',
  },
  return: {
    title: 'Confirm return',
    body: 'This sends the record back for correction. Explain what needs changing so it can be resubmitted.',
    confirm: 'Return',
    done: 'Returned for correction.',
  },
  reject: {
    title: 'Confirm rejection',
    body: 'Rejecting ends this record. It cannot be resubmitted.',
    confirm: 'Reject',
    done: 'Rejected.',
  },
};

interface DecisionPanelProps {
  entityType: ApprovalEntityType;
  entityId: string;
  onDecided?: () => void;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  entityType,
  entityId,
  onDecided,
}) => {
  const { addToast } = useToast();
  const [comment, setComment] = useState('');
  const [pending, setPending] = useState<Decision | null>(null);
  const [commentError, setCommentError] = useState<string>();

  const [approve, { isLoading: approving }] = useApproveEntityMutation();
  const [returnEntity, { isLoading: returning }] = useReturnEntityMutation();
  const [reject, { isLoading: rejecting }] = useRejectEntityMutation();
  const busy = approving || returning || rejecting;

  const open = (decision: Decision) => {
    // Sending something back without saying why leaves the requester guessing.
    if (decision !== 'approve' && !comment.trim()) {
      setCommentError(`A comment is required when you ${decision} a record.`);
      return;
    }
    setCommentError(undefined);
    setPending(decision);
  };

  const confirm = async () => {
    if (!pending) return;
    const run = { approve, return: returnEntity, reject }[pending];
    try {
      await run({ entity_type: entityType, entity_id: entityId, comment: comment.trim() }).unwrap();
      addToast('success', copy[pending].done);
      setPending(null);
      setComment('');
      onDecided?.();
    } catch (error) {
      addToast('error', apiErrorMessage(error, `Could not ${pending} this record.`));
      setPending(null);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-base font-semibold text-text-primary">Your decision</h3>

      <TextArea
        label="Comment"
        rows={4}
        placeholder="Add context for your decision. Required when returning or rejecting."
        value={comment}
        error={commentError}
        onChange={(e) => {
          setComment(e.target.value);
          if (commentError) setCommentError(undefined);
        }}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          variant="success"
          icon={<Check className="h-4 w-4" />}
          disabled={busy}
          onClick={() => open('approve')}
        >
          Approve
        </Button>
        <Button
          variant="secondary"
          icon={<RotateCcw className="h-4 w-4" />}
          disabled={busy}
          onClick={() => open('return')}
        >
          Return for correction
        </Button>
        <Button
          variant="danger"
          icon={<X className="h-4 w-4" />}
          disabled={busy}
          onClick={() => open('reject')}
        >
          Reject
        </Button>
      </div>

      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        title={pending ? copy[pending].title : ''}
        actions={
          <>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button
              variant={pending === 'reject' ? 'danger' : pending === 'approve' ? 'success' : 'secondary'}
              isLoading={busy}
              onClick={confirm}
            >
              {pending ? copy[pending].confirm : ''}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">{pending ? copy[pending].body : ''}</p>
      </Modal>
    </Card>
  );
};
