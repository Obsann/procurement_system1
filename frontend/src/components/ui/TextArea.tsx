import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const textAreaId = id ?? generatedId;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textAreaId} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          id={textAreaId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          className={cn(
            'w-full resize-none rounded-lg bg-bg-input border border-border-default',
            'text-text-primary text-sm px-4 py-2 transition-all duration-200',
            'placeholder:text-text-muted',
            'focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/30',
            error && 'border-danger focus:border-danger focus:ring-danger/30',
            className,
          )}
          {...props}
        />
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
TextArea.displayName = 'TextArea';
