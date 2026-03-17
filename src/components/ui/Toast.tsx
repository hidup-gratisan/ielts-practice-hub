/**
 * Toast notification system for admin dashboard feedback.
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

let _globalAddToast: ToastContextValue['addToast'] | null = null;

/** Fire-and-forget toast from outside React tree */
export function toast(message: string, type: Toast['type'] = 'success', duration = 3000) {
  _globalAddToast?.(message, type, duration);
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success', duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    _globalAddToast = addToast;
    return () => { _globalAddToast = null; };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => (
  <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '320px' }}>
    {toasts.map((t) => (
      <ToastItem key={t.id} toast={t} onRemove={onRemove} />
    ))}
  </div>
);

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const colors = {
    success: 'bg-emerald-900/95 border-emerald-600/50 text-emerald-200',
    error: 'bg-red-900/95 border-red-600/50 text-red-200',
    info: 'bg-blue-900/95 border-blue-600/50 text-blue-200',
  };

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  return (
    <div
      className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-sm transition-all duration-300 ${colors[toast.type]}`}
      style={{
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{icons[toast.type]}</span>
        <p className="text-xs font-bold">{toast.message}</p>
      </div>
    </div>
  );
};
