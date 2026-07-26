import React, { type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
    'transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo/50',
    'disabled:pointer-events-none disabled:opacity-50',
  ),
  {
    variants: {
      variant: {
        primary:
          'bg-accent-indigo hover:bg-accent-indigo-hover text-white shadow-sm shadow-accent-indigo/20',
        secondary:
          'bg-bg-surface hover:bg-bg-surface-hover text-text-primary border border-border-default',
        success: 'bg-success/10 hover:bg-success/20 text-success border border-success/30',
        danger: 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30',
        ghost:
          'bg-transparent hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-2.5 text-sm',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, icon, children, disabled, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
