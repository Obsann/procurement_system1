import React, { useState, createContext, useContext } from 'react';
import { X, AlertCircle, CheckCircle2, AlertTriangle, Info, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

// ==================== TOAST SYSTEM ====================
type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: string; type: ToastType; message: string; }
interface ToastContextType { addToast: (type: ToastType, message: string) => void; }

export const ToastContext = createContext<ToastContextType>({ addToast: () => {} });
export const useToast = () => useContext(ToastContext);

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-success" />,
  error: <AlertCircle className="w-5 h-5 text-danger" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning" />,
  info: <Info className="w-5 h-5 text-info" />,
};

const toastColors: Record<ToastType, string> = {
  success: 'border-l-4 border-success bg-success/10',
  error: 'border-l-4 border-danger bg-danger/10',
  warning: 'border-l-4 border-warning bg-warning/10',
  info: 'border-l-4 border-info bg-info/10',
};

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-96">
      {toasts.map((toast) => (
        <div key={toast.id} className={cn('flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-surface shadow-lg animate-slideInRight', toastColors[toast.type])}>
          {toastIcons[toast.type]}
          <span className="text-text-primary text-sm flex-1">{toast.message}</span>
          <button onClick={() => onRemove(toast.id)} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ==================== STATUS BADGE ====================
const statusColors: Record<string, string> = {
  DRAFT: 'bg-text-muted/20 text-text-secondary',
  SUBMITTED: 'bg-info/20 text-info',
  APPROVED: 'bg-success/20 text-success',
  RETURNED: 'bg-warning/20 text-warning',
  REJECTED: 'bg-danger/20 text-danger',
  FINANCIAL_REVIEW: 'bg-accent-violet/20 text-accent-violet',
  FINANCIAL_APPROVED: 'bg-accent-indigo/20 text-accent-indigo',
  FINAL_APPROVAL: 'bg-accent-indigo/20 text-accent-indigo',
  PO_CREATED: 'bg-text-secondary/20 text-text-secondary',
  PO_APPROVED: 'bg-success/20 text-success',
  GOODS_RECEIVED: 'bg-success/20 text-success',
  ACTIVE: 'bg-success/20 text-success',
  INACTIVE: 'bg-danger/20 text-danger',
  PENDING: 'bg-warning/20 text-warning',
  CLOSED: 'bg-text-muted/20 text-text-muted',
  SENT: 'bg-info/20 text-info',
  RESPONDED: 'bg-accent-violet/20 text-accent-violet',
  PARTIAL: 'bg-warning/20 text-warning',
  COMPLETE: 'bg-success/20 text-success',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide', statusColors[status] || 'bg-text-muted/20 text-text-secondary')}>
      {status.replace('_', ' ')}
    </span>
  );
}

// ==================== BUTTON ====================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const buttonVariants: Record<string, string> = {
  primary: 'bg-accent-indigo hover:bg-accent-indigo-hover text-white shadow-sm shadow-accent-indigo/20',
  secondary: 'bg-bg-surface hover:bg-bg-surface-hover text-text-primary border border-border-default',
  danger: 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30',
  ghost: 'bg-transparent hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary',
};

const buttonSizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm',
};

export function Button({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo/50',
        buttonVariants[variant],
        buttonSizes[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

// ==================== FORM INPUT ====================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, helperText, error, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-text-secondary">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</div>}
        <input
          className={cn(
            'w-full rounded-lg bg-bg-input border border-border-default text-text-primary text-sm',
            'placeholder:text-text-muted',
            'focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/30',
            'transition-all duration-200',
            icon ? 'pl-10 pr-4 py-2' : 'px-4 py-2',
            error ? 'border-danger focus:border-danger focus:ring-danger/30' : '',
            props.disabled ? 'opacity-50 cursor-not-allowed bg-bg-deep' : '',
            className
          )}
          {...props}
        />
      </div>
      {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
      {error && <p className="text-xs text-danger flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

// ==================== SELECT ====================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({ label, options, error, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-text-secondary">{label}</label>}
      <select
        className={cn(
          'w-full rounded-lg bg-bg-input border border-border-default text-text-primary text-sm px-4 py-2',
          'focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/30',
          'transition-all duration-200 appearance-none',
          error ? 'border-danger focus:border-danger focus:ring-danger/30' : '',
          props.disabled ? 'opacity-50 cursor-not-allowed bg-bg-deep' : '',
          className
        )}
        {...props}
      >
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="text-xs text-danger flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

// ==================== TEXTAREA ====================
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className, ...props }: TextAreaProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-text-secondary">{label}</label>}
      <textarea
        className={cn(
          'w-full rounded-lg bg-bg-input border border-border-default text-text-primary text-sm px-4 py-2',
          'placeholder:text-text-muted',
          'focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/30',
          'transition-all duration-200 resize-none',
          error ? 'border-danger focus:border-danger focus:ring-danger/30' : '',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

// ==================== CARD ====================
export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-bg-surface rounded-xl border border-border-default', className)} {...props}>
      {children}
    </div>
  );
}

// ==================== KPI CARD ====================
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
}

export function KPICard({ icon, value, label, trend, trendValue }: KPICardProps) {
  const trendIcon = trend === 'up' ? <TrendingUp className="w-4 h-4" /> : trend === 'down' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-muted';

  return (
    <Card className="p-6 flex items-start gap-4 animate-fadeIn">
      <div className="w-10 h-10 rounded-lg bg-accent-indigo/10 flex items-center justify-center text-accent-indigo shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-xs text-text-muted mt-0.5">{label}</p>
      </div>
      <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
        {trendIcon}
        {trendValue}
      </div>
    </Card>
  );
}

// ==================== DATA TABLE ====================
interface Column<T> { key: string; label: string; render?: (row: T, index: number) => React.ReactNode; sortable?: boolean; width?: string; }

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  selected?: string[];
  onSelect?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({ columns, data, selectable, selected = [], onSelect, onRowClick, pageSize = 10, emptyMessage, emptyAction }: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelectAll = () => {
    if (selected.length === pageData.length) onSelect?.([]);
    else onSelect?.(pageData.map(r => r.id));
  };

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) onSelect?.(selected.filter(s => s !== id));
    else onSelect?.([...selected, id]);
  };

  if (data.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-surface-hover flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-text-muted" />
        </div>
        <p className="text-text-secondary mb-2">{emptyMessage || 'No data available'}</p>
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
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input type="checkbox" checked={selected.length === pageData.length && pageData.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded accent-accent-indigo" />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} style={col.width ? { width: col.width } : undefined} className={cn('px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide', col.sortable && 'cursor-pointer hover:text-text-secondary select-none')} onClick={col.sortable ? () => handleSort(col.key) : undefined}>
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr key={row.id} className={cn('border-t border-border-default bg-bg-surface hover:bg-bg-surface-hover transition-colors', onRowClick && 'cursor-pointer')} onClick={() => onRowClick?.(row)}>
                {selectable && (
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleSelect(row.id)} className="w-4 h-4 rounded accent-accent-indigo" />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-text-primary whitespace-nowrap">
                    {col.render ? col.render(row, i) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)} icon={<ChevronLeft className="w-4 h-4" />}>Prev</Button>
            <span className="text-xs text-text-muted">Page {page + 1} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} icon={<ChevronRight className="w-4 h-4" />}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== MODAL ====================
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, actions }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-bg-surface rounded-xl border border-border-default shadow-xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {actions && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-default">{actions}</div>}
      </div>
    </div>
  );
}

// ==================== SIDE DRAWER ====================
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export function Drawer({ open, onClose, title, children, width = '480px' }: DrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="absolute right-0 top-0 bottom-0 bg-bg-surface border-l border-border-default shadow-xl animate-slideInRight overflow-y-auto" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default sticky top-0 bg-bg-surface z-10">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ==================== TIMELINE ====================
interface TimelineEntry { action: string; actor: string; actorRole: string; timestamp: string; comment?: string; }

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="space-y-0">
      {entries.map((entry, i) => (
        <div key={i} className="flex gap-4 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
              entry.action === 'Approved' ? 'bg-success/20 text-success' :
              entry.action === 'Rejected' ? 'bg-danger/20 text-danger' :
              entry.action === 'Returned' ? 'bg-warning/20 text-warning' :
              'bg-accent-indigo/20 text-accent-indigo'
            )}>
              {i + 1}
            </div>
            {i < entries.length - 1 && <div className="w-px flex-1 bg-border-default mt-1" />}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-medium text-text-primary">{entry.action}</p>
            <p className="text-xs text-text-muted mt-0.5">{entry.actor} · {entry.actorRole}</p>
            <p className="text-xs text-text-muted">{new Date(entry.timestamp).toLocaleString()}</p>
            {entry.comment && <p className="text-sm text-text-secondary mt-2 bg-bg-surface-hover rounded-lg px-3 py-2 border border-border-default">{entry.comment}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== EMPTY STATE ====================
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
      <div className="w-20 h-20 rounded-2xl bg-bg-surface-hover border border-border-default flex items-center justify-center text-text-muted mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm text-center mb-6">{description}</p>
      {action}
    </div>
  );
}

// ==================== PAGE HEADER ====================
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{title}</h1>
        {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// ==================== TABS ====================
interface TabItem { key: string; label: string; }

export function Tabs({ tabs, active, onChange }: { tabs: TabItem[]; active: string; onChange: (key: string) => void }) {
  return (
    <div className="flex items-center gap-1 bg-bg-surface rounded-lg border border-border-default p-1">
      {tabs.map((tab) => (
        <button key={tab.key} className={cn('px-4 py-2 rounded-md text-sm font-medium transition-all duration-200', active === tab.key ? 'bg-accent-indigo text-white' : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover')} onClick={() => onChange(tab.key)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
