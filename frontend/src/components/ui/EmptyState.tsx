import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="animate-fadeIn flex flex-col items-center justify-center py-16">
    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border-default bg-bg-surface-hover text-text-muted">
      {icon}
    </div>
    <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
    <p className="mb-6 max-w-sm text-center text-sm text-text-muted">{description}</p>
    {action}
  </div>
);
