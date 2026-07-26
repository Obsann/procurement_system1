import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, icon, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</div>
          )}
          <input
            id={inputId}
            type={type}
            aria-invalid={error ? true : undefined}
            className={cn(
              'w-full rounded-lg bg-bg-input border border-border-default text-text-primary text-sm',
              'placeholder:text-text-muted transition-all duration-200',
              'focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/30',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-deep',
              icon ? 'pl-10 pr-4 py-2' : 'px-4 py-2',
              error && 'border-danger focus:border-danger focus:ring-danger/30',
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
        {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
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
Input.displayName = 'Input';
