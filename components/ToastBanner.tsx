'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export type ToastVariant = 'success' | 'error';

export interface ToastData {
  id: number;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastBannerProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

const DEFAULT_DURATION_MS: Record<ToastVariant, number> = {
  success: 2500,
  error: 6000,
};

export default function ToastBanner({ toast, onDismiss }: ToastBannerProps) {
  useEffect(() => {
    if (!toast) return;
    const timeoutMs = toast.duration ?? DEFAULT_DURATION_MS[toast.variant];
    if (timeoutMs <= 0) return;

    const timer = window.setTimeout(() => {
      onDismiss();
    }, timeoutMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast, onDismiss]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-20 left-4 right-4 sm:left-auto md:bottom-6 md:right-6 z-50 flex max-w-sm flex-col gap-2"
    >
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            role={toast.variant === 'error' ? 'alert' : 'status'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs shadow-md ${
              toast.variant === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-950'
                : 'border-[#DFE2DC] bg-white text-[#141715]'
            }`}
          >
            {toast.variant === 'error' ? (
              <AlertCircle
                className="h-4 w-4 shrink-0 text-rose-700 mt-0.5"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-[#0D5C63] mt-0.5"
                aria-hidden="true"
              />
            )}
            <span className="flex-1 leading-snug font-medium">{toast.message}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={onDismiss}
              className="shrink-0 rounded p-0.5 text-[#646D66] hover:bg-[#ECEEE9] hover:text-[#141715] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C63] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
