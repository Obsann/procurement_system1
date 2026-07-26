import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void;
}

export const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);
