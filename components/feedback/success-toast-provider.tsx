"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastItem = {
  id: number;
  message: string;
};

type SuccessToastContextValue = {
  showSuccess: (message: string) => void;
};

const SuccessToastContext = createContext<SuccessToastContextValue | null>(null);
const TOAST_TIMEOUT_MS = 2600;

export function SuccessToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showSuccess = useCallback((message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_TIMEOUT_MS);
  }, []);

  const contextValue = useMemo<SuccessToastContextValue>(() => ({ showSuccess }), [showSuccess]);

  return (
    <SuccessToastContext.Provider value={contextValue}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col items-end gap-2 px-4 sm:bottom-6 sm:right-6 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto w-full rounded-md border border-emerald-600/40 bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform duration-200 ease-out motion-safe:translate-y-0 motion-safe:opacity-100 motion-reduce:transition-none"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </SuccessToastContext.Provider>
  );
}

export function useSuccessToast(): SuccessToastContextValue {
  const context = useContext(SuccessToastContext);
  if (context) return context;
  return { showSuccess: () => undefined };
}
