import React from 'react';
import { cn } from '../../lib/cn';
import { formatRole } from '../../lib/user';
import { type Role } from '../../types';

export interface TimelineEntry {
  id: string;
  action: string;
  actor: string;
  actorRole?: string;
  timestamp: string;
  comment?: string;
}

const actionStyles: Record<string, string> = {
  APPROVE: 'bg-success/20 text-success',
  REJECT: 'bg-danger/20 text-danger',
  RETURN: 'bg-warning/20 text-warning',
};

export const Timeline: React.FC<{ entries: TimelineEntry[] }> = ({ entries }) => (
  <ol className="space-y-0">
    {entries.map((entry, i) => (
      <li key={entry.id} className="flex gap-4 pb-6 last:pb-0">
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
              actionStyles[entry.action] ?? 'bg-accent-indigo/20 text-accent-indigo',
            )}
          >
            {i + 1}
          </div>
          {i < entries.length - 1 && <div className="mt-1 w-px flex-1 bg-border-default" />}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium capitalize text-text-primary">
            {entry.action.toLowerCase()}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            {entry.actor}
            {entry.actorRole ? ` · ${formatRole(entry.actorRole as Role)}` : ''}
          </p>
          <p className="text-xs text-text-muted">{new Date(entry.timestamp).toLocaleString()}</p>
          {entry.comment && (
            <p className="mt-2 rounded-lg border border-border-default bg-bg-surface-hover px-3 py-2 text-sm text-text-secondary">
              {entry.comment}
            </p>
          )}
        </div>
      </li>
    ))}
  </ol>
);
