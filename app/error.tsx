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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 text-zinc-900">
      <div
        role="alert"
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 flex flex-col gap-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle
            className="h-5 w-5 shrink-0 text-rose-600 mt-0.5"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-base font-semibold tracking-tight text-zinc-900">
              Something went wrong
            </h1>
            <p className="text-sm text-zinc-600 leading-relaxed">
              The workspace encountered an unexpected error. Your unsaved input may need to be re-entered after reloading.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Try again</span>
        </button>
      </div>
    </div>
  );
}
