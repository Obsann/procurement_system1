import React, { useId } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            aria-invalid={error ? true : undefined}
            className={cn(
              'w-full appearance-none rounded-lg bg-bg-input border border-border-default',
              'text-text-primary text-sm pl-4 pr-9 py-2 transition-all duration-200',
              'focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/30',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-deep',
              error && 'border-danger focus:border-danger focus:ring-danger/30',
              className,
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        </div>
        {error && (
          <p className="text-xs text-danger flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';
