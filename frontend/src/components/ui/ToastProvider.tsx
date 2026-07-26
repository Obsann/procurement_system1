import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { ToastContext, type Toast, type ToastType } from './toast-context';

const TOAST_DURATION_MS = 5000;

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  error: <AlertCircle className="h-5 w-5 text-danger" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" />,
  info: <Info className="h-5 w-5 text-info" />,
};

const styles: Record<ToastType, string> = {
  success: 'border-l-4 border-success bg-success/10',
  error: 'border-l-4 border-danger bg-danger/10',
  warning: 'border-l-4 border-warning bg-warning/10',
  info: 'border-l-4 border-info bg-info/10',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const removeToast = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, type, message }]);
      timers.current.set(
        id,
        setTimeout(() => removeToast(id), TOAST_DURATION_MS),
      );
    },
    [removeToast],
  );

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-50 flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-3"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'animate-slideInRight pointer-events-auto flex items-center gap-3',
              'rounded-xl bg-bg-surface px-4 py-3 shadow-lg',
              styles[toast.type],
            )}
          >
            {icons[toast.type]}
            <span className="flex-1 text-sm text-text-primary">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-text-muted transition-colors hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
