'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { DEFAULT_SELECTIONS } from '@/lib/constants';
import type {
  Audience,
  Depth,
  PresetId,
  Tone,
  TransformResult,
} from '@/lib/types';
import {
  DesktopControlPanel,
  MobileControlBar,
} from '@/components/ControlPanel';
import IngestionPane from '@/components/IngestionPane';
import OutputPane from '@/components/OutputPane';
import ToastBanner, {
  type ToastData,
  type ToastVariant,
} from '@/components/ToastBanner';

const SAMPLE_TEXT = `Quarterly Operations Review — Q3 Summary

During the third quarter, the regional logistics network processed 142,800 shipments across 14 distribution hubs, up 11.4% compared to the same period last year. Average transit time decreased from 3.4 days to 2.9 days after automated route batching was deployed at the Chicago and Dallas facilities on August 12.

However, cold-chain compliance incidents rose slightly from 0.4% to 0.7% in September due to two refrigeration sensor calibration failures in transit corridors serving Phoenix. Maintenance teams replaced the affected telemetry units on September 19, and no further temperature excursions were recorded through the end of the quarter.`;

export default function HomePage() {
  const [sourceText, setSourceText] = useState<string>('');
  const [comparedSourceText, setComparedSourceText] = useState<string>('');
  const [presetId, setPresetId] = useState<PresetId>(DEFAULT_SELECTIONS.presetId);
  const [tone, setTone] = useState<Tone>(DEFAULT_SELECTIONS.tone);
  const [audience, setAudience] = useState<Audience>(DEFAULT_SELECTIONS.audience);
  const [depth, setDepth] = useState<Depth>(DEFAULT_SELECTIONS.depth);
  const [transformResult, setTransformResult] = useState<TransformResult | null>(
    null
  );
  const [isTransforming, setIsTransforming] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const [workspaceSessionKey, setWorkspaceSessionKey] = useState(0);
  const [resultKey, setResultKey] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const toastIdRef = useRef(0);

  const showToast = useCallback(
    (variant: ToastVariant, message: string, duration?: number) => {
      toastIdRef.current += 1;
      setToast({ id: toastIdRef.current, variant, message, duration });
    },
    []
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setIsTransforming(false);
    };
  }, []);

  const handleLoadSample = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsTransforming(false);
    setSourceText(SAMPLE_TEXT);
    setComparedSourceText('');
    setTransformResult(null);
    setWorkspaceSessionKey((prev) => prev + 1);
  };

  const handleResetWorkspace = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsTransforming(false);
    setSourceText('');
    setComparedSourceText('');
    setPresetId(DEFAULT_SELECTIONS.presetId);
    setTone(DEFAULT_SELECTIONS.tone);
    setAudience(DEFAULT_SELECTIONS.audience);
    setDepth(DEFAULT_SELECTIONS.depth);
    setTransformResult(null);
    setWorkspaceSessionKey((prev) => prev + 1);
    dismissToast();
  };

  const handleTransform = useCallback(async () => {
    if (!sourceText.trim()) return;

    // Abort any prior in-flight transformation request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const requestSource = sourceText;
    setIsTransforming(true);

    try {
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText: requestSource,
          presetId,
          tone,
          audience,
          depth,
        }),
        signal: controller.signal,
      });

      let payload: TransformResult;
      try {
        payload = (await response.json()) as TransformResult;
      } catch {
        payload = { ok: false, code: 'unknown', error: 'Network error' };
      }

      if (controller.signal.aborted) return;

      if (payload.ok) {
        setComparedSourceText(requestSource);
        setResultKey((prev) => prev + 1);
      }
      setTransformResult(payload);

      if (!payload.ok) {
        if (payload.code === 'upstream') {
          showToast('error', payload.error);
        } else if (payload.code === 'unknown') {
          // Log-only: never surface raw unknown error strings to the user
          console.error('Transform request returned unknown error code.');
        }
      }
    } catch (err) {
      if (
        controller.signal.aborted ||
        (err instanceof Error && err.name === 'AbortError')
      ) {
        return;
      }
      const networkError: TransformResult = {
        ok: false,
        code: 'unknown',
        error: 'Network error',
      };
      setTransformResult(networkError);
      console.error('Transform request failed due to a network error.');
    } finally {
      if (
        abortControllerRef.current === controller ||
        abortControllerRef.current === null
      ) {
        abortControllerRef.current = null;
        setIsTransforming(false);
      }
    }
  }, [sourceText, presetId, tone, audience, depth, showToast]);

  // Global keyboard shortcut: Cmd/Ctrl + Enter triggers Transform outside dialogs/selects/inputs
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== 'Enter') {
        return;
      }

      const activeEl = document.activeElement;
      if (activeEl) {
        if (activeEl.closest('[role="dialog"]')) return;
        const tag = activeEl.tagName.toLowerCase();
        if (tag === 'select' || tag === 'input') return;
      }

      if (isTransforming || !sourceText.trim()) return;

      event.preventDefault();
      void handleTransform();
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isTransforming, sourceText, handleTransform]);

  const isSourceEmpty = sourceText.trim().length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900">
      {/* Top Bar */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
          >
            Verbatim
          </Link>

          <div className="flex items-center gap-4 sm:gap-5 text-sm font-medium text-zinc-600 shrink-0">
            <button
              type="button"
              onClick={handleLoadSample}
              className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded cursor-pointer"
            >
              Load Sample
            </button>
            <button
              type="button"
              onClick={handleResetWorkspace}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Main Three-Column Workbench */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6 items-stretch">
          <IngestionPane
            key={`ingestion-${workspaceSessionKey}`}
            sourceText={sourceText}
            onSourceTextChange={setSourceText}
          />

          <div
            id="control-rail"
            className="hidden md:flex md:w-[280px] flex-col gap-3"
          >
            <DesktopControlPanel
              presetId={presetId}
              onPresetChange={setPresetId}
              tone={tone}
              onToneChange={setTone}
              audience={audience}
              onAudienceChange={setAudience}
              depth={depth}
              onDepthChange={setDepth}
              onTransform={handleTransform}
              isTransforming={isTransforming}
              isSourceEmpty={isSourceEmpty}
            />
          </div>

          <OutputPane
            key={`output-${workspaceSessionKey}`}
            comparedSourceText={comparedSourceText}
            transformResult={transformResult}
            resultKey={resultKey}
            isTransforming={isTransforming}
            presetId={presetId}
            tone={tone}
            audience={audience}
            depth={depth}
            onNotify={showToast}
          />
        </div>
      </main>

      {/* Mobile Sticky Bottom Control Bar & Focus-Trapped Settings Drawer */}
      <MobileControlBar
        presetId={presetId}
        onPresetChange={setPresetId}
        tone={tone}
        onToneChange={setTone}
        audience={audience}
        onAudienceChange={setAudience}
        depth={depth}
        onDepthChange={setDepth}
        onTransform={handleTransform}
        isTransforming={isTransforming}
        isSourceEmpty={isSourceEmpty}
      />

      {/* Toast Notifications */}
      <ToastBanner toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
