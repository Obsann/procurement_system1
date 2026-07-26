import React, { useMemo, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';
import { Card } from './Card';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  /** Renders skeleton rows instead of the empty state while a query is in flight. */
  loading?: boolean;
}

/** Interfaces lack index signatures, so field lookups go through this helper. */
const field = <T,>(row: T, key: string): unknown => (row as Record<string, unknown>)[key];

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  pageSize = 10,
  emptyMessage,
  emptyAction,
  loading,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = field(a, sortKey);
      const bv = field(b, sortKey);
      if (av == null && bv == null) return 0;
      if (av == null) return sortDir === 'asc' ? -1 : 1;
      if (bv == null) return sortDir === 'asc' ? 1 : -1;
      // Numeric columns arrive as strings from DRF's DecimalField.
      const an = Number(av as string);
      const bn = Number(bv as string);
      const comparison =
        !Number.isNaN(an) && !Number.isNaN(bn)
          ? an - bn
          : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageData = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const keyFor = (row: T, index: number) => rowKey?.(row) ?? String(field(row, 'id') ?? index);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border-default">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse border-b border-border-default bg-bg-surface last:border-b-0"
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface-hover">
          <AlertCircle className="h-8 w-8 text-text-muted" />
        </div>
        <p className="mb-2 text-text-secondary">{emptyMessage ?? 'No data available'}</p>
        {emptyAction}
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border-default">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-surface-hover">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  className={cn(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted',
                    col.align === 'right' ? 'text-right' : 'text-left',
                    col.sortable && 'cursor-pointer select-none hover:text-text-secondary',
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable &&
                      sortKey === col.key &&
                      (sortDir === 'asc' ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr
                key={keyFor(row, i)}
                className={cn(
                  'border-t border-border-default bg-bg-surface transition-colors hover:bg-bg-surface-hover',
                  onRowClick && 'cursor-pointer',
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'whitespace-nowrap px-4 py-3 text-text-primary',
                      col.align === 'right' && 'text-right',
                    )}
                  >
                    {col.render ? col.render(row, i) : String(field(row, col.key) ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Showing {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of{' '}
            {sorted.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              icon={<ChevronLeft className="h-4 w-4" />}
            >
              Prev
            </Button>
            <span className="text-xs text-text-muted">
              Page {safePage + 1} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(safePage + 1)}
              icon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
