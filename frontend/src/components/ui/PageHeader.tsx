import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <div className="animate-fadeIn mb-6 flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 className="text-xl font-bold text-text-primary">{title}</h1>
      {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);
