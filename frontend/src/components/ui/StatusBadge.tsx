import React from 'react';
import { cn } from '../../lib/cn';

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-text-muted/20 text-text-secondary',
  SUBMITTED: 'bg-info/20 text-info',
  APPROVED: 'bg-success/20 text-success',
  RETURNED: 'bg-warning/20 text-warning',
  REJECTED: 'bg-danger/20 text-danger',
  PROCUREMENT_PROCESSING: 'bg-accent-violet/20 text-accent-violet',

  SENT: 'bg-info/20 text-info',
  RESPONDED: 'bg-accent-violet/20 text-accent-violet',
  CLOSED: 'bg-text-muted/20 text-text-muted',

  PO_CREATED: 'bg-text-secondary/20 text-text-secondary',
  FINANCIAL_REVIEW: 'bg-accent-violet/20 text-accent-violet',
  FINANCIAL_APPROVED: 'bg-accent-indigo/20 text-accent-indigo',
  FINAL_APPROVAL: 'bg-accent-indigo/20 text-accent-indigo',
  PO_APPROVED: 'bg-success/20 text-success',
  PARTIALLY_RECEIVED: 'bg-warning/20 text-warning',
  GOODS_RECEIVED: 'bg-success/20 text-success',

  PARTIAL: 'bg-warning/20 text-warning',
  COMPLETE: 'bg-success/20 text-success',
  ACTIVE: 'bg-success/20 text-success',
  INACTIVE: 'bg-danger/20 text-danger',
  PENDING: 'bg-warning/20 text-warning',
};

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => (
  <span
    className={cn(
      'inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-0.5',
      'text-xs font-semibold uppercase tracking-wide',
      statusStyles[status] ?? 'bg-text-muted/20 text-text-secondary',
      className,
    )}
  >
    {status.replace(/_/g, ' ')}
  </span>
);
