'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('Unhandled application error:', error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F1] px-4 text-[#141715]">
      <div
        role="alert"
        className="w-full max-w-md rounded-xl border border-[#DFE2DC] bg-white p-6 flex flex-col gap-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle
            className="h-5 w-5 shrink-0 text-rose-700 mt-0.5"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-base font-semibold tracking-tight text-[#141715]">
              Something went wrong
            </h1>
            <p className="text-sm text-[#4A524C] leading-relaxed">
              The workspace encountered an unexpected error. Your unsaved input may need to be re-entered after reloading.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0D5C63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#09454A] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C63] focus-visible:ring-offset-2 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Try again</span>
        </button>
      </div>
    </div>
  );
}
