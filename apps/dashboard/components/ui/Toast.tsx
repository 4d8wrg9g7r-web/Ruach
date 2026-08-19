"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

type ToastVariant = "success" | "error";

interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Errors often need actually reading (a permission error, a validation message) --
// success toasts are just a quick confirmation. Both are also manually dismissable
// below, since a fixed duration with no escape hatch meant a missed error was gone
// for good.
const TOAST_DURATION_MS: Record<ToastVariant, number> = { success: 5000, error: 9000 };
let nextId = 0;

/**
 * Minimal self-contained toast system (no external toast library in this repo yet)
 * -- a context provider + fixed-position stack. Add <ToastProvider> once near the
 * root of whichever layout needs it; call useToast() from any client component
 * underneath.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS[variant]);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              role={toast.variant === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-md border px-4 py-3 text-sm shadow-panel ${
                toast.variant === "success"
                  ? "border-success-bg bg-success-bg text-success"
                  : "border-danger-bg bg-danger-bg text-danger"
              }`}
            >
              {toast.variant === "success" ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
              <span className="flex-1">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className="shrink-0 rounded-sm opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
