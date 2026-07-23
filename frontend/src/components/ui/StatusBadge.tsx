import React from 'react';
import { cn } from '../layout/Sidebar';

export interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeClass = (s: string) => {
    switch (s) {
      case 'DRAFT': return 'badge-draft';
      case 'SUBMITTED': return 'badge-submitted';
      case 'APPROVED': return 'badge-approved';
      case 'RETURNED': return 'badge-returned';
      case 'REJECTED': return 'badge-rejected';
      case 'PROCUREMENT_PROCESSING': return 'badge-processing';
      case 'PO_CREATED': return 'badge-po-created';
      case 'FINANCIAL_REVIEW': return 'badge-financial-review';
      case 'PO_APPROVED': return 'badge-po-approved';
      case 'GOODS_RECEIVED': return 'badge-goods-received';
      default: return 'badge-draft';
    }
  };

  const getLabel = (s: string) => {
    return s.replace(/_/g, ' ');
  };

  return (
    <span className={cn(
      "px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm capitalize whitespace-nowrap",
      getBadgeClass(status)
    )}>
      {getLabel(status)}
    </span>
  );
};
