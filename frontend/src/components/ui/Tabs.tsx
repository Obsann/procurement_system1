import React from 'react';
import { cn } from '../../lib/cn';

export interface TabItem {
  key: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange }) => (
  <div
    role="tablist"
    className="inline-flex items-center gap-1 rounded-lg border border-border-default bg-bg-surface p-1"
  >
    {tabs.map((tab) => (
      <button
        key={tab.key}
        type="button"
        role="tab"
        aria-selected={active === tab.key}
        onClick={() => onChange(tab.key)}
        className={cn(
          'rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
          active === tab.key
            ? 'bg-accent-indigo text-white'
            : 'text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary',
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
