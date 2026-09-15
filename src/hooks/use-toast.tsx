'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

interface ToastContextType {
  toast: (options: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastItem = { id, title, description, variant };

    setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Floating Container */}
      <div
        aria-live="assertive"
        className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => {
          const isSuccess = t.variant === 'success';
          const isError = t.variant === 'error';
          const isWarning = t.variant === 'warning';

          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-surface-raised/95 backdrop-blur-md border border-border-medium shadow-2xl text-editorial-body animate-in slide-in-from-bottom-3 duration-200"
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
                {isWarning && <AlertCircle className="w-4 h-4 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-gold" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-editorial-title">{t.title}</p>
                {t.description && (
                  <p className="text-[11px] text-editorial-muted mt-0.5 leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="p-1 rounded text-editorial-faint hover:text-editorial-title transition-colors"
                aria-label="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: () => {},
    };
  }
  return context;
}
